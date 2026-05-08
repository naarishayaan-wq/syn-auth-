import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus, Edit2, Trash2, Pause, Play, Search, AppWindow,
  Users, Key, Copy, CheckCheck, RefreshCw, Eye, EyeOff,
  ChevronDown, ChevronUp, Terminal, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppStore, AppCredential, generateSDK } from "@/lib/app-store";
import { useLocation } from "wouter";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

type ModalMode = "create" | "edit" | "delete" | null;

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSecret = label.toLowerCase().includes("secret");

  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const display = isSecret && !revealed
    ? value.slice(0, 8) + "••••••••••••••••••••••"
    : value;

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-lg px-3 py-2">
        <span className={`flex-1 text-xs truncate ${mono ? "font-mono" : ""} text-white/80`}>{display}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isSecret && (
            <button onClick={() => setRevealed((r) => !r)} className="text-muted-foreground hover:text-white transition-colors p-0.5">
              {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={copy}
            className="text-muted-foreground hover:text-primary transition-colors p-0.5"
          >
            {copied ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function AppCard({
  app,
  onEdit,
  onDelete,
  onTogglePause,
  onRefreshSecret,
  onViewSDK,
}: {
  app: AppCredential;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePause: () => void;
  onRefreshSecret: () => void;
  onViewSDK: () => void;
}) {
  const [credOpen, setCredOpen] = useState(false);

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(255,26,26,0.1)" }}
      data-testid={`card-app-${app.id}`}
      className="rounded-xl border border-white/10 bg-card relative overflow-hidden group hover:border-primary/20 transition-colors duration-200"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <AppWindow className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{app.name}</h3>
              <p className="text-xs text-muted-foreground">{app.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="text-[10px] bg-white/5 border-white/10 text-muted-foreground" variant="outline">
              v{app.version}
            </Badge>
            <Badge
              data-testid={`badge-status-${app.id}`}
              className={
                app.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs"
              }
              variant="outline"
            >
              {app.status}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-white/5 p-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="text-sm font-semibold text-white">{app.users.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-3 flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Licenses</p>
              <p className="text-sm font-semibold text-white">{app.licenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              size="sm" variant="outline" onClick={onEdit}
              data-testid={`button-edit-${app.id}`}
              className="w-full border-white/10 text-muted-foreground hover:text-white hover:border-white/20 text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1.5" /> Edit
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              size="sm" variant="outline" onClick={onTogglePause}
              data-testid={`button-pause-${app.id}`}
              className={`w-full text-xs border-white/10 ${
                app.status === "active"
                  ? "text-amber-400 hover:border-amber-400/30"
                  : "text-emerald-400 hover:border-emerald-400/30"
              }`}
            >
              {app.status === "active"
                ? <><Pause className="h-3 w-3 mr-1.5" /> Pause</>
                : <><Play className="h-3 w-3 mr-1.5" /> Resume</>}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm" variant="outline" onClick={onDelete}
              data-testid={`button-delete-${app.id}`}
              className="border-white/10 text-red-400 hover:border-red-400/30 hover:bg-red-500/5 text-xs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>

        {/* SDK button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            onClick={onViewSDK}
            data-testid={`button-sdk-${app.id}`}
            className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(255,26,26,0.15)] transition-all text-xs font-semibold"
            variant="outline"
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5" /> View SDK &amp; Integration
          </Button>
        </motion.div>
      </div>

      {/* Credentials panel toggle */}
      <button
        onClick={() => setCredOpen((o) => !o)}
        data-testid={`button-creds-toggle-${app.id}`}
        className="w-full flex items-center justify-between px-5 py-2.5 border-t border-white/8 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>App Credentials</span>
        </div>
        {credOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      <AnimatePresence initial={false}>
        {credOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-3 pb-5 space-y-3 border-t border-white/5 bg-black/20">
              <CopyField label="Owner ID" value={app.ownerId} />
              <CopyField label="App Secret" value={app.appSecret} />
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Version</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/8 rounded-lg px-3 py-2">
                    <span className="text-xs font-mono text-white/80">{app.version}</span>
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRefreshSecret}
                  data-testid={`button-refresh-secret-${app.id}`}
                  className="w-full border-white/10 text-amber-400 hover:border-amber-400/30 hover:bg-amber-500/5 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh App Secret
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Applications() {
  const { apps, setApps: saveApp, deleteApp, updateApp, managedUsers, refreshSecret } = useAppStore();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AppCredential | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  // SDK preview modal
  const [sdkApp, setSdkApp] = useState<AppCredential | null>(null);
  const [sdkCopied, setSdkCopied] = useState(false);

  const filtered = apps.filter(
    (a: AppCredential) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm({ name: "", description: "" });
    setSelected(null);
    setModal("create");
  }

  function openEdit(app: AppCredential) {
    setForm({ name: app.name, description: app.description });
    setSelected(app);
    setModal("edit");
  }

  function openDelete(app: AppCredential) {
    setSelected(app);
    setModal("delete");
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setIsCreating(true);
    try {
      const newApp: AppCredential = {
        id: "", // Server will set ID
        name: form.name,
        description: form.description,
        status: "active",
        users: 0,
        licenses: 0,
        createdAt: new Date().toISOString(),
        ownerId: `OWN-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        appSecret: `sa_sec_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
        version: "1.0",
      };
      await (saveApp as any)(newApp);
      setModal(null);
    } catch (e) {
      // toast is handled in store
    } finally {
      setIsCreating(false);
    }
  }

  function handleEdit() {
    if (!selected || !form.name.trim()) return;
    updateApp?.(selected.id, { name: form.name, description: form.description });
    setModal(null);
  }

  function handleDelete() {
    if (!selected) return;
    deleteApp?.(selected.id);
    setModal(null);
  }

  function handleTogglePause(app: AppCredential) {
    updateApp?.(app.id, { status: app.status === "active" ? "paused" : "active" });
  }

  function copySDK() {
    if (!sdkApp) return;
    navigator.clipboard.writeText(generateSDK(sdkApp, managedUsers)).catch(() => {});
    setSdkCopied(true);
    setTimeout(() => setSdkCopied(false), 2500);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {apps.length} application{apps.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={openCreate}
            data-testid="button-create-app"
            className="bg-primary text-white font-semibold px-5 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.35)] transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Application
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div variants={cardVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-search-apps"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-black/40 border-white/10 focus-visible:ring-primary placeholder:text-muted-foreground/50"
        />
      </motion.div>

      {/* App cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((app: AppCredential) => (
            <AppCard
              key={app.id}
              app={app}
              onEdit={() => openEdit(app)}
              onDelete={() => openDelete(app)}
              onTogglePause={() => handleTogglePause(app)}
              onRefreshSecret={() => refreshSecret(app.id)}
              onViewSDK={() => setSdkApp(app)}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center py-16 text-center text-muted-foreground"
          >
            <AppWindow className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm">No applications found.</p>
          </motion.div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <Dialog open onOpenChange={() => setModal(null)}>
            <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <DialogHeader>
                <DialogTitle className="text-white">
                  {modal === "create" ? "Create Application" : "Edit Application"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  {modal === "create"
                    ? "Register a new application. Credentials will be auto-generated."
                    : "Update application details."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">App Name</label>
                  <Input
                    data-testid="input-app-name"
                    placeholder="e.g. My Loader v1"
                    value={form.name}
                    onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                  <Input
                    data-testid="input-app-description"
                    placeholder="Brief description..."
                    value={form.description}
                    onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                {modal === "create" && (
                  <div className="rounded-lg border border-white/8 bg-black/30 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="text-white font-medium text-[11px]">Auto-generated on creation:</p>
                    <p>• Owner ID — unique application identifier</p>
                    <p>• App Secret — secure signing key</p>
                    <p>• Version — starts at 1.0</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)} className="text-muted-foreground">Cancel</Button>
                <Button
                  data-testid="button-confirm-modal"
                  disabled={isCreating}
                  onClick={modal === "create" ? handleCreate : handleEdit}
                  className="bg-primary hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255,26,26,0.3)] transition-all min-w-[100px]"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                       <RefreshCw className="h-3 w-3 animate-spin" />
                       Creating...
                    </div>
                  ) : (
                    modal === "create" ? "Create" : "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── DELETE MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === "delete" && selected && (
          <Dialog open onOpenChange={() => setModal(null)}>
            <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <DialogHeader>
                <DialogTitle className="text-white">Delete Application</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">{selected.name}</span>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)} className="text-muted-foreground">Cancel</Button>
                <Button
                  data-testid="button-confirm-delete"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── SDK PREVIEW MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sdkApp && (
          <Dialog open onOpenChange={() => { setSdkApp(null); setSdkCopied(false); }}>
            <DialogContent className="bg-[#0d0d0d] border-white/10 text-white max-w-3xl max-h-[80vh] flex flex-col">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  SDK Integration — {sdkApp.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Copy this code into your project. Keys created in the dashboard will validate correctly.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 my-3 flex-shrink-0">
                <div className="flex-1 rounded-lg border border-white/8 bg-black/30 px-4 py-2.5 flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Owner ID</span>
                    <span className="text-xs font-mono text-white truncate">{sdkApp.ownerId}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-white/8 bg-black/30 px-4 py-2.5 flex items-center gap-3">
                  <Key className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Version</span>
                    <span className="text-xs font-mono text-white">{sdkApp.version}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-white/8 bg-black/30 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{managedUsers.length} keys embedded</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="relative rounded-xl border border-white/10 bg-black overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                      <span className="text-xs text-muted-foreground ml-2 font-mono">synauth-sdk.js</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={copySDK}
                        data-testid="button-copy-sdk"
                        className={`text-xs font-semibold transition-all ${
                          sdkCopied
                            ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                            : "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                        } border`}
                        variant="outline"
                      >
                        {sdkCopied
                          ? <><CheckCheck className="h-3 w-3 mr-1.5" />Copied!</>
                          : <><Copy className="h-3 w-3 mr-1.5" />Copy SDK</>}
                      </Button>
                    </motion.div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre">
                    <code>{generateSDK(sdkApp, managedUsers)}</code>
                  </pre>
                </div>
              </div>

              <div className="flex-shrink-0 mt-3 rounded-lg border border-white/8 bg-black/20 px-4 py-3 text-xs text-muted-foreground">
                <span className="text-primary font-semibold">How to use:</span>{" "}
                Paste this code into your project (HTML script tag or JS module). Call{" "}
                <code className="font-mono text-white/70 bg-white/5 px-1 rounded">validateKey(key, hwid)</code>{" "}
                with the user's key and device ID. Keys created in the dashboard are automatically embedded.
              </div>

              <DialogFooter className="flex-shrink-0 mt-3">
                <Button variant="ghost" onClick={() => { setSdkApp(null); setSdkCopied(false); }} className="text-muted-foreground">
                  Close
                </Button>
                <Button
                  onClick={() => { setSdkApp(null); setLocation("/integration"); }}
                  className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                  variant="outline"
                  data-testid="button-go-integration"
                >
                  <Terminal className="h-3.5 w-3.5 mr-1.5" /> Full Integration Page
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
