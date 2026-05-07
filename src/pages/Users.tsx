import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search, Plus, Trash2, Pause, Play, RefreshCw,
  Key, Copy, CheckCheck, AlertCircle, CheckCircle2, Cpu
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/lib/app-store";
import { ManagedUser, generateKey, validateKey, validateUser, expiryFromPreset, ValidationResult } from "@/lib/key-system";

type ExpiryPreset = "1d" | "7d" | "30d" | "custom";
const PRESET_LABELS: Record<ExpiryPreset, string> = { "1d": "1 Day", "7d": "7 Days", "30d": "30 Days", "custom": "Custom" };

const containerVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export default function Users() {
  const { managedUsers: users, setManagedUsers: setUsers, apps } = useAppStore();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    appId: apps[0]?.id ?? "",
    expiryPreset: "7d" as ExpiryPreset,
    customExpiry: "",
    hwidLock: false,
  });

  const [valType, setValType] = useState<"key" | "user">("key");
  const [valKey, setValKey] = useState("");
  const [valUser, setValUser] = useState("");
  const [valPass, setValPass] = useState("");
  const [valHwid, setValHwid] = useState("BFEBFBFF000906EA-TESTDEVICE");
  const [valResult, setValResult] = useState<ValidationResult | null>(null);
  const [valLoading, setValLoading] = useState(false);

  const filtered = users.filter(
    (u: ManagedUser) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.key.toLowerCase().includes(search.toLowerCase())
  );



  function showNotification(msg: string) {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  }

  function handleCreate() {
    if (!form.username.trim()) return;
    const expiresAt = expiryFromPreset(form.expiryPreset, form.expiryPreset === "custom" ? form.customExpiry : undefined);
    const newUser: ManagedUser = {
      id: `mu_${Date.now()}`,
      username: form.username.trim(),
      password: form.password.trim(),
      key: "", // Keys are now managed separately
      expiresAt,
      hwidLock: form.hwidLock,
      hwid: null,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    setUsers((prev: ManagedUser[]) => [newUser, ...prev]);
    showNotification(`User ${form.username} created successfully!`);
    setForm({ username: "", password: "", appId: apps[0]?.id ?? "", expiryPreset: "7d", customExpiry: "", hwidLock: false });
    setShowCreate(false);
  }

  function handleDelete(id: string) { setUsers((prev: ManagedUser[]) => prev.filter((u: ManagedUser) => u.id !== id)); }
  function handleTogglePause(id: string) {
    setUsers((prev: ManagedUser[]) => prev.map((u: ManagedUser) => u.id === id ? { ...u, status: u.status === "active" ? "paused" : "active" } : u));
  }
  function copyKey(key: string) {
    navigator.clipboard.writeText(key).catch(() => { });
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleValidate() {
    if (valType === "key" && !valKey.trim()) return;
    if (valType === "user" && (!valUser.trim() || !valPass.trim())) return;

    setValLoading(true);
    setValResult(null);
    setTimeout(() => {
      let result: ValidationResult;
      if (valType === "key") {
        result = validateKey(valKey.trim(), valHwid.trim(), users);
      } else {
        result = validateUser(valUser.trim(), valPass.trim(), valHwid.trim(), users);
      }

      if (result.success) {
        setUsers((prev: ManagedUser[]) => prev.map((u: ManagedUser) => {
          const match = valType === "key" ? u.key === valKey.trim() : u.username === valUser.trim();
          if (match && u.hwidLock && !u.hwid) return { ...u, hwid: valHwid.trim() };
          return u;
        }));
      }
      setValResult(result);
      setValLoading(false);
    }, 600);
  }

  function isExpired(expiresAt: string) { return new Date(expiresAt) < new Date(); }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[100] bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 text-sm font-semibold border border-emerald-400/50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {notif}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <motion.div variants={rowVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users &amp; Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" onClick={() => setShowValidator(true)} data-testid="button-open-validator"
              className="border-white/10 text-muted-foreground hover:text-white hover:border-white/20 text-sm">
              <Key className="h-4 w-4 mr-2" /> Validate Key
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={() => setShowCreate(true)} data-testid="button-create-user"
              className="bg-primary text-white font-semibold px-5 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.35)] transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" /> Create User
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={rowVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input data-testid="input-search-users" placeholder="Search username or key..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-black/40 border-white/10 focus-visible:ring-primary placeholder:text-muted-foreground/50" />
      </motion.div>

      {/* Table */}
      <motion.div variants={rowVariants} className="rounded-xl border border-white/10 bg-card overflow-hidden"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Username", "Password", "License Key", "Expires", "HWID Lock", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((u: ManagedUser) => {
                  const expired = isExpired(u.expiresAt);
                  return (
                    <motion.tr key={u.id} layout
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 280, damping: 26 }}
                      data-testid={`row-user-${u.id}`}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-mono text-xs text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-muted-foreground">{u.password || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {u.key ? (
                            <>
                              <code className="font-mono text-xs text-primary/90 whitespace-nowrap">{u.key}</code>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => copyKey(u.key)} data-testid={`button-copy-key-${u.id}`}
                                className="text-muted-foreground hover:text-white transition-colors">
                                {copied === u.key ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </motion.button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No Key</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-mono ${expired ? "text-red-400" : "text-muted-foreground"}`}>
                          {new Date(u.expiresAt).toLocaleDateString()}{expired && " (expired)"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Cpu className={`h-3.5 w-3.5 ${u.hwidLock ? "text-amber-400" : "text-muted-foreground"}`} />
                          <span className={`text-xs ${u.hwidLock ? "text-amber-400" : "text-muted-foreground"}`}>
                            {u.hwidLock ? (u.hwid ? "Locked" : "Unregistered") : "Unlimited"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={
                          expired ? "bg-red-500/10 text-red-400 border-red-500/20 text-xs"
                            : u.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs"
                        }>
                          {expired ? "expired" : u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}>
                            <Button size="sm" variant="outline" onClick={() => handleTogglePause(u.id)}
                              data-testid={`button-pause-user-${u.id}`}
                              className={`text-xs border-white/10 ${u.status === "active" ? "text-amber-400 hover:border-amber-400/30" : "text-emerald-400 hover:border-emerald-400/30"}`}>
                              {u.status === "active" ? <><Pause className="h-3 w-3 mr-1" />Pause</> : <><Play className="h-3 w-3 mr-1" />Resume</>}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(u.id)}
                              data-testid={`button-delete-user-${u.id}`}
                              className="text-xs border-white/10 text-red-400 hover:border-red-400/30 hover:bg-red-500/5">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── CREATE USER MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <Dialog open onOpenChange={() => setShowCreate(false)}>
            <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-lg">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Create User
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Register a new user account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Application</label>
                  <select
                    value={form.appId}
                    onChange={(e) => {
                      const appName = apps.find((a: any) => a.id === e.target.value)?.name || "App";
                      setForm((f: typeof form) => ({ ...f, appId: e.target.value }));
                      showNotification(`Switched to ${appName}`);
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-white"
                  >
                    {apps.map((app: any) => (
                      <option key={app.id} value={app.id} className="bg-[#0d0d0d]">{app.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                  <Input data-testid="input-new-username" placeholder="e.g. ghost_dev"
                    value={form.username} onChange={(e) => setForm((f: any) => ({ ...f, username: e.target.value }))}
                    className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:shadow-[0_0_12px_rgba(255,26,26,0.15)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
                  <Input data-testid="input-new-password" type="password" placeholder="••••••••"
                    value={form.password} onChange={(e) => setForm((f: any) => ({ ...f, password: e.target.value }))}
                    className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:shadow-[0_0_12px_rgba(255,26,26,0.15)]" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Expiry</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["1d", "7d", "30d", "custom"] as ExpiryPreset[]).map((p) => (
                      <motion.button key={p} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setForm((f: any) => ({ ...f, expiryPreset: p }))} data-testid={`preset-${p}`}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${form.expiryPreset === p
                          ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,26,26,0.15)]"
                          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"}`}>
                        {PRESET_LABELS[p]}
                      </motion.button>
                    ))}
                  </div>
                  {form.expiryPreset === "custom" && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                      <Input type="datetime-local" data-testid="input-custom-expiry"
                        value={form.customExpiry} onChange={(e) => setForm((f: any) => ({ ...f, customExpiry: e.target.value }))}
                        className="bg-black/50 border-white/10 focus-visible:ring-primary text-sm mt-1" />
                    </motion.div>
                  )}
                </div>
                <motion.label whileHover={{ scale: 1.01 }} data-testid="label-hwid-lock"
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.hwidLock ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_rgba(255,26,26,0.08)]" : "border-white/10 hover:border-white/20 bg-white/5"}`}>
                  <div className="mt-0.5">
                    <input type="checkbox" checked={form.hwidLock}
                      onChange={(e) => setForm((f: any) => ({ ...f, hwidLock: e.target.checked }))}
                      data-testid="checkbox-hwid-lock" className="h-4 w-4 accent-red-500 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu className={`h-3.5 w-3.5 ${form.hwidLock ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`text-sm font-medium ${form.hwidLock ? "text-white" : "text-muted-foreground"}`}>Enable HWID Lock</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.hwidLock ? "Key is locked to one device. HWID is saved on first use." : "Key works on unlimited devices."}
                    </p>
                  </div>
                </motion.label>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-muted-foreground">Cancel</Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button data-testid="button-confirm-create-user" onClick={handleCreate}
                    disabled={!form.username.trim()}
                    className="bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.3)] transition-all disabled:opacity-40">
                    Create User
                  </Button>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── KEY VALIDATOR MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showValidator && (
          <Dialog open onOpenChange={() => { setShowValidator(false); setValResult(null); }}>
            <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Key className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Key Validator
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Test a license key against the auth system in real-time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5 mb-2">
                  <button
                    onClick={() => { setValType("key"); setValResult(null); }}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${valType === "key" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    License Key
                  </button>
                  <button
                    onClick={() => { setValType("user"); setValResult(null); }}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${valType === "user" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    User Login
                  </button>
                </div>

                {valType === "key" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">License Key</label>
                    <Input data-testid="input-validate-key" placeholder="SYNAUTH-XXXX-XXXX-XXXX"
                      value={valKey} onChange={(e) => { setValKey(e.target.value); setValResult(null); }}
                      className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono text-sm focus-visible:shadow-[0_0_12px_rgba(255,26,26,0.15)]" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                      <Input data-testid="input-validate-user" placeholder="Enter username"
                        value={valUser} onChange={(e) => { setValUser(e.target.value); setValResult(null); }}
                        className="bg-black/50 border-white/10 focus-visible:ring-primary text-sm h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
                      <Input data-testid="input-validate-pass" type="password" placeholder="••••••••"
                        value={valPass} onChange={(e) => { setValPass(e.target.value); setValResult(null); }}
                        className="bg-black/50 border-white/10 focus-visible:ring-primary text-sm h-10" />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">HWID (simulated device)</label>
                  <Input data-testid="input-validate-hwid" placeholder="BFEBFBFF000906EA-TESTDEVICE"
                    value={valHwid} onChange={(e) => { setValHwid(e.target.value); setValResult(null); }}
                    className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono text-xs" />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={handleValidate} disabled={valLoading} data-testid="button-run-validate"
                    className="w-full bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.3)] transition-all font-semibold">
                    {valLoading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Validating...</> : <><Key className="h-4 w-4 mr-2" />Authenticate</>}
                  </Button>
                </motion.div>
                <AnimatePresence mode="wait">
                  {valResult && (
                    <motion.div key={valResult.success ? "ok" : "err"}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      data-testid="validation-result"
                      className={`flex items-start gap-3 p-4 rounded-xl border ${valResult.success ? "border-emerald-500/30 bg-emerald-500/8" : "border-red-500/30 bg-red-500/8"}`}>
                      {valResult.success
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-semibold ${valResult.success ? "text-emerald-400" : "text-red-400"}`}>
                          {valResult.success ? "AUTH SUCCESS" : "AUTH FAILED"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {valResult.success ? (valResult as { success: true; message: string }).message : (valResult as { success: false; error: string }).error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setShowValidator(false); setValResult(null); }} className="text-muted-foreground">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
