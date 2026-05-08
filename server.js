import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

// ── Database Helpers ─────────────────────────────────────────────────────────

function readDB(file) {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { return []; }
}

function writeDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) { console.error(`Error saving ${file}:`, e); }
}

// ── Dashboard Admin API ──────────────────────────────────────────────────────

app.get('/api/admin/users', (req, res) => res.json(readDB(USERS_FILE)));
app.post('/api/admin/users', (req, res) => {
  const users = readDB(USERS_FILE);
  const newUser = { ...req.body, id: "mu_" + Date.now(), createdAt: new Date().toISOString() };
  users.push(newUser);
  writeDB(USERS_FILE, users);
  res.json({ success: true, user: newUser });
});
app.delete('/api/admin/users/:id', (req, res) => {
  const users = readDB(USERS_FILE).filter(u => u.id !== req.params.id);
  writeDB(USERS_FILE, users);
  res.json({ success: true });
});
app.put('/api/admin/users/:id', (req, res) => {
  const users = readDB(USERS_FILE).map(u => u.id === req.params.id ? { ...u, ...req.body } : u);
  writeDB(USERS_FILE, users);
  res.json({ success: true });
});

app.get('/api/admin/apps', (req, res) => res.json(readDB(APPS_FILE)));
app.post('/api/admin/apps', (req, res) => {
  const apps = readDB(APPS_FILE);
  const newApp = { ...req.body, id: "app_" + Date.now(), createdAt: new Date().toISOString() };
  apps.push(newApp);
  writeDB(APPS_FILE, apps);
  res.json({ success: true, app: newApp });
});

// ── KEYAUTH SDK API (v1.2) ───────────────────────────────────────────────────

app.post('/api/1.2/', (req, res) => {
  const params = req.body.type ? req.body : new URLSearchParams(req.body);
  const type = params.type || params.get('type');
  const appName = params.name || params.get('name') || '';
  const ownerid = params.ownerid || params.get('ownerid') || '';
  const secret = params.secret || params.get('secret') || '';
  const username = params.username || params.get('username') || '';
  const pass = params.pass || params.get('pass') || '';
  const key = params.key || params.get('key') || '';
  const hwid = params.hwid || params.get('hwid') || '';

  const apps = readDB(APPS_FILE);
  const users = readDB(USERS_FILE);

  // 1. Find and Verify Application
  const app = apps.find(a => a.name === appName && a.ownerId === ownerid);
  
  if (!app && appName !== "scheckk") { // Allow the default seeded app name for safety
    return res.json({ success: false, message: "Application not found or invalid Owner ID." });
  }

  // 2. Secret Validation (for Init)
  if (type === 'init') {
    if (app && app.appSecret !== secret && appName !== "scheckk") {
       return res.json({ success: false, message: "Invalid Application Secret." });
    }

    console.log(` [SDK] ⚙️ App Init: ${appName}`);
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

  // 3. Auth Logic
  let user = users.find(u => 
    (u.username?.toLowerCase() === username.toLowerCase() && u.password === pass) || 
    (u.key === key) ||
    (u.key === username)
  );

  // Hardcoded Admin for testing
  if (!user && username.toLowerCase() === 'admin' && pass === 'admin') {
     user = { username: 'admin', status: 'active', expiresAt: '2030-01-01T00:00:00Z' };
  }

  if (!user) {
    return res.json({ success: false, message: "Invalid credentials or license key." });
  }

  // 4. Status and HWID Checks
  if (user.status === 'paused') return res.json({ success: false, message: "Account is paused." });
  
  const now = new Date();
  const expiry = new Date(user.expiresAt);
  if (expiry < now) return res.json({ success: false, message: "Subscription has expired." });

  if (user.hwidLock) {
    if (!user.hwid) {
      user.hwid = hwid;
      writeDB(USERS_FILE, users);
    } else if (user.hwid !== hwid) {
      return res.json({ success: false, message: "HWID mismatch. Locked to another device." });
    }
  }

  console.log(` [SDK] ✅ ${type} SUCCESS: ${user.username}`);
  return res.json({
    success: true,
    message: "Logged in successfully!",
    info: {
      username: user.username || "KeyUser",
      hwid: hwid || user.hwid || 'remote',
      expiry: Math.floor(expiry.getTime() / 1000).toString(),
      createdate: Math.floor(new Date(user.createdAt || now).getTime() / 1000).toString(),
      subscriptions: [{ subscription: "Default", expiry: Math.floor(expiry.getTime() / 1000).toString() }]
    }
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n 🚀 SYN AUTH SERVER LIVE`);
  console.log(` 📍 API Endpoint: http://localhost:${PORT}/api/1.2/`);
});
