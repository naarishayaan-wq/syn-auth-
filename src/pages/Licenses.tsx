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
  const { licenses, apps, selectedAppId, createLicense, isPremium } = useAppStore();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [genConfig, setGenConfig] = useState({ expiry: "30d", amount: 1 });

  const selectedApp = apps.find((a: any) => a.id === selectedAppId) || apps[0];

  const filteredLicenses = licenses.filter(
    (l: License) =>
      l.key.toLowerCase().includes(search.toLowerCase()) ||
      l.appName.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (expiry: string, amount: number) => {
    if (!selectedApp) return;
    
    // Strict limit for free users: only 2 keys total
    if (!isPremium && licenses.length >= 2) {
      setShowUpgradeModal(true);
      return;
    }

    setIsCreating(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Amount is limited to 1 for free users
      const finalAmount = isPremium ? amount : 1;
      for(let i = 0; i < finalAmount; i++) {
        createLicense(selectedApp.id, selectedApp.name, expiry);
      }
      setIsCreating(false);
      setShowSuccess(true);
      setShowCreateModal(false);
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
            New license keys generated!
          </motion.div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Generate Keys
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Expiry Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["1d", "7d", "30d", "999d"].map((time) => {
                      const isTimePremium = time === "999d";
                      return (
                        <button
                          key={time}
                          disabled={isTimePremium && !isPremium}
                          onClick={() => setGenConfig({...genConfig, expiry: time})}
                          className={cn(
                            "py-2 rounded-lg text-xs font-bold transition-all border",
                            genConfig.expiry === time 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10",
                            isTimePremium && !isPremium && "opacity-30 cursor-not-allowed grayscale"
                          )}
                        >
                          {time === "999d" ? "Lifetime" : time.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Amount</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max={isPremium ? "50" : "1"}
                      disabled={!isPremium}
                      value={isPremium ? genConfig.amount : 1}
                      onChange={(e) => setGenConfig({...genConfig, amount: parseInt(e.target.value) || 1})}
                      className="bg-black/40 border border-white/10 rounded-lg h-10 px-4 text-xs font-mono text-white flex-1 focus:ring-1 focus:ring-primary outline-none"
                    />
                    {!isPremium && <span className="text-[10px] text-primary/60 font-bold">PRO Required for Bulk</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  onClick={() => handleCreate(genConfig.expiry, genConfig.amount)}
                  disabled={isCreating}
                  className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-12 rounded-xl"
                >
                  {isCreating ? "Generating..." : "Confirm & Generate"}
                </Button>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-[10px] text-muted-foreground hover:text-white uppercase tracking-widest font-bold py-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 shadow-2xl text-center"
            >
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Key Limit Reached</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Free accounts are limited to 20 license keys. Upgrade to Premium for unlimited keys and advanced features.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => { window.location.href = "/pricing"; }}
                  className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                >
                  Upgrade to Premium
                </Button>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-xs text-muted-foreground hover:text-white uppercase tracking-widest font-bold py-2 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div variants={rowVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Licenses</h1>
            {isPremium && (
              <Badge className="bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-1.5 h-4">Premium</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {licenses.length} license keys registered {!isPremium && <span className="text-primary/60">(Limit: 20)</span>}
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateModal(true)} 
          disabled={isCreating || !selectedApp}
          className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" /> Create License
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
                {filteredLicenses.map((lic: License, i: number) => (
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
