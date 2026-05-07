import React from "react";
import { Link } from "wouter";
import { Shield, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative w-full max-w-md text-center z-10">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-red-600/10 border border-red-500/20 shadow-[0_0_50px_rgba(255,26,26,0.2)] mb-10 animate-pulse">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-4 text-white leading-none">404</h1>
        <p className="text-[10px] font-black tracking-[0.5em] text-red-500 uppercase mb-10 ml-[0.5em]">Access Denied / Archive Not Found</p>
        
        <div className="bg-[#0f0f0f]/80 border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-md mb-10">
          <p className="text-white/40 text-sm leading-relaxed mb-10">
            The requested encrypted sector could not be retrieved. The resource may have been purged or moved to a restricted directory.
          </p>
          <Link href="/">
            <Button className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-red-600/30 group transition-all active:scale-95">
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Re-establish Connection
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center gap-3 opacity-20 hover:opacity-40 transition-opacity">
          <Shield className="h-4 w-4" />
          <span className="text-[10px] font-black italic tracking-widest uppercase">Syn-Auth / Global Security Network</span>
        </div>
      </div>
    </div>
  );
}
