import { createContext, useContext, useState, useEffect } from "react";
import { Application, License, MOCK_APPS, MOCK_LICENSES, MOCK_USERS } from "./mock-data";
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
  refreshSecret: (appId: string) => void;
  createLicense: (appId: string, appName: string) => void;
  selectedAppId: string;
  setSelectedAppId: React.Dispatch<React.SetStateAction<string>>;
};

const AppStoreContext = createContext<StoreCtx | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppCredential[]>(SEEDED_APPS);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem("synauth_managed_users");
    return saved ? JSON.parse(saved) : SEED_MANAGED;
  });
  const [licenses, setLicenses] = useState<License[]>(MOCK_LICENSES);
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id ?? "");

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("synauth_managed_users", JSON.stringify(managedUsers));
  }, [managedUsers]);

  // Sync users to local mock server for testing
  useEffect(() => {
    const syncUsers = async () => {
      try {
        const formData = new URLSearchParams();
        formData.append("type", "sync");
        formData.append("users", JSON.stringify(managedUsers));
        const response = await fetch("/api/1.2/", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log(" [MOCK] Sync Response:", data);
      } catch (e) {
        console.warn(" [MOCK] Sync failed. (This is normal if server is restarting)");
      }
    };
    syncUsers();
  }, [managedUsers]);

  function refreshSecret(appId: string) {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, appSecret: genSecret() } : a))
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
    setLicenses((prev) => [newLicense, ...prev]);
  }

  return (
    <AppStoreContext.Provider value={{ 
      apps, setApps, managedUsers, setManagedUsers, licenses, setLicenses,
      refreshSecret, createLicense, selectedAppId, setSelectedAppId 
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
