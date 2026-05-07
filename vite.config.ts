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
  base: "/syn-auth-/",
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
                const params = new URLSearchParams(body);
                const type = params.get("type");
                const username = params.get("username");
                const pass = params.get("pass");

                res.setHeader("Content-Type", "application/json");
                console.log(`\n [${new Date().toLocaleTimeString()}] 🟢 Request: ${type} | User: ${username || "N/A"}`);

                if (type === "init") {
                  const users = getLocalUsers();
                  res.end(JSON.stringify({ 
                    success: true, 
                    message: "Initialized",
                    sessionid: "local_session", 
                    appinfo: { version: "1.0", numUsers: users.length.toString(), numOnlineUsers: "1", developer_mode: "0" } 
                  }));
                } 
                else if (type === "sync") {
                  try {
                    const usersRaw = params.get("users");
                    const users = JSON.parse(usersRaw || "[]");
                    saveLocalUsers(users);
                    console.log(` [MOCK] Synced ${users.length} users to database.`);
                    res.end(JSON.stringify({ success: true, message: "Synced " + users.length + " users" }));
                  } catch (e) {
                    res.end(JSON.stringify({ success: false }));
                  }
                }
                else if (type === "login" || type === "license") {
                  const users = getLocalUsers();
                  const key = params.get("key");
                  
                  const user = type === "login" 
                    ? users.find((u: any) => u.username === username && u.password === pass)
                    : users.find((u: any) => u.key === key && key !== "");
                  
                  if (user) {
                    console.log(` [MOCK] ${type.toUpperCase()} Success: ${user.username}`);
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
                          { subscription: "Default", key: "SYNAUTH-KEY", expiry: Math.floor(new Date(user.expiresAt).getTime() / 1000).toString(), timeleft: 86400 }
                        ]
                      } 
                    }));
                  } else {
                    console.warn(` [MOCK] ${type.toUpperCase()} Failed: ${type === "login" ? username : key} (Invalid credentials)`);
                    res.end(JSON.stringify({ success: false, message: type === "login" ? "Invalid username or password." : "Invalid license key." }));
                  }
                } else {
                  res.end(JSON.stringify({ success: false, message: "Type not supported in local mock." }));
                }
              } catch (e) {
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
      ignored: ["**/users_mock.json"],
    },
  },
});