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

  console.log(` [API] 📥 ${new Date().toISOString()} | Type: ${type} | User/Key: ${username || key}`);

  let users = getLocalUsers();

  if (type === 'sync') {
    try {
      const usersData = params.get('users');
      if (usersData) {
        const syncedUsers = JSON.parse(usersData);
        saveLocalUsers(syncedUsers);
        console.log(` [API] 🔄 SUCCESS: Synced ${syncedUsers.length} users from dashboard.`);
      }
      return res.json({ success: true, message: "Synchronized successfully." });
    } catch (e) {
      console.error(` [API] ❌ SYNC ERROR:`, e.message);
      return res.json({ success: false, message: "Sync failed: " + e.message });
    }
  }

  if (type === 'init') {
    console.log(` [API] ⚙️ Initializing app: ${params.get('name')}`);
    return res.json({
      success: true,
      message: "Initialized",
      sessionid: "sess_" + Math.random().toString(36).substring(7),
      appinfo: {
        numUsers: users.length.toString(),
        numOnlineUsers: "1",
        numKeys: "100",
        version: "1.0",
        customerPanelLink: "https://syn-auth.onrender.com"
      }
    });
  }

  if (users.length === 0 && username.toLowerCase() !== 'admin') {
    console.warn(` [API] ⚠️ ALERT: Database is empty. Please open the dashboard to sync users.`);
    return res.json({ success: false, message: "Server database is empty. Administrator needs to sync dashboard." });
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
    console.log(` [API] ✅ Registered new user: ${username}`);
    return res.json({ success: true, message: "Registered successfully!" });
  }

  // Find user
  let user = (username.toLowerCase() === 'admin' && pass === 'admin')
    ? { username: 'admin', password: 'admin', status: 'active', expiresAt: '2030-01-01T00:00:00Z' }
    : (type === 'login' 
        ? users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass)
        : users.find(u => u.key === key));

  if (!user && type === 'login') {
    // Check if logging in with key as username
    user = users.find(u => u.key === username);
  }

  if (user) {
    // 1. Check account status
    if (user.status === 'paused') {
      console.log(` [API] 🚫 Login denied: Account paused for ${user.username}`);
      return res.json({ success: false, message: "Your account is paused. Contact support." });
    }

    // 2. Check HWID Lock
    const clientHwid = params.get('hwid');
    if (user.hwidLock) {
      if (!user.hwid && clientHwid) {
        user.hwid = clientHwid;
        saveLocalUsers(users);
        console.log(` [API] 🔐 HWID Registered for user: ${user.username}`);
      } else if (user.hwid && user.hwid !== clientHwid) {
        console.log(` [API] 🚫 HWID MISMATCH for user: ${user.username}`);
        return res.json({ success: false, message: "HWID mismatch. Locked to another device." });
      }
    }

    // 3. Check Expiry
    const now = new Date();
    const expiry = new Date(user.expiresAt || Date.now());
    if (expiry < now) {
      console.log(` [API] ⌛ Expiry denied for user: ${user.username}`);
      return res.json({ success: false, message: "Your subscription has expired." });
    }

    console.log(` [API] 🔓 SUCCESS: User ${user.username} logged in.`);
    return res.json({
      success: true,
      message: "Logged in successfully!",
      sessionid: "sess_" + Math.random().toString(36).substring(7),
      info: {
        username: user.username || "KeyUser",
        ip: req.ip,
        hwid: clientHwid || user.hwid || 'remote_hwid',
        createdate: Math.floor(new Date(user.createdAt || Date.now()).getTime() / 1000).toString(),
        lastlogin: Math.floor(Date.now() / 1000).toString(),
        expiry: Math.floor(expiry.getTime() / 1000).toString(),
        subscriptions: [
          { subscription: "Default", key: user.key || "SYNAUTH-KEY", expiry: Math.floor(expiry.getTime() / 1000).toString(), timeleft: Math.floor((expiry.getTime() - now.getTime()) / 1000).toString() }
        ]
      }
    });
  }

  console.log(` [API] ❌ Login failed for: ${username || key}`);
  res.json({ success: false, message: "Invalid credentials or key." });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n 🚀 SYN AUTH Production Server Live`);
  console.log(` 📍 Endpoint: http://localhost:${PORT}/api/1.2/`);
});
