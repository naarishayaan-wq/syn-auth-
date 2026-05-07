import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, CreditCard, ChevronRight, Lock, BarChart3, Users, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { SplashLoader } from "@/components/SplashLoader";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
  };

  if (isStarting) {
    return <SplashLoader onComplete={() => setLocation("/auth")} />;
  }

  const features = [
    { icon: <Shield className="h-6 w-6 text-red-500" />, title: "Secure & Scalable", text: "Enterprise-grade protection for your applications with military-level encryption." },
    { icon: <Zap className="h-6 w-6 text-red-500" />, title: "Instant Integration", text: "Get started in minutes with our powerful, developer-friendly APIs and SDKs." },
    { icon: <Globe className="h-6 w-6 text-red-500" />, title: "Global Delivery", text: "Low-latency authentication servers distributed globally for a seamless experience." },
    { icon: <Lock className="h-6 w-6 text-red-500" />, title: "HWID Protection", text: "Robust hardware-locking system to prevent unauthorized sharing of your software." },
    { icon: <BarChart3 className="h-6 w-6 text-red-500" />, title: "Advanced Analytics", text: "Track your user growth and license usage with real-time analytics dashboards." },
    { icon: <Terminal className="h-6 w-6 text-red-500" />, title: "Cross-Platform", text: "Support for C#, C++, Python, JavaScript, and many more environments." },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 selection:text-red-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,26,26,0.3)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">SYN AUTH</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/40">
             <a href="#features" className="hover:text-white transition-colors">Features</a>
             <a href="#threats" className="hover:text-white transition-colors">Threats</a>
             <a href="#mobile" className="hover:text-white transition-colors">Mobile</a>
             <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
             <a href="#support" className="hover:text-white transition-colors">Support</a>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={handleStart} className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white px-4 h-10 transition-all">Log in</button>
             <Button onClick={handleStart} className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest px-6 h-10 rounded-full shadow-[0_0_20px_rgba(255,26,26,0.2)] active:scale-95 transition-all">
                Sign up
             </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
         <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />
         
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8 z-10">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-4">
                     Authentication <br />
                     made for <br />
                     <span className="text-red-500 italic">everyone!</span>
                  </h1>
                  <p className="text-lg text-white/40 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                     Secure, scalable, and game-changing authentication for your applications. 
                     Get started in minutes with our powerful APIs and SDKs.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                 className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
               >
                  <Button 
                    onClick={handleStart}
                    size="lg" 
                    className="h-16 px-10 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(255,26,26,0.3)] transition-all active:scale-95 group"
                  >
                    Get Started <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="h-14 px-10 border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest rounded-2xl">
                     View Documentation
                  </Button>
               </motion.div>
            </div>

            <motion.div 
               initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
               className="flex-1 relative z-10 w-full max-w-2xl"
            >
               <div className="relative rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-[#111111]/50 backdrop-blur-sm p-4">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                  <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
                    alt="Syn-Auth Dashboard" 
                    className="w-full rounded-2xl border border-white/5 shadow-2xl opacity-80"
                  />
               </div>
            </motion.div>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-[#080808] relative">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <Badge className="bg-red-600/10 text-red-500 border-red-500/20 px-4 h-6 uppercase font-black tracking-widest mb-4">Features</Badge>
               <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Everything you need to succeed.</h2>
               <p className="text-white/40 text-lg mt-4 max-w-2xl mx-auto">A comprehensive suite of integrated tools for authentication, monetization, and user engagement.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {features.map((f, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -5 }}
                   className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/20 transition-all group"
                 >
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{f.text}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer / Privacy */}
      <footer className="py-20 border-t border-white/5 text-center">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-8 opacity-40">
               <Shield className="h-6 w-6" />
               <span className="text-xl font-black italic tracking-tighter uppercase">Syn-Auth</span>
            </div>
            <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">© 2026 Syn-Auth Systems. All rights reserved.</p>
         </div>
      </footer>

      {/* Cookie Consent Toast (Match Screenshot) */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-white text-black p-6 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 max-w-3xl">
            <div className="h-10 w-10 bg-rose-100 flex items-center justify-center rounded-full text-red-600 flex-shrink-0">
               <Lock className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold leading-relaxed">
               <span className="font-black text-sm block mb-1">We value your privacy</span>
               We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. <a href="#" className="text-red-600 underline">Learn more</a>
            </p>
         </div>
         <div className="flex items-center gap-3">
            <button className="px-8 h-10 border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Decline</button>
            <button className="px-8 h-10 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Accept All</button>
         </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
   return (
      <span className={`inline-flex items-center rounded-md border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
         {children}
      </span>
   );
}
