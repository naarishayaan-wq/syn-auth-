import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { User, Lock, Shield, Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export default function Settings() {
  const [profile, setProfile] = useState(() => {
    const email = localStorage.getItem("synauth_user_email") || "ghost@protonmail.com";
    const displayName = localStorage.getItem("synauth_display_name") || "Ghost Developer";
    const username = localStorage.getItem("synauth_username") || email.split("@")[0];
    return { username, email, displayName };
  });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem("synauth_notifs") || '{"email":true,"security":true,"updates":false}'));
  const [security, setSecurity] = useState(() => JSON.parse(localStorage.getItem("synauth_security") || '{"twoFactor":true,"sessionLogs":true,"ipWhitelist":false}'));

  function handleSave() {
    localStorage.setItem("synauth_display_name", profile.displayName);
    localStorage.setItem("synauth_username", profile.username);
    localStorage.setItem("synauth_notifs", JSON.stringify(notifications));
    localStorage.setItem("synauth_security", JSON.stringify(security));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Refresh to update sidebar
    }, 1500);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and security preferences</p>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Display Name</label>
            <Input
              data-testid="input-display-name"
              value={profile.displayName}
              onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
            <Input
              data-testid="input-username"
              value={profile.username}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</label>
            <Input
              data-testid="input-email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Current Password</label>
            <Input
              data-testid="input-current-password"
              type="password"
              placeholder="••••••••••"
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</label>
            <Input
              data-testid="input-new-password"
              type="password"
              placeholder="••••••••••"
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
            <Input
              data-testid="input-confirm-password"
              type="password"
              placeholder="••••••••••"
              className="bg-black/40 border-white/10 focus-visible:ring-primary"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Security</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "twoFactor" as const, label: "Two-Factor Authentication", desc: "Require 2FA on every login" },
            { key: "sessionLogs" as const, label: "Session Logging", desc: "Log all login sessions and IP addresses" },
            { key: "ipWhitelist" as const, label: "IP Whitelist", desc: "Only allow access from whitelisted IPs" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-sm text-white font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                data-testid={`toggle-${item.key}`}
                checked={security[item.key]}
                onCheckedChange={(v) => setSecurity((s: any) => ({ ...s, [item.key]: v }))}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Advanced Protection</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "antiDebug", label: "Anti-Debug", desc: "Prevents reverse engineering and debugger attachment" },
            { key: "cloudSecret", label: "Cloud Secret Protection", desc: "Obfuscates application secrets during transmission" },
            { key: "forceHwid", label: "Strict HWID Lock", desc: "Enforces 1:1 hardware mapping with no reset leniency" },
            { key: "integrity", label: "Binary Integrity Check", desc: "Verifies application hash on every startup" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div>
                <p className="text-sm text-white font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={security[item.key] ?? false}
                onCheckedChange={(v) => setSecurity((s: any) => ({ ...s, [item.key]: v }))}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "email" as const, label: "Email Notifications", desc: "Receive alerts via email" },
            { key: "security" as const, label: "Security Alerts", desc: "Notify on suspicious activity" },
            { key: "updates" as const, label: "Product Updates", desc: "News about new features" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-sm text-white font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                data-testid={`toggle-notif-${item.key}`}
                checked={notifications[item.key]}
                onCheckedChange={(v) => setNotifications((n: any) => ({ ...n, [item.key]: v }))}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={cardVariants} className="flex justify-end">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleSave}
            data-testid="button-save-settings"
            className={`px-6 font-semibold transition-all duration-300 ${
              saved
                ? "bg-emerald-600 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.35)]"
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
