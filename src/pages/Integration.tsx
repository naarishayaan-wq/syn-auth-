import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Terminal, Copy, CheckCheck, RefreshCw, Shield, Key,
  ChevronDown, AlertCircle, CheckCircle2, Code2, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore, generateSDK } from "@/lib/app-store";
import { validateKey } from "@/lib/key-system";

const containerVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

type Tab = "sdk" | "validator" | "docs";

export default function Integration() {
  const { apps, managedUsers, selectedAppId, setSelectedAppId } = useAppStore();
  const [appPickerOpen, setAppPickerOpen] = useState(false);
  const [sdkCopied, setSdkCopied] = useState(false);
  const [sdkLanguage, setSdkLanguage] = useState<"js" | "csharp">("js");
  const [notif, setNotif] = useState<string | null>(null);

  const selectedApp = apps.find((a: any) => a.id === selectedAppId) ?? apps[0];
  const sdkCode = selectedApp ? generateSDK(selectedApp, managedUsers, sdkLanguage) : "";

  function copySDK() {
    navigator.clipboard.writeText(sdkCode).catch(() => {});
    setSdkCopied(true);
    setTimeout(() => setSdkCopied(false), 2500);
  }

  function handleAppSwitch(appId: string, name: string) {
    setSelectedAppId(appId);
    setAppPickerOpen(false);
    setSdkCopied(false);
    setNotif(`Switched to ${name}`);
    setTimeout(() => setNotif(null), 3000);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-4xl relative">
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

      {/* Header & App Picker */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Integration Setup</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">KeyAuth 1.3</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Select an application to generate its integration SDK.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block">Active Application</label>
          <button
            onClick={() => setAppPickerOpen((o) => !o)}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-white hover:border-white/20 transition-all shadow-xl group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-left font-medium truncate">{selectedApp?.name ?? "Select App"}</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${appPickerOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {appPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-white/10 bg-[#0f0f0f] shadow-2xl overflow-hidden py-1"
              >
                {apps.length === 0 ? (
                   <div className="px-4 py-3 text-xs text-muted-foreground">No applications found. Create one in the Applications tab.</div>
                ) : (
                  apps.map((app: any) => (
                    <button
                      key={app.id}
                      onClick={() => handleAppSwitch(app.id, app.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all ${
                        app.id === selectedAppId ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${app.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span className="flex-1 truncate">{app.name}</span>
                      {app.id === selectedAppId && <CheckCheck className="h-4 w-4" />}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Credentials strip */}
      {selectedApp && (
        <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "App Name", value: selectedApp.name, color: "text-white" },
            { label: "Owner ID", value: selectedApp.ownerId, color: "text-primary" },
            { label: "App Secret", value: selectedApp.appSecret, color: "text-amber-400" },
            { label: "Version", value: selectedApp.version, color: "text-white" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-card p-4 shadow-lg group hover:border-white/20 transition-all">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">{item.label}</p>
              <p className={`text-sm font-mono font-medium truncate ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Initialization Code */}
      <AnimatePresence mode="wait">
          <motion.div
            variants={cardVariants}
            className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 mt-4"
          >
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-primary/80 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider">Development Tip</p>
              When testing locally, ensure <code className="font-mono bg-primary/10 px-1 rounded text-white">is_demo = true</code> in your C# SDK. 
              The SDK will connect to <code className="font-mono bg-primary/10 px-1 rounded text-white">localhost:5173</code> to sync with this dashboard.
            </div>
          </motion.div>

          <motion.div
            key="sdk"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4 mt-8"
          >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-white">Initialization Code</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Copy and paste this directly into your project
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
                <button onClick={() => setSdkLanguage("js")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${sdkLanguage === "js" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}>JavaScript</button>
                <button onClick={() => setSdkLanguage("csharp")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${sdkLanguage === "csharp" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}>C# (Panel)</button>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={copySDK}
                  className={`h-10 px-5 transition-all font-bold text-sm rounded-xl ${
                    sdkCopied
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 border shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.4)] text-white"
                  }`}
                >
                  {sdkCopied
                    ? <><CheckCheck className="h-4 w-4 mr-2" />Copied!</>
                    : <><Copy className="h-4 w-4 mr-2" />Copy Code</>}
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/8 bg-white/3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="text-xs text-muted-foreground font-mono ml-3 opacity-60">{sdkLanguage === "js" ? "keyauth.js" : "Program.cs"}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{sdkLanguage === "js" ? "JS" : "C#"}</span>
            </div>
            <div className="overflow-y-auto max-h-[450px]">
              <pre className="p-6 text-xs font-mono text-white/90 leading-relaxed overflow-x-auto whitespace-pre custom-scrollbar">
                <code>{sdkCode}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
