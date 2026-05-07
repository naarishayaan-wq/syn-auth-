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

const USERS_FILE = path.join(__dirname, 'users_mock.json');

function getLocalUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

// ── KEYAUTH API MOCK ─────────────────────────────────────────────────────────

app.post('/api/1.2/', (req, res) => {
  const params = new URLSearchParams(req.body);
  const type = params.get('type');
  const username = params.get('username') || '';
  const pass = params.get('pass') || '';
  const key = params.get('key') || '';
  const email = params.get('email') || '';

  console.log(` [API] 📥 Request: ${type} | User: ${username}`);

  let users = getLocalUsers();

  if (type === 'init') {
    return res.json({
      success: true,
      message: "Initialized",
      sessionid: "sess_" + Math.random().toString(36).substring(7),
      info: {
        numUsers: users.length.toString(),
        numOnlineUsers: "1",
        numKeys: "100",
        version: "1.0",
        customerPanelLink: "https://syn-auth.onrender.com"
      }
    });
  }

  if (type === 'register') {
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) return res.json({ success: false, message: "User already exists." });
    
    const newUser = {
      id: "mu_" + Date.now(),
      username,
      password: pass,
      email,
      key: "SYNAUTH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      hwidLock: false,
      status: "active",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveLocalUsers(users);
    return res.json({ success: true, message: "Registered successfully!" });
  }

  // Find user
  let user = (username.toLowerCase() === 'admin' && pass === 'admin')
    ? { username: 'admin', password: 'admin', status: 'active', expiresAt: '2030-01-01T00:00:00Z' }
    : (type === 'login' 
        ? users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass)
        : users.find(u => u.key === key));

  if (!user && type === 'login') {
    user = users.find(u => u.key === username);
  }

  if (user) {
    return res.json({
      success: true,
      message: "Logged in successfully!",
      info: {
        username: user.username,
        ip: req.ip,
        hwid: params.get('hwid') || 'remote_hwid',
        createdate: Math.floor(new Date(user.createdAt || Date.now()).getTime() / 1000).toString(),
        lastlogin: Math.floor(Date.now() / 1000).toString(),
        expiry: Math.floor(new Date(user.expiresAt).getTime() / 1000).toString(),
        subscriptions: [
          { subscription: "Default", key: user.key || "SYNAUTH-KEY", expiry: Math.floor(new Date(user.expiresAt).getTime() / 1000).toString(), timeleft: "86400" }
        ]
      }
    });
  }

  res.json({ success: false, message: "Invalid username or password." });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n 🚀 SYN AUTH Production Server Live`);
  console.log(` 📍 Endpoint: http://localhost:${PORT}/api/1.2/`);
});
