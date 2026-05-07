import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Copy, Trash2, Code2, CheckCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MOCK_TOKENS, Token } from "@/lib/mock-data";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export default function Tokens() {
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [copied, setCopied] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Token | null>(null);

  function copyToken(tok: Token) {
    navigator.clipboard.writeText(tok.token).catch(() => {});
    setCopied(tok.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function revokeToken() {
    if (!revokeTarget) return;
    setTokens((prev) => prev.filter((t) => t.id !== revokeTarget.id));
    setRevokeTarget(null);
  }

  function maskToken(token: string) {
    return token.slice(0, 10) + "••••••••••••••••";
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Tokens</h1>
          <p className="text-muted-foreground text-sm mt-1">{tokens.length} active tokens</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            data-testid="button-create-token"
            className="bg-primary text-white font-semibold px-5 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,26,26,0.35)] transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Token
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {tokens.map((tok) => (
            <motion.div
              key={tok.id}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.97 }}
              whileHover={{ y: -1, boxShadow: "0 4px 20px rgba(255,26,26,0.08)" }}
              data-testid={`card-token-${tok.id}`}
              className="rounded-xl border border-white/10 bg-card p-5 relative overflow-hidden hover:border-primary/20 transition-colors"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{tok.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">{maskToken(tok.token)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex gap-1.5 flex-wrap">
                    {tok.permissions.map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-xs bg-white/5 border-white/10 text-muted-foreground"
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToken(tok)}
                      data-testid={`button-copy-${tok.id}`}
                      className="border-white/10 text-muted-foreground hover:text-white text-xs"
                    >
                      {copied === tok.id ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRevokeTarget(tok)}
                      data-testid={`button-revoke-${tok.id}`}
                      className="border-white/10 text-red-400 hover:border-red-400/30 hover:bg-red-500/5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-muted-foreground">Last used: <span className="text-white/60">{new Date(tok.lastUsed).toLocaleString()}</span></p>
                <p className="text-xs text-muted-foreground">Created: <span className="text-white/60">{new Date(tok.createdAt).toLocaleDateString()}</span></p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {tokens.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Code2 className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm">No active tokens.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {revokeTarget && (
          <Dialog open onOpenChange={() => setRevokeTarget(null)}>
            <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Revoke Token</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Revoking <span className="text-white font-medium">{revokeTarget.name}</span> will immediately invalidate it. Any services using this token will lose access.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRevokeTarget(null)} className="text-muted-foreground">Cancel</Button>
                <Button
                  data-testid="button-confirm-revoke"
                  onClick={revokeToken}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Revoke Token
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
