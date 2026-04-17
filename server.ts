import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

// Load Firebase Config
let firebaseConfig: any;
try {
  const configPath = new URL('./firebase-applet-config.json', import.meta.url);
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    throw new Error('Config file missing');
  }
} catch (e) {
  // Fallback to Env Vars for Vercel/Production
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || '(default)'
  };
}

if (!firebaseConfig.projectId) {
  console.error("CRITICAL: Firebase Project ID is missing. Check your environment variables.");
}

admin.initializeApp({
  projectId: firebaseConfig.projectId
});

const db = admin.firestore(firebaseConfig.firestoreDatabaseId);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "believe_backstage_secret_key_123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "believe_backstage_refresh_secret_456";

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeRole = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Believe Backstage API is running" });
});

// Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const querySnapshot = await db.collection("users").where("email", "==", email).get();
    
    if (!querySnapshot.empty) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const clientNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const userId = uuidv4();
    
    const newUser: any = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: role || 'artist',
      clientNumber,
      isVerified: false,
      promotionSetupDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection("users").doc(userId).set(newUser);

    const accessToken = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: newUser.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: true, // Always secure for Vercel/Cloud
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, accessToken });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const querySnapshot = await db.collection("users").where("email", "==", email).get();

    if (querySnapshot.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.id).get();
    if (!userDoc.exists) return res.sendStatus(404);
    
    const user = userDoc.data();
    const { password: _, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Auth Me Error:", err);
    res.sendStatus(500);
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: "Logged out successfully" });
});

// Release Endpoints
app.post("/api/releases", authenticateToken, async (req: any, res) => {
  try {
    const { type, genre, title, containsExistingTrack } = req.body;
    const releaseId = uuidv4();
    
    const newRelease = {
      id: releaseId,
      userId: req.user.id,
      title,
      type: type || 'audio',
      genre: genre || 'any',
      distributionType: 'digital',
      status: 'draft',
      containsExistingTrack: containsExistingTrack || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection("releases").doc(releaseId).set(newRelease);
    res.status(201).json(newRelease);
  } catch (err) {
    console.error("Create Release Error:", err);
    res.status(500).json({ error: "Failed to create release" });
  }
});

app.get("/api/releases/:id", authenticateToken, async (req, res) => {
  try {
    const releaseDoc = await db.collection("releases").doc(req.params.id).get();
    if (!releaseDoc.exists) return res.status(404).json({ error: "Release not found" });
    res.json(releaseDoc.data());
  } catch (err) {
    console.error("Fetch Release Error:", err);
    res.status(500).json({ error: "Failed to fetch release" });
  }
});

// Catalog Endpoints
app.get("/api/catalog", authenticateToken, async (req: any, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    let queryRef: any = db.collection("releases").where("userId", "==", req.user.id);
    
    if (status && status !== 'all') {
      queryRef = queryRef.where("status", "==", status);
    }
    
    const querySnapshot = await queryRef.get();
    let filtered = querySnapshot.docs.map((doc: any) => doc.data());
    
    if (search) {
      filtered = filtered.filter((r: any) => 
        r.title.toLowerCase().includes((search as string).toLowerCase())
      );
    }

    const total = filtered.length;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const items = filtered.slice(start, end);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error("Fetch Catalog Error:", err);
    res.status(500).json({ error: "Failed to fetch catalog" });
  }
});

app.get("/api/catalog/:id", authenticateToken, async (req, res) => {
  try {
    const releaseDoc = await db.collection("releases").doc(req.params.id).get();
    if (!releaseDoc.exists) return res.status(404).json({ error: "Release not found" });
    
    // Fetch tracks subcollection
    const tracksSnapshot = await db.collection("releases").doc(req.params.id).collection("tracks").get();
    const tracks = tracksSnapshot.docs.map((doc: any) => doc.data());

    res.json({ ...releaseDoc.data(), tracks, territories: [] });
  } catch (err) {
    console.error("Fetch Catalog Detail Error:", err);
    res.status(500).json({ error: "Failed to fetch catalog details" });
  }
});

// Notifications Endpoints
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  try {
    const querySnapshot = await db.collection("notifications").where("userId", "in", [req.user.id, 'all']).get();
    const userNotifications = querySnapshot.docs.map((doc: any) => doc.data());
    
    res.json(userNotifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.put("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
  try {
    const querySnapshot = await db.collection("notifications").where("userId", "in", [req.user.id, 'all']).where("read", "==", false).get();
    
    const batch = db.batch();
    querySnapshot.docs.forEach((d: any) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
    
    res.json({ success: true });
  } catch (err) {
    console.error("Read All notifications error:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

app.get("/api/notifications/count", authenticateToken, async (req: any, res) => {
  try {
    const querySnapshot = await db.collection("notifications").where("userId", "in", [req.user.id, 'all']).where("read", "==", false).get();
    res.json({ count: querySnapshot.size });
  } catch (err) {
    console.error("Notification count error:", err);
    res.status(500).json({ error: "Failed to fetch notification count" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Local listen logic
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for Vercel
export default app;
