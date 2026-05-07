import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap } from "lucide-react";

export function SplashLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-red-600/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center text-center"
      >
        <div className="mb-12 relative">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(255,26,26,0.2)", "0 0 50px rgba(255,26,26,0.4)", "0 0 20px rgba(255,26,26,0.2)"] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl relative z-10"
          >
            <Shield className="h-12 w-12 text-white" />
          </motion.div>
          <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full animate-pulse" />
        </div>

        <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-4 flex items-center gap-2">
          SYN AUTH
        </h1>
        <p className="text-white/40 text-sm font-bold tracking-[0.3em] uppercase mb-16">
          <span className="text-red-500 animate-pulse mr-2">●</span> Secure Connection Established
        </p>

        <div className="w-full max-w-xs space-y-6">
          <div className="flex flex-col items-center gap-3">
             <p className="text-white font-bold text-lg">Please wait while we validate your connection.</p>
             <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <Zap className="h-3 w-3 fill-current" /> Validating Encryption Keys...
             </div>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-red-600 shadow-[0_0_15px_rgba(255,26,26,0.8)]"
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
             <span>Protocol 1.2.4</span>
             <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-10">
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white">
            <span>Identity</span>
            <span className="text-red-500">/</span>
            <span>Security</span>
            <span className="text-red-500">/</span>
            <span>Access</span>
         </div>
      </div>
    </div>
  );
}
