import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { URLSearchParams } from "url";
import fs from "fs";

const MOCK_DB = path.resolve("./users_mock.json");

function getLocalUsers() {
  try {
    if (fs.existsSync(MOCK_DB)) return JSON.parse(fs.readFileSync(MOCK_DB, "utf-8"));
  } catch (e) { console.error("DB Read Error", e); }
  return [];
}

function saveLocalUsers(users: any[]) {
  try {
    fs.writeFileSync(MOCK_DB, JSON.stringify(users, null, 2));
  } catch (e) { console.error("DB Write Error", e); }
}

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "keyauth-mock",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.includes("/api/1.2/") && req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => {
              try {
                // Ensure body is not empty
                if (!body) {
                   res.end(JSON.stringify({ success: false, message: "Empty request body" }));
                   return;
                }

                const params = new URLSearchParams(body);
                const type = params.get("type");
                const username = (params.get("username") || "").trim();
                const pass = (params.get("pass") || "").trim();
                const key = (params.get("key") || "").trim();
                const appName = params.get("name") || "Default App";
                const ownerId = params.get("ownerid") || "OWN-1234";

                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                
                // Load apps and users
                let apps = [];
                try {
                  apps = JSON.parse(fs.readFileSync("./synauth_apps_backup.json", "utf-8") || "[]");
                } catch (e) { apps = []; }

                let currentApp = apps.find((a: any) => a.name === appName && a.ownerId === ownerId);

                // LOCAL DEV LENIENCY: If no exact match, just use the first app available
                if (!currentApp && apps.length > 0) {
                  currentApp = apps[0];
                  console.log(` [MOCK] 🛠️  Auto-matched to app: ${currentApp.name}`);
                }

                console.log(` [${new Date().toLocaleTimeString()}] 🟢 Request: ${type.toUpperCase()} | App: ${appName} | User: ${username || "N/A"} | Pass: ${pass || "N/A"} | Key: ${key || "N/A"}`);

                if (type === "init") {
                  const users = getLocalUsers();
                  res.end(JSON.stringify({ 
                    success: true, 
                    message: "Initialized",
                    sessionid: "local_session_" + Math.random().toString(36).substring(7), 
                    appinfo: { 
                        version: currentApp?.version || "1.0", 
                        numUsers: users.length.toString(), 
                        numOnlineUsers: "1", 
                        developer_mode: "0",
                        name: currentApp?.name || "Mock App"
                    } 
                  }));
                } 
                else if (type === "sync") {
                  try {
                    const usersRaw = params.get("users");
                    const users = JSON.parse(usersRaw || "[]");
                    saveLocalUsers(users);
                    
                    const appsRaw = params.get("apps");
                    if (appsRaw) {
                      fs.writeFileSync("./synauth_apps_backup.json", appsRaw);
                    }
                    
                    console.log(` [MOCK] 🔄 Synced ${users.length} users and ${JSON.parse(appsRaw || "[]").length} apps.`);
                    res.end(JSON.stringify({ success: true, message: "Synced successfully" }));
                  } catch (e) {
                    res.end(JSON.stringify({ success: false, message: "Sync failed" }));
                  }
                }
                else if (type === "login" || type === "license") {
                  const users = getLocalUsers();
                  
                  if (type === "login" && (username === "" || pass === "")) {
                    res.end(JSON.stringify({ success: false, message: "Username and password cannot be empty." }));
                    return;
                  }

                  if (type === "register") {
                    const exists = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
                    if (exists) {
                      res.end(JSON.stringify({ success: false, message: "User already exists." }));
                      return;
                    }
                    const newUser = {
                      id: "mu_" + Date.now(),
                      username,
                      password: pass || "",
                      email: email || "",
                      key: "SYNAUTH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
                      hwidLock: false,
                      hwid: null,
                      status: "active",
                      createdAt: new Date().toISOString()
                    };
                    users.push(newUser);
                    saveLocalUsers(users);
                    console.log(` [MOCK] 🆕 Registered User: ${username}`);
                    res.end(JSON.stringify({ success: true, message: "Registered successfully!" }));
                    return;
                  }

                  // Find user:
                  let user = (username.toLowerCase() === "admin" && pass === "admin")
                    ? { username: "admin", password: "admin", status: "active", expiresAt: "2030-01-01T00:00:00Z" }
                    : (type === "login" 
                        ? users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && (u.password || "") === pass)
                        : users.find((u: any) => u.key === key && key !== ""));

                  if (!user && type === "login") {
                     user = users.find((u: any) => u.key === username);
                  }
                  
                  if (user) {
                    if ((user as any).status === "paused") {
                      res.end(JSON.stringify({ success: false, message: "Your account is currently paused." }));
                      return;
                    }

                  // HWID Locking Logic
                    const hwid = params.get("hwid") || "unknown";
                    if ((user as any).hwidLock) {
                      if (!(user as any).hwid) {
                        (user as any).hwid = hwid;
                        saveLocalUsers(users);
                        console.log(` [MOCK] 🔐 Registered HWID for ${user.username}: ${hwid}`);
                      } else if ((user as any).hwid !== hwid) {
                        console.warn(` [MOCK] ❌ HWID Mismatch for ${user.username}: expected ${(user as any).hwid}, got ${hwid}`);
                        res.end(JSON.stringify({ success: false, message: "HWID Mismatch. Locked to another device." }));
                        return;
                      }
                    }
                    
                    console.log(` [MOCK] ✅ ${type.toUpperCase()} Success: ${user.username}`);
                    res.end(JSON.stringify({ 
                      success: true, 
                      message: "Logged in successfully!",
                      info: { 
                        username: user.username, 
                        ip: "127.0.0.1", 
                        hwid: params.get("hwid") || "local_hwid", 
                        createdate: Math.floor(Date.now() / 1000 - 86400).toString(), 
                        lastlogin: Math.floor(Date.now() / 1000).toString(), 
                        expiry: Math.floor(new Date(user.expiresAt).getTime() / 1000).toString(),
                        subscriptions: [
                          { subscription: "Default", key: (user as any).key || "SYNAUTH-KEY", expiry: Math.floor(new Date(user.expiresAt).getTime() / 1000).toString(), timeleft: "86400" }
                        ]
                      } 
                    }));
                  } else {
                    console.warn(` [MOCK] ❌ ${type.toUpperCase()} Failed: ${type === "login" ? username : key} (Invalid credentials)`);
                    res.end(JSON.stringify({ success: false, message: type === "login" ? "Invalid username or password." : "Invalid license key." }));
                  }
                } else {
                  res.end(JSON.stringify({ success: false, message: "Type not supported in local mock." }));
                }
              } catch (e) {
                console.error(" [MOCK] Error:", e);
                res.end(JSON.stringify({ success: false, message: "Server error in mock API." }));
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    watch: {
      ignored: ["**/users_mock.json", "**/synauth_apps_backup.json"],
    },
  },
});