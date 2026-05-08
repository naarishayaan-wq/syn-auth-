import { createContext, useContext, useState, useEffect } from "react";
import { Application, License, AuditLog, MOCK_APPS, MOCK_LICENSES, MOCK_USERS, MOCK_AUDIT } from "./mock-data";
import { ManagedUser } from "./key-system";
import { toast } from "sonner";

// ── helpers ─────────────────────────────────────────────────────────────────

function randHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function genOwnerId() {
  return `OWN-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}`;
}

function genSecret() {
  return `sa_sec_${randHex(8)}${randHex(8)}${randHex(8)}`;
}

// ── types ────────────────────────────────────────────────────────────────────

export type AppCredential = Application & {
  ownerId: string;
  appSecret: string;
  version: string;
};

// ── seed data ────────────────────────────────────────────────────────────────

const SEEDED_APPS: AppCredential[] = [
  {
    id: "app_default",
    name: "scheckk",
    description: "Production Auth System",
    status: "active",
    users: 2,
    licenses: 2,
    createdAt: new Date().toISOString(),
    ownerId: "OWN-21A8-32C7-F519",
    appSecret: "sa_sec_default_secret_key_12345678",
    version: "1.0"
  }
];

export const SEED_MANAGED: ManagedUser[] = [
  {
    id: "u_1",
    username: "syn",
    password: "1",
    key: "SYNAUTH-OYZD-SALY-4KLS",
    expiresAt: "2030-01-01T00:00:00Z",
    hwidLock: false,
    hwid: null,
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: "u_2",
    username: "1",
    password: "1",
    key: "SYNAUTH-YX8V-FRYL-0TXZ",
    expiresAt: "2030-01-01T00:00:00Z",
    hwidLock: false,
    hwid: null,
    status: "active",
    createdAt: new Date().toISOString()
  }
];

// ── context ──────────────────────────────────────────────────────────────────

