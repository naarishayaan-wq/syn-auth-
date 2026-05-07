import { createContext, useContext, useState, useEffect } from "react";
import { Application, License, AuditLog, MOCK_APPS, MOCK_LICENSES, MOCK_USERS, MOCK_AUDIT } from "./mock-data";
import { ManagedUser } from "./key-system";

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

const SEEDED_APPS: AppCredential[] = MOCK_APPS.map((a) => ({
  ...a,
  ownerId: genOwnerId(),
  appSecret: genSecret(),
  version: "1.0",
}));

export const SEED_MANAGED: ManagedUser[] = MOCK_USERS.map((u, i) => ({
  id: `mu_${u.id}`,
  username: u.username,
  key: `SYNAUTH-${u.id.toUpperCase().replace("_", "")}-${randHex(2).toUpperCase()}4M-${randHex(2).toUpperCase()}9Z`,
  expiresAt: new Date(Date.now() + (i % 2 === 0 ? 30 : 7) * 86_400_000).toISOString(),
  hwidLock: i % 2 === 0,
  hwid: u.hwid,
  status: u.status === "banned" ? "paused" : ("active" as const),
  createdAt: u.createdAt,
}));

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
  createLicense: (appId: string, appName: string) => void;
  selectedAppId: string;
  setSelectedAppId: React.Dispatch<React.SetStateAction<string>>;
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppStoreContext = createContext<StoreCtx | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppCredential[]>(() => {
    const saved = localStorage.getItem("synauth_apps");
    return saved ? JSON.parse(saved) : SEEDED_APPS;
  });
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem("synauth_managed_users");
    return saved ? JSON.parse(saved) : SEED_MANAGED;
  });
  const [licenses, setLicenses] = useState<License[]>(() => {
    const saved = localStorage.getItem("synauth_licenses");
    return saved ? JSON.parse(saved) : MOCK_LICENSES;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("synauth_audit_logs");
    return saved ? JSON.parse(saved) : MOCK_AUDIT;
  });
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id ?? "");
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    // Resetting everyone to false for a clean start as requested
    localStorage.removeItem("synauth_premium");
    return false;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("synauth_apps", JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    if (isPremium) {
      localStorage.setItem("synauth_premium", "true");
    } else {
      localStorage.removeItem("synauth_premium");
    }
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem("synauth_managed_users", JSON.stringify(managedUsers));
  }, [managedUsers]);

  useEffect(() => {
    localStorage.setItem("synauth_licenses", JSON.stringify(licenses));
  }, [licenses]);

  useEffect(() => {
    localStorage.setItem("synauth_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("synauth_premium", isPremium.toString());
  }, [isPremium]);

  // Sync users to local mock server for testing
  useEffect(() => {
    const syncUsers = async () => {
      try {
        const formData = new URLSearchParams();
        formData.append("type", "sync");
        formData.append("users", JSON.stringify(managedUsers));
        formData.append("apps", JSON.stringify(apps));
        
        // Use relative path without leading slash to respect base path if needed, 
        // or just use /api/1.2/ which Vite middleware handles at the root.
        const response = await fetch("/api/1.2/", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(" [MOCK] Sync Success:", data.message);
      } catch (e) {
        console.warn(" [MOCK] Sync failed. Make sure the local dev server is running.");
      }
    };
    
    // Debounce or delay slightly to ensure state is stable
    const timer = setTimeout(syncUsers, 500);
    return () => clearTimeout(timer);
  }, [managedUsers, apps]);

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
    const app = apps.find((a: any) => a.id === appId);
    if (app) {
      addAuditLog("Secret Refreshed", `App secret regenerated for ${app.name}`, "warn");
    }
    setApps((prev: any) =>
      prev.map((a: any) => (a.id === appId ? { ...a, appSecret: genSecret() } : a))
    );
  }

  function createLicense(appId: string, appName: string) {
    const newLicense: License = {
      id: `lic_${randHex(8)}`,
      key: `SYNAUTH-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}-${randHex(4).toUpperCase()}`,
      appId,
      appName,
      status: "active",
      user: "Unused",
      expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setLicenses((prev: any) => [newLicense, ...prev]);
    addAuditLog("License Created", `New key generated for ${appName}`, "success");
  }

  return (
    <AppStoreContext.Provider value={{ 
      apps, setApps, managedUsers, setManagedUsers, licenses, setLicenses, auditLogs, addAuditLog,
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
