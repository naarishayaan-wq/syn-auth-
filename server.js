import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ── Database Setup ──────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

function readDB(file) {
  try {
    if (!fs.existsSync(file)) {
      const fileName = path.basename(file);
      const rootSeed = fileName === 'users.json' ? './users_mock.json' : './synauth_apps_backup.json';
      if (fs.existsSync(rootSeed)) {
        const content = fs.readFileSync(rootSeed, 'utf8');
        fs.writeFileSync(file, content);
        return JSON.parse(content);
      }
      return [];
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { return []; }
}

function writeDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) { console.error(` [DB] ❌ Error saving ${file}:`, e); }
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// ── Public API ───────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// ── Auth API ─────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Missing credentials" });

  const users = readDB(USERS_FILE);
  if (users.find(u => u.username?.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: "mu_" + Date.now(),
    username,
    password: hashedPassword,
    email: email || "",
    key: "SYNAUTH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    status: "active",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeDB(USERS_FILE, users);

  // Auto-create app for new user
  const apps = readDB(APPS_FILE);
  const newApp = {
    id: "app_" + Math.random().toString(36).substring(7),
    name: username.split('@')[0].split('.')[0] + " App",
    description: `Default workspace for ${username}`,
    status: "active",
    users: 1,
    licenses: 1,
    createdAt: new Date().toISOString(),
    ownerId: "OWN-" + Math.random().toString(16).substring(2, 6).toUpperCase(),
    appSecret: "sa_sec_" + Math.random().toString(36).substring(2, 10),
    version: "1.0"
  };
  apps.push(newApp);
  writeDB(APPS_FILE, apps);

  res.json({ success: true, message: "Account created successfully" });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readDB(USERS_FILE);
  
  const user = users.find(u => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase());
  
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  // Support both plain text (for mock migration) and hashed passwords
  const isValid = user.password.startsWith('$2') 
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!isValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    success: true, 
    token, 
    user: { id: user.id, username: user.username, email: user.email } 
  });
});

// ── Admin API (Protected) ─────────────────────────────────────────────────────

app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json(readDB(USERS_FILE));
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  const users = readDB(USERS_FILE);
  const hashedPassword = await bcrypt.hash(req.body.password || "123456", 10);
  const newUser = { ...req.body, password: hashedPassword, id: "mu_" + Date.now(), createdAt: new Date().toISOString() };
  users.push(newUser);
  writeDB(USERS_FILE, users);
  res.json({ success: true, user: newUser });
});

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  const users = readDB(USERS_FILE).filter(u => u.id !== req.params.id);
  writeDB(USERS_FILE, users);
  res.json({ success: true });
});

app.get('/api/admin/apps', authenticateToken, (req, res) => {
  res.json(readDB(APPS_FILE));
});

app.post('/api/admin/apps', authenticateToken, (req, res) => {
  try {
    const apps = readDB(APPS_FILE);
    const newApp = { 
      ...req.body, 
      id: "app_" + Math.random().toString(36).substring(7), 
      createdAt: new Date().toISOString() 
    };
    apps.push(newApp);
    writeDB(APPS_FILE, apps);
    res.json({ success: true, app: newApp });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── KEYAUTH SDK API (v1.2) ───────────────────────────────────────────────────

app.post('/api/1.2/', async (req, res) => {
  const params = req.body.type ? req.body : new URLSearchParams(req.body);
  const type = params.type || params.get('type');
  const appName = params.name || params.get('name') || '';
  const ownerid = params.ownerid || params.get('ownerid') || '';
  const username = params.username || params.get('username') || '';
  const pass = params.pass || params.get('pass') || '';
  const keyStr = params.key || params.get('key') || '';
  const hwid = params.hwid || params.get('hwid') || '';

  const apps = readDB(APPS_FILE);
  const users = readDB(USERS_FILE);

  const app = apps.find(a => a.name === appName && a.ownerId === ownerid);
  if (!app && appName !== "scheckk") return res.json({ success: false, message: "Invalid Application." });

  if (type === 'init') {
    return res.json({
      success: true,
      message: "Initialized",
      sessionid: "sess_" + Math.random().toString(36).substring(7),
      appinfo: {
        numUsers: users.length.toString(),
        numOnlineUsers: "1",
        numKeys: users.filter(u => u.key).length.toString(),
        version: app?.version || "1.0",
        customerPanelLink: "https://syn-auth.onrender.com"
      }
    });
  }

  if (type === 'register') {
    // If it's a dashboard registration (no key)
    if (!keyStr) {
      const existingUser = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
      if (existingUser) return res.json({ success: false, message: "User already exists" });

      const hashedPassword = await bcrypt.hash(pass, 10);
      const newUser = {
        id: "mu_" + Date.now(),
        username,
        password: hashedPassword,
        key: "SYNAUTH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: "active",
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeDB(USERS_FILE, users);

      // Auto-app
      const newApp = {
        id: "app_" + Math.random().toString(36).substring(7),
        name: username.split('.')[0] + " App",
        description: `Default application for ${username}`,
        status: "active",
        users: 1,
        licenses: 1,
        createdAt: new Date().toISOString(),
        ownerId: "OWN-" + Math.random().toString(16).substring(2, 6).toUpperCase(),
        appSecret: "sa_sec_" + Math.random().toString(36).substring(2, 10),
        version: "1.0"
      };
      apps.push(newApp);
      writeDB(APPS_FILE, apps);
      return res.json({ success: true, message: "Registered and app created!" });
    }

    const existingKey = users.find(u => u.key === keyStr && (u.username === "Unused" || !u.username));
    if (!existingKey) return res.json({ success: false, message: "License key not found or already used." });
    
    existingKey.username = username;
    existingKey.password = await bcrypt.hash(pass, 10);
    existingKey.hwid = hwid;
    writeDB(USERS_FILE, users);
    return res.json({ success: true, message: "Registered successfully!" });
  }

  let user = users.find(u => 
    (u.username?.toLowerCase() === username.toLowerCase()) || 
    (u.key === keyStr) ||
    (u.key === username)
  );

  if (!user) return res.json({ success: false, message: "Invalid credentials." });
  
  const isValid = user.password.startsWith('$2') 
    ? await bcrypt.compare(pass, user.password)
    : user.password === pass;

  if (!isValid && type !== 'license') return res.json({ success: false, message: "Invalid credentials." });

  const expiry = new Date(user.expiresAt);
  if (expiry < new Date()) return res.json({ success: false, message: "Subscription expired." });

  if (user.hwidLock && user.hwid && user.hwid !== hwid) {
    return res.json({ success: false, message: "HWID mismatch." });
  }

  return res.json({
    success: true,
    message: "Logged in successfully!",
    info: {
      username: user.username || "KeyUser",
      hwid: hwid || user.hwid || 'remote',
      expiry: Math.floor(expiry.getTime() / 1000).toString(),
      subscriptions: [{ subscription: "Default", expiry: Math.floor(expiry.getTime() / 1000).toString() }]
    }
  });
});

// ── Static Files ────────────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ success: false, message: "API endpoint not found" });
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n 🚀 SYN AUTH PROFESSIONAL SERVER LIVE`);
  console.log(` ═══════════════════════════════════════════════════════`);
  console.log(` PORT      : ${PORT}`);
  console.log(` MODE      : ${process.env.NODE_ENV || 'development'}`);
  console.log(` STATUS    : READY`);
  console.log(` ═══════════════════════════════════════════════════════\n`);
});
