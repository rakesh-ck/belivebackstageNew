import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "believe_backstage_secret_key_123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "believe_backstage_refresh_secret_456";

// StartServer
async function startServer() {
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
      
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const clientNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const userId = uuidv4();
      
      const newUser = {
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

      await setDoc(doc(db, "users", userId), newUser);

      const accessToken = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: newUser.id }, REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const userDoc = await getDoc(doc(db, "users", req.user.id));
      if (!userDoc.exists()) return res.sendStatus(404);
      
      const user = userDoc.data();
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
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

      await setDoc(doc(db, "releases", releaseId), newRelease);
      res.status(201).json(newRelease);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create release" });
    }
  });

  app.get("/api/releases/:id", authenticateToken, async (req, res) => {
    try {
      const releaseDoc = await getDoc(doc(db, "releases", req.params.id));
      if (!releaseDoc.exists()) return res.status(404).json({ error: "Release not found" });
      res.json(releaseDoc.data());
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch release" });
    }
  });

  // Catalog Endpoints
  app.get("/api/catalog", authenticateToken, async (req: any, res) => {
    try {
      const { status, search, page = 1, limit = 20 } = req.query;
      
      let q = query(collection(db, "releases"), where("userId", "==", req.user.id));
      
      if (status && status !== 'all') {
        q = query(q, where("status", "==", status));
      }
      
      const querySnapshot = await getDocs(q);
      let filtered = querySnapshot.docs.map(doc => doc.data());
      
      if (search) {
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes((search as string).toLowerCase())
        );
      }

      const total = filtered.length;
      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit);
      const items = filtered.slice(start, end);

      res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch catalog" });
    }
  });

  app.get("/api/catalog/:id", authenticateToken, async (req, res) => {
    try {
      const releaseDoc = await getDoc(doc(db, "releases", req.params.id));
      if (!releaseDoc.exists()) return res.status(404).json({ error: "Release not found" });
      
      // Fetch tracks subcollection
      const tracksSnapshot = await getDocs(collection(db, "releases", req.params.id, "tracks"));
      const tracks = tracksSnapshot.docs.map(doc => doc.data());

      res.json({ ...releaseDoc.data(), tracks, territories: [] });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch catalog details" });
    }
  });

  // Notifications Endpoints
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const q = query(collection(db, "notifications"), where("userId", "in", [req.user.id, 'all']));
      const querySnapshot = await getDocs(q);
      const userNotifications = querySnapshot.docs.map(doc => doc.data());
      
      res.json(userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
    try {
      const q = query(collection(db, "notifications"), where("userId", "in", [req.user.id, 'all']), where("read", "==", false));
      const querySnapshot = await getDocs(q);
      
      const promises = querySnapshot.docs.map(d => updateDoc(doc(db, "notifications", d.id), { read: true }));
      await Promise.all(promises);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update notifications" });
    }
  });

  app.get("/api/notifications/count", authenticateToken, async (req: any, res) => {
    try {
      const q = query(collection(db, "notifications"), where("userId", "in", [req.user.id, 'all']), where("read", "==", false));
      const querySnapshot = await getDocs(q);
      res.json({ count: querySnapshot.size });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notification count" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
