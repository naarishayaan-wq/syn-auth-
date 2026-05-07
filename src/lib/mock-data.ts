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
  { id: "app_1", name: "Syn-Auth Dashboard", description: "Default management system", status: "active", users: 0, licenses: 0, createdAt: new Date().toISOString() }
];

export const MOCK_LICENSES: License[] = [];

export const MOCK_USERS: User[] = [];

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
