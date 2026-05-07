export type ManagedUser = {
  id: string;
  username: string;
  password?: string;
  key: string;
  expiresAt: string;
  hwidLock: boolean;
  hwid: string | null;
  status: "active" | "paused";
  createdAt: string;
};

export type ValidationResult =
  | { success: true; message: string }
  | { success: false; error: string };

export function generateKey(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "X");
  return `SYNAUTH-${seg()}-${seg()}-${seg()}`;
}

export function validateKey(
  key: string,
  hwid: string,
  users: ManagedUser[]
): ValidationResult {
  const user = users.find((u) => u.key === key);

  if (!user) {
    return { success: false, error: "Key not found. This key does not exist." };
  }

  if (user.status === "paused") {
    return { success: false, error: "Key is paused. Contact administrator." };
  }

  const now = new Date();
  const expiry = new Date(user.expiresAt);
  if (expiry < now) {
    return { success: false, error: "Key has expired on " + expiry.toLocaleDateString() + "." };
  }

  if (user.hwidLock) {
    if (!user.hwid) {
      // First use — HWID gets registered (caller must update state)
      return { success: true, message: `Key valid. HWID registered for ${user.username}.` };
    }
    if (user.hwid !== hwid) {
      return { success: false, error: "HWID mismatch. Key is locked to a different device." };
    }
  }

  return { success: true, message: `Key valid. Welcome, ${user.username}!` };
}

export function expiryFromPreset(preset: "1d" | "7d" | "30d" | "custom", customDate?: string): string {
  if (preset === "custom" && customDate) return customDate;
  const d = new Date();
  if (preset === "1d") d.setDate(d.getDate() + 1);
  if (preset === "7d") d.setDate(d.getDate() + 7);
  if (preset === "30d") d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export function validateUser(
  username: string,
  pass: string,
  hwid: string,
  users: ManagedUser[]
): ValidationResult {
  const user = users.find((u) => u.username === username);

  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (user.password !== pass) {
    return { success: false, error: "Invalid password." };
  }

  if (user.status === "paused") {
    return { success: false, error: "Account is paused." };
  }

  const now = new Date();
  const expiry = new Date(user.expiresAt);
  if (expiry < now) {
    return { success: false, error: "Account has expired." };
  }

  if (user.hwidLock) {
    if (!user.hwid) {
      return { success: true, message: `Login successful. HWID registered.` };
    }
    if (user.hwid !== hwid) {
      return { success: false, error: "HWID mismatch." };
    }
  }

  return { success: true, message: `Login successful. Welcome, ${user.username}!` };
}
