import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import fs from 'fs';
import cookieParser from 'cookie-parser';

dotenv.config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'believe_backstage',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "believe_backstage_secret_key_123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "believe_backstage_refresh_secret_456";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

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
    
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const clientNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const userId = uuidv4();
    
    await pool.execute(
      'INSERT INTO users (id, name, email, password, role, clientNumber) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role || 'artist', clientNumber]
    );

    const accessToken = jwt.sign({ id: userId, role: role || 'artist' }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({ 
      user: { id: userId, name, email, role: role || 'artist', clientNumber }, 
      accessToken 
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const users = rows as any[];

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
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
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const users = rows as any[];
    if (users.length === 0) return res.sendStatus(404);
    
    const { password: _, ...userWithoutPassword } = users[0];
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Auth Me Error:", err);
    res.sendStatus(500);
  }
});

app.get("/api/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload: any = jwt.verify(refreshToken, REFRESH_SECRET);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [payload.id]);
    const users = rows as any[];
    
    if (users.length === 0) return res.sendStatus(401);
    const user = users[0];

    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, accessToken });
  } catch (err) {
    res.sendStatus(403);
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
    
    await pool.execute(
      'INSERT INTO releases (id, userId, title, type, genre, containsExistingTrack) VALUES (?, ?, ?, ?, ?, ?)',
      [releaseId, req.user.id, title, type || 'audio', genre || 'any', containsExistingTrack || false]
    );

    res.status(201).json({ id: releaseId, title, userId: req.user.id });
  } catch (err) {
    console.error("Create Release Error:", err);
    res.status(500).json({ error: "Failed to create release" });
  }
});

app.get("/api/releases/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM releases WHERE id = ?', [req.params.id]);
    const releases = rows as any[];
    if (releases.length === 0) return res.status(404).json({ error: "Release not found" });
    res.json(releases[0]);
  } catch (err) {
    console.error("Fetch Release Error:", err);
    res.status(500).json({ error: "Failed to fetch release" });
  }
});

// Rights Issues Endpoints
app.get("/api/rights-issues", authenticateToken, async (req: any, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM rights_issues WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch Rights Issues Error:", err);
    res.status(500).json({ error: "Failed to fetch rights issues" });
  }
});

// Analytics Endpoints
app.get("/api/analytics/summary", authenticateToken, async (req: any, res) => {
  try {
    const [releaseRows] = await pool.execute('SELECT COUNT(*) as count FROM releases WHERE userId = ?', [req.user.id]);
    const [deliveredRows] = await pool.execute('SELECT COUNT(*) as count FROM releases WHERE userId = ? AND status = "delivered"', [req.user.id]);
    const [rightsRows] = await pool.execute('SELECT COUNT(*) as count FROM rights_issues WHERE userId = ? AND status != "resolved"', [req.user.id]);
    
    res.json({
      totalStreams: "1.2M", 
      activeReleases: (releaseRows as any[])[0].count,
      deliveredReleases: (deliveredRows as any[])[0].count,
      pendingRights: (rightsRows as any[])[0].count,
      royalties: "$4,520",
      trends: {
        streams: "+12.5%",
        releases: `+${(releaseRows as any[])[0].count}`,
        royalties: "+8.4%"
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get("/api/analytics/trends", authenticateToken, async (req: any, res) => {
  try {
    const data = [
      { date: '2024-03-01', streams: 12000, views: 8000, revenue: 45 },
      { date: '2024-03-02', streams: 15000, views: 9000, revenue: 52 },
      { date: '2024-03-03', streams: 18000, views: 9500, revenue: 61 },
      { date: '2024-03-04', streams: 16000, views: 8200, revenue: 55 },
      { date: '2024-03-05', streams: 21000, views: 11000, revenue: 78 },
      { date: '2024-03-06', streams: 25000, views: 13000, revenue: 92 },
      { date: '2024-03-07', streams: 23000, views: 12000, revenue: 85 },
    ];
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

// Catalog Endpoints
app.get("/api/catalog", authenticateToken, async (req: any, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM releases WHERE userId = ?';
    const params: any[] = [req.user.id];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      sql += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    const [allRows] = await pool.query(sql, params);
    const total = (allRows as any[]).length;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const offset = (pageNum - 1) * limitNum;
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    // Use pool.query for LIMIT/OFFSET placeholders compatibility
    const [rows] = await pool.query(sql, params);

    res.json({ 
      items: rows, 
      total, 
      page: pageNum, 
      totalPages: Math.ceil(total / limitNum) 
    });
  } catch (err) {
    console.error("Fetch Catalog Error:", err);
    res.status(500).json({ error: "Failed to fetch catalog" });
  }
});

app.get("/api/catalog/:id", authenticateToken, async (req, res) => {
  try {
    const [releaseRows] = await pool.execute('SELECT * FROM releases WHERE id = ?', [req.params.id]);
    const releases = releaseRows as any[];
    if (releases.length === 0) return res.status(404).json({ error: "Release not found" });
    
    const [trackRows] = await pool.execute('SELECT * FROM tracks WHERE releaseId = ? ORDER BY trackNumber ASC', [req.params.id]);

    res.json({ ...releases[0], tracks: trackRows, territories: [] });
  } catch (err) {
    console.error("Fetch Catalog Detail Error:", err);
    res.status(500).json({ error: "Failed to fetch catalog details" });
  }
});

// Tracks Endpoints
app.post("/api/releases/:id/tracks", authenticateToken, async (req: any, res) => {
  try {
    const { title, artistName, isrc, duration } = req.body;
    const releaseId = req.params.id;
    const trackId = uuidv4();

    // Get current track count for trackNumber
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM tracks WHERE releaseId = ?', [releaseId]);
    const trackNumber = ((rows as any[])[0].count || 0) + 1;

    await pool.execute(
      'INSERT INTO tracks (id, releaseId, title, artist, isrc, duration, trackNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [trackId, releaseId, title, artistName, isrc || '', duration || 0, trackNumber]
    );

    res.status(201).json({ id: trackId, title, trackNumber });
  } catch (err) {
    console.error("Create Track Error:", err);
    res.status(500).json({ error: "Failed to add track" });
  }
});

// Notifications Endpoints
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE userId = ? OR userId = "all" ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.put("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET `read` = TRUE WHERE (userId = ? OR userId = "all") AND `read` = FALSE',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Read All notifications error:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

app.get("/api/notifications/count", authenticateToken, async (req: any, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE (userId = ? OR userId = "all") AND `read` = FALSE',
      [req.user.id]
    );
    res.json({ count: (rows as any[])[0].count });
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