type StoreCtx = {
  apps: AppCredential[];
  setApps: React.Dispatch<React.SetStateAction<AppCredential[]>>;
  managedUsers: ManagedUser[];
  setManagedUsers: React.Dispatch<React.SetStateAction<ManagedUser[]>>;
  licenses: License[];
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>;
  auditLogs: AuditLog[];
  addAuditLog: (event: string, detail: string, type: AuditLog["type"]) => void;
  refreshSecret: (appId: string) => void;
  createLicense: (appId: string, appName: string, expiry?: string) => void;
  selectedAppId: string;
  setSelectedAppId: React.Dispatch<React.SetStateAction<string>>;
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppStoreContext = createContext<StoreCtx | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppCredential[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to get token
  const getAuthHeader = () => {
    const token = localStorage.getItem("synauth_token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  // Fetch data from server on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeader();
        const [uRes, aRes] = await Promise.all([
          fetch("/api/admin/users", { headers }),
          fetch("/api/admin/apps", { headers })
        ]);
        
        if (uRes.status === 401 || aRes.status === 401) {
          console.error("Session expired or unauthorized. Logging out...");
          localStorage.removeItem("synauth_token");
          localStorage.removeItem("synauth_session");
          window.dispatchEvent(new Event("synauth-logout"));
          return;
        }

        if (!uRes.ok || !aRes.ok) {
          console.error("Server returned error:", uRes.status, aRes.status);
          return;
        }

        const uData = await uRes.json();
        const aData = await aRes.json();
        
        setManagedUsers(Array.isArray(uData) ? uData : []);
        setApps(Array.isArray(aData) ? aData : []);
        if (Array.isArray(aData) && aData.length > 0) setSelectedAppId(aData[0].id);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save App helper
  async function saveApp(newApp: AppCredential) {
    try {
      console.log(" [DASHBOARD] 📱 Saving app to server...");
      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(newApp)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (data.success) {
        setApps(prev => [data.app, ...prev]);
        toast.success("Application created successfully!");
        console.log(" [DASHBOARD] ✅ App saved successfully");
      } else {
        throw new Error(data.message || "Failed to save app");
      }
    } catch (e: any) { 
      console.error(" [DASHBOARD] ❌ Save App Error:", e);
      toast.error(e.message || "Failed to create application.");
    }
  }

  // Delete App helper
  async function deleteApp(id: string) {
    try {
      await fetch(`/api/admin/apps/${id}`, { 
        method: "DELETE",
        headers: getAuthHeader()
      });
      setApps(prev => prev.filter(a => a.id !== id));
      toast.success("Application deleted.");
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to delete application.");
    }
  }

  // Update App helper
  async function updateApp(id: string, updates: Partial<AppCredential>) {
    try {
      await fetch(`/api/admin/apps/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(updates)
      });
      setApps(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (e) { console.error(e); }
  }

  // Save User helper
  async function saveUser(newUser: ManagedUser) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setManagedUsers(prev => [data.user, ...prev]);
        toast.success("User created successfully!");
      }
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to create user.");
    }
  }

  // Delete User helper
  async function deleteUser(id: string) {
    try {
      await fetch(`/api/admin/users/${id}`, { 
        method: "DELETE",
        headers: getAuthHeader()
      });
      setManagedUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
  }

  // Update User helper
  async function updateUser(id: string, updates: Partial<ManagedUser>) {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(updates)
      });
      setManagedUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    } catch (e) { console.error(e); }
  }

  function addAuditLog(event: string, detail: string, type: AuditLog["type"]) {
    const newLog: AuditLog = {
      id: `a_${Date.now()}`,
      event,
      detail,
      type,
      time: "Just now"
    };
    setAuditLogs((prev: any) => [newLog, ...prev]);
  }

  function refreshSecret(appId: string) {
    const newSecret = genSecret();
    setApps(prev => prev.map(a => a.id === appId ? { ...a, appSecret: newSecret } : a));
    addAuditLog("Secret Refreshed", `App secret regenerated`, "warn");
  }

  function createLicense(appId: string, appName: string, expiry: string = "30d") {
    const days = expiry === "999d" ? 3650 : parseInt(expiry) || 30;
    const newUser: ManagedUser = {
      id: "", // Server will set ID
      username: "Unused",
      password: "",
      key: `SYNAUTH-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}`,
      expiresAt: new Date(Date.now() + days * 86_400_000).toISOString(),
      hwidLock: false,
      hwid: null,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    addAuditLog("License Created", `New ${expiry} key generated for ${appName}`, "success");
  }

  if (loading) return <div className="h-screen w-screen bg-background flex items-center justify-center text-primary font-mono">INITIALIZING SYN AUTH...</div>;

  return (
    <AppStoreContext.Provider value={{ 
      apps, setApps: saveApp as any, deleteApp, updateApp,
      managedUsers, setManagedUsers: saveUser as any, 
      deleteUser, updateUser,
      licenses, setLicenses, auditLogs, addAuditLog,
      refreshSecret, createLicense, selectedAppId, setSelectedAppId, isPremium, setIsPremium 
    }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}

// ── SDK generator ─────────────────────────────────────────────────────────────

export function generateSDK(app: AppCredential, users: ManagedUser[], language: "js" | "csharp" = "js"): string {
  if (language === "csharp") {
    return generateCSharpSDK(app, users);
  }

  return `// ═══════════════════════════════════════════════════════
// KEYAUTH JAVASCRIPT INITIALIZATION
// ═══════════════════════════════════════════════════════

const KeyAuthApp = new KeyAuth({
    name: "${app.name}",
    ownerid: "${app.ownerId}"
});

// Initialize connection
await KeyAuthApp.Initialize();

// Example Usage
// await KeyAuthApp.license("YOUR_LICENSE_KEY");
`;
}

export function generateCSharpSDK(app: AppCredential, users: ManagedUser[]): string {
  return `// ═══════════════════════════════════════════════════════
// KEYAUTH C# INTEGRATION - ${app.name.toUpperCase()}
// ═══════════════════════════════════════════════════════

using System;
using KeyAuth;

namespace SynAuthPanel
{
    class Program
    {
        /*
         * Setup KeyAuth with your application credentials.
         * These are automatically generated from your Syn-Auth dashboard.
         */
        public static api KeyAuthApp = new api(
            name: "${app.name}",
            ownerid: "${app.ownerId}"
        );

        static void Main(string[] args)
        {
            Console.Title = "${app.name} - Integration";
            
            // 1. Initialize KeyAuth connection
            KeyAuthApp.init();

            if (!KeyAuthApp.response.success)
            {
                Console.WriteLine("\n [!] Failed to initialize: " + KeyAuthApp.response.message);
                Console.ReadKey();
                return;
            }

            Console.WriteLine("\n [+] Successfully connected to KeyAuth server.");
            Console.WriteLine(" [+] App Version: " + KeyAuthApp.app_data.version);
            Console.WriteLine(" [+] Users Online: " + KeyAuthApp.app_data.numOnlineUsers);

            // 2. Simple License Login Example
            /*
            Console.Write("\n Enter License: ");
            string key = Console.ReadLine();
            
            KeyAuthApp.license(key);

            if (KeyAuthApp.response.success) {
                Console.WriteLine("\n [!] Login Successful! Welcome " + KeyAuthApp.user_data.username);
                // Start your application here
            } else {
                Console.WriteLine("\n [!] Error: " + KeyAuthApp.response.message);
            }
            */

            // 3. Username/Password Login Example
            /*
            Console.Write("\n Enter Username: ");
            string user = Console.ReadLine();
            Console.Write(" Enter Password: ");
            string pass = Console.ReadLine();
            
            KeyAuthApp.login(user, pass);

            if (KeyAuthApp.response.success) {
                Console.WriteLine("\n [!] Login Successful! Welcome " + KeyAuthApp.user_data.username);
            } else {
                Console.WriteLine("\n [!] Error: " + KeyAuthApp.response.message);
            }
            */

            // 4. Admin: Create License Example
            /*
            string newKey = KeyAuthApp.create_license(mask: "SYNAUTH-****", time: "30", amount: "1");
            if (!string.IsNullOrEmpty(newKey)) {
                Console.WriteLine("\n [+] Generated License: " + newKey);
            }
            */
            
            Console.WriteLine("\n Press any key to exit...");
            Console.ReadKey();
        }
    }
}`;
}
