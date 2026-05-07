import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, Key, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { License } from "@/lib/mock-data";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

function StatusBadge({ status }: { status: License["status"] }) {
  const cfg = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expired: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    banned: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <Badge variant="outline" className={`text-xs ${cfg[status]}`}>
      {status}
    </Badge>
  );
}

export default function Licenses() {
  const { licenses, apps, selectedAppId, createLicense } = useAppStore();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const filteredLicenses = licenses.filter(
    (l) =>
      l.key.toLowerCase().includes(search.toLowerCase()) ||
      l.appName.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!selectedApp) return;
    setIsCreating(true);
    
    // Simulate API delay
    setTimeout(() => {
      createLicense(selectedApp.id, selectedApp.name);
      setIsCreating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[100] bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold border border-emerald-400/50"
          >
            <CheckCircle2 className="h-4 w-4" />
            New license key generated!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={rowVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Licenses</h1>
          <p className="text-muted-foreground text-sm mt-1">{licenses.length} license keys registered</p>
        </div>
        
        <Button 
          onClick={handleCreate} 
          disabled={isCreating || !selectedApp}
          className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-95"
        >
          {isCreating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Create License</>
          )}
        </Button>
      </motion.div>

      <motion.div variants={rowVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keys, apps, users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-black/40 border-white/10 focus-visible:ring-primary placeholder:text-muted-foreground/50 rounded-xl"
        />
      </motion.div>

      <motion.div
        variants={rowVariants}
        className="rounded-xl border border-white/10 bg-card overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">License Key</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Application</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">User</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredLicenses.map((lic, i) => (
                  <motion.tr
                    key={lic.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Key className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <code className="text-xs font-mono text-white group-hover:text-primary transition-colors">{lic.key}</code>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                       <Badge variant="outline" className="bg-primary/5 text-primary/80 border-primary/20 text-[10px] px-2">
                         {lic.appName}
                       </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/80">{lic.user}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={lic.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {new Date(lic.expiresAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredLicenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No licenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
