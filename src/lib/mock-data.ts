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

export const MOCK_APPS: Application[] = [];
export const MOCK_LICENSES: License[] = [];
export const MOCK_USERS: User[] = [];
export const MOCK_TOKENS: Token[] = [];
