export type Application = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused";
  users: number;
  licenses: number;
  createdAt: string;
};

export type License = {
  id: string;
  key: string;
  appId: string;
  appName: string;
  status: "active" | "expired" | "banned";
  user: string;
  expiresAt: string;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  status: "active" | "banned";
  app: string;
  lastSeen: string;
  hwid: string;
  createdAt: string;
};

export type Token = {
  id: string;
  name: string;
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  token: string;
};

export type AuditLog = {
  id: string;
  event: string;
  detail: string;
  type: "success" | "danger" | "warn" | "info";
  time: string;
};

export const MOCK_APPS: Application[] = [
  { id: "app_1", name: "Apex Internal", description: "Primary gaming client", status: "active", users: 1240, licenses: 3500, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: "app_2", name: "Velo Loader", description: "Global authentication handler", status: "active", users: 890, licenses: 1200, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() }
];

export const MOCK_LICENSES: License[] = [
  { id: "l_1", key: "SYNAUTH-X7Y2-91P0-KLL9", appId: "app_1", appName: "Apex Internal", status: "active", user: "ghost_dev", expiresAt: "2026-12-31T23:59:59Z", createdAt: "2025-05-01T12:00:00Z" },
  { id: "l_2", key: "SYNAUTH-B6N1-08A2-QW04", appId: "app_2", appName: "Velo Loader", status: "expired", user: "trinity", expiresAt: "2026-01-01T23:59:59Z", createdAt: "2025-02-15T09:30:00Z" }
];

export const MOCK_USERS: User[] = [
  { id: "u_1", username: "ghost_dev", email: "ghost@protonmail.com", status: "active", app: "Apex Internal", lastSeen: new Date().toISOString(), hwid: "BFEBFBFF000906EA-87X9", createdAt: "2025-01-10T15:45:00Z" },
  { id: "u_2", username: "cyber_junkie", email: "cyber@tutanota.com", status: "banned", app: "Apex Internal", lastSeen: "2026-04-12T11:20:00Z", hwid: "AABBCCDD-112233", createdAt: "2025-03-20T08:12:00Z" }
];

export const MOCK_TOKENS: Token[] = [
  { id: "t_1", name: "Main Production API", permissions: ["Read", "Write", "Delete"], lastUsed: new Date().toISOString(), createdAt: "2025-06-01T10:00:00Z", token: "sa_at_7x8y9z0123456789abcdef" },
  { id: "t_2", name: "Read-Only Analytics", permissions: ["Read"], lastUsed: "2026-05-06T22:15:00Z", createdAt: "2025-08-15T14:30:00Z", token: "sa_at_abcdef1234567890xyzw" }
];

export const MOCK_AUDIT: AuditLog[] = [
  { id: "a_1", event: "Critical Auth Bypass Attempt", detail: "Blocked IP 192.168.1.105 (Russia)", type: "danger", time: "2 mins ago" },
  { id: "a_2", event: "New License Generated", detail: "Key SYNAUTH-XXXX-XXXX-XXXX created by ghost_dev", type: "success", time: "15 mins ago" },
  { id: "a_3", event: "Database Backup", detail: "Daily snapshot completed successfully", type: "info", time: "1 hour ago" },
  { id: "a_4", event: "Suspicious HWID Change", detail: "User cyber_junkie attempted reset", type: "warn", time: "3 hours ago" }
];
