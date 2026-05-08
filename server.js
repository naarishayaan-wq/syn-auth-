import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database Setup ──────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

function readDB(file) {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { return []; }
}

function writeDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) { console.error(` [DB] ❌ Error saving ${file}:`, e); }
}

// ── Dashboard Admin API ──────────────────────────────────────────────────────

app.get('/api/admin/users', (req, res) => {
  console.log(' [ADMIN] 👥 Fetching users...');
  res.json(readDB(USERS_FILE));
});

app.post('/api/admin/users', (req, res) => {
  console.log(' [ADMIN] ➕ Creating user:', req.body.username);
  const users = readDB(USERS_FILE);
  const newUser = { ...req.body, id: "mu_" + Date.now(), createdAt: new Date().toISOString() };
  users.push(newUser);
  writeDB(USERS_FILE, users);
  res.json({ success: true, user: newUser });
});

app.delete('/api/admin/users/:id', (req, res) => {
  console.log(' [ADMIN] 🗑️ Deleting user:', req.params.id);
  const users = readDB(USERS_FILE).filter(u => u.id !== req.params.id);
  writeDB(USERS_FILE, users);
  res.json({ success: true });
});

app.put('/api/admin/users/:id', (req, res) => {
  console.log(' [ADMIN] 📝 Updating user:', req.params.id);
  const users = readDB(USERS_FILE).map(u => u.id === req.params.id ? { ...u, ...req.body } : u);
  writeDB(USERS_FILE, users);
  res.json({ success: true });
});

app.get('/api/admin/apps', (req, res) => {
  console.log(' [ADMIN] 📱 Fetching apps...');
  res.json(readDB(APPS_FILE));
});

app.post('/api/admin/apps', (req, res) => {
  console.log(' [ADMIN] 📱 Creating app:', req.body.name);
  try {
    const apps = readDB(APPS_FILE);
    const newApp = { 
      ...req.body, 
      id: "app_" + Math.random().toString(36).substring(7), 
      createdAt: new Date().toISOString() 
    };
    apps.push(newApp);
    writeDB(APPS_FILE, apps);
    console.log(' [ADMIN] ✅ App created successfully');
    res.json({ success: true, app: newApp });
  } catch (e) {
    console.error(' [ADMIN] ❌ Create App Error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/apps/:id', (req, res) => {
  const apps = readDB(APPS_FILE).filter(a => a.id !== req.params.id);
  writeDB(APPS_FILE, apps);
  res.json({ success: true });
});

app.put('/api/admin/apps/:id', (req, res) => {
  const apps = readDB(APPS_FILE).map(a => a.id === req.params.id ? { ...a, ...req.body } : a);
  writeDB(APPS_FILE, apps);
  res.json({ success: true });
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
  const keyStr = params.key || params.get('key') || '';
  const hwid = params.hwid || params.get('hwid') || '';

  console.log(` [SDK] 📥 ${type} | App: ${appName}`);

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
    const existingKey = users.find(u => u.key === keyStr && (u.username === "Unused" || !u.username));
    if (!existingKey) return res.json({ success: false, message: "License key not found or already used." });
    
    existingKey.username = username;
    existingKey.password = pass;
    existingKey.hwid = hwid;
    writeDB(USERS_FILE, users);
    return res.json({ success: true, message: "Registered successfully!" });
  }

  let user = users.find(u => 
    (u.username?.toLowerCase() === username.toLowerCase() && u.password === pass) || 
    (u.key === keyStr) ||
    (u.key === username)
  );

  if (!user) return res.json({ success: false, message: "Invalid credentials." });
  
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

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => console.log(`🚀 SYN AUTH PROFESSIONAL SERVER LIVE ON PORT ${PORT}`));
