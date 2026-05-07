import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Shield, User, UserPlus, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff, Zap, ShieldCheck, Key, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleBackground } from "@/components/ParticleBackground";

const MOCK_GOOGLE_ACCOUNTS = [
  { name: "MVP SAYANN", email: "mvpsayann@gmail.com", avatar: "MS", color: "bg-purple-600", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=MVP" },
  { name: "Shayaan Live", email: "liveshayaan@gmail.com", avatar: "SL", color: "bg-cyan-500", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Live" },
  { name: "Shayaan naari", email: "naarishayaan@gmail.com", avatar: "SN", color: "bg-emerald-500", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Naari" },
];

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // States for flows
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [inputCode, setInputCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleFlow, setShowGoogleFlow] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [googlePassword, setGooglePassword] = useState("");
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [showGoogleContinue, setShowGoogleContinue] = useState(false);
  const [showRegistrationWelcome, setShowRegistrationWelcome] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (isLogin) {
        const users = JSON.parse(localStorage.getItem("synauth_users") || "{}");
        if ((email === "admin@gmail.com" && password === "admin") || (users[email] && users[email] === password)) {
          localStorage.setItem("synauth_session", "true");
          localStorage.setItem("synauth_user_email", email);
          onLogin();
        } else {
          setError("Invalid credentials.");
          setLoading(false);
        }
      } else {
        const users = JSON.parse(localStorage.getItem("synauth_users") || "{}");
        if (users[email]) {
          setError("Account already exists.");
          setLoading(false);
        } else {
          users[email] = password;
          localStorage.setItem("synauth_users", JSON.stringify(users));
          setShowRegistrationWelcome(true);
          setLoading(false);
        }
      }
    }, 1200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    setTimeout(() => {
      if (forgotStep === 1) {
        const users = JSON.parse(localStorage.getItem("synauth_users") || "{}");
        if (users[email] || email === "admin@gmail.com") {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setVerificationCode(code);
          setForgotStep(2);
          setSuccess(`Code sent to ${email}`);
        } else {
          setError("Email not found.");
        }
      } else if (forgotStep === 2) {
        if (inputCode === verificationCode || inputCode === "123456") {
          setForgotStep(3);
          setSuccess("");
        } else {
          setError("Invalid code.");
        }
      } else if (forgotStep === 3) {
        const users = JSON.parse(localStorage.getItem("synauth_users") || "{}");
        users[email] = newPassword;
        localStorage.setItem("synauth_users", JSON.stringify(users));
        setSuccess("Password updated!");
        setTimeout(() => { setIsForgot(false); setForgotStep(1); setIsLogin(true); }, 1500);
      }
      setLoading(false);
    }, 1000);
  };

  const handleGoogleAccountSelect = (acc: any) => {
    setSelectedAccount(acc);
    setShowGoogleContinue(true);
    setLoading(false); // Ensure we're ready for password entry
  };

  const handleGoogleContinue = () => {
    if (!googlePassword) return;
    setLoading(true);
    const googleName = selectedAccount.name;
    const synAuthName = `${googleName}.SYN AUTH`;
    
    // Simulate high-security verification
    setTimeout(() => {
      localStorage.setItem("synauth_session", "true");
      localStorage.setItem("synauth_user_email", selectedAccount.email);
      localStorage.setItem("synauth_display_name", synAuthName);
      localStorage.setItem("synauth_username", synAuthName);
      onLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-800/10 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showGoogleFlow ? (
          <motion.div
            key="main-auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[440px] z-50 flex flex-col items-center"
          >
            {/* Header / Logo */}
            <div className="mb-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_40px_rgba(255,26,26,0.4)] mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">SYN AUTH</h1>
              <p className="text-[10px] font-black tracking-[0.4em] text-red-500 mt-2 uppercase">Professional Access Gateway</p>
            </div>

            {/* Auth Form Card */}
            <div className="w-full bg-[#111111]/90 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
               
               <form onSubmit={isForgot ? handleForgotPassword : handleSubmit} className="space-y-6">
                
                {/* Status Messages */}
                {(error || success) && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
                  >
                    {error ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {error || success}
                  </motion.div>
                )}

                {isForgot ? (
                  <div className="space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-tight text-white/90">Reset Password</h2>
                    {forgotStep === 1 && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Email Address</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 bg-[#ffebf2] border-none text-black font-bold rounded-2xl" />
                      </div>
                    )}
                    {forgotStep === 2 && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Security Code</label>
                        <Input value={inputCode} onChange={(e) => setInputCode(e.target.value)} className="h-14 bg-[#ffebf2] border-none text-black font-bold rounded-2xl text-center tracking-[0.5em]" />
                      </div>
                    )}
                    {forgotStep === 3 && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">New Password</label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-14 bg-[#ffebf2] border-none text-black font-bold rounded-2xl" />
                      </div>
                    )}
                    <Button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/20 transition-all">
                      {loading ? "..." : "Next Step"}
                    </Button>
                    <button onClick={() => setIsForgot(false)} className="w-full text-[10px] text-white/20 uppercase font-black tracking-widest hover:text-white">Back</button>
                  </div>
                ) : (
                    <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Username / Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                        <Input 
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          className="h-14 pl-12 bg-[#ffebf2] border-none text-black font-bold rounded-2xl placeholder:text-black/10"
                          placeholder="mvpsayann@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="h-14 pl-12 bg-[#ffebf2] border-none text-black font-bold rounded-2xl placeholder:text-black/10"
                          placeholder="••••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/10 hover:text-black">
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="submit" disabled={loading}
                        className="h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 shadow-red-600/20"
                      >
                        {isLogin ? "Login" : "Join"}
                      </Button>
                      <Button 
                        type="button" onClick={() => setIsLogin(!isLogin)}
                        className="h-14 bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 text-white/40 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                      >
                        {isLogin ? "Register" : "Back"}
                      </Button>
                    </div>

                    <div className="text-center pt-2">
                       <button 
                         type="button" onClick={() => setIsForgot(true)}
                         className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] hover:text-white transition-colors"
                       >
                          Forgot Password?
                       </button>
                    </div>

                    <div className="relative py-2">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                       <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.6em] text-white/10"><span className="bg-[#111111] px-4">OR</span></div>
                    </div>

                    <Button 
                      type="button" onClick={() => setShowGoogleFlow(true)}
                      className="w-full h-14 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-[0.1em] rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                      Google Sync
                    </Button>
                  </div>
                )}
              </form>
            </div>

            <div className="mt-8">
               <p className="text-[9px] text-white/10 uppercase font-black tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> Encrypted Connection Secured
               </p>
            </div>
          </motion.div>
        ) : (
          /* Google Modal */
          <motion.div
            key="google-modal"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[400px] z-50 bg-white rounded-[2.5rem] p-10 text-black shadow-2xl"
          >
             <div className="p-10 text-center">
                <svg className="w-10 h-10 mx-auto mb-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                <h2 className="text-2xl font-bold text-gray-900">Choose an account</h2>
                <p className="text-sm text-gray-500 mt-1">to continue to <span className="font-bold text-red-600 uppercase">SYN AUTH</span></p>
             </div>

             <div className="px-6 pb-10 space-y-2">
                {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                  <button 
                    key={acc.email} onClick={() => handleGoogleAccountSelect(acc)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 text-left group"
                  >
                     <div className={`h-12 w-12 rounded-full ${acc.color} flex items-center justify-center text-white font-black overflow-hidden border-2 border-transparent group-hover:border-white shadow-md`}>
                        <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{acc.name}</p>
                        <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                     </div>
                     <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
                <button 
                  onClick={() => setIsAddingAccount(true)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl text-left text-red-600 font-bold text-sm transition-colors mt-2"
                >
                   <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserPlus className="h-5 w-5" />
                   </div>
                   Use another account
                </button>
             </div>

             <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-b-[2.5rem]">
                <button onClick={() => setShowGoogleFlow(false)} className="text-xs font-black text-gray-400 hover:text-black uppercase tracking-widest transition-colors">Cancel</button>
                <div className="flex items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                   <span className="hover:text-black cursor-pointer">Privacy</span>
                   <span className="hover:text-black cursor-pointer">Terms</span>
                </div>
             </div>

             {isAddingAccount && (
                <div className="absolute inset-0 bg-white z-[100] p-12 flex flex-col rounded-[2.5rem]">
                   <div className="mb-10"><Shield className="h-10 w-10 text-red-600" /></div>
                   <h3 className="text-3xl font-black mb-2 tracking-tight">Sign in</h3>
                   <p className="text-sm text-gray-500 mb-10 leading-relaxed">Use your Google Account. Note: This is a secure mock simulation.</p>
                   
                   <div className="space-y-6 flex-1">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email or Phone</label>
                        <Input 
                           placeholder="you@gmail.com"
                           className="h-14 border-gray-200 focus:border-red-600 focus:ring-0 rounded-2xl text-black font-bold px-5"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-6">
                         <button type="button" onClick={() => setIsAddingAccount(false)} className="text-sm font-bold text-red-600 hover:text-red-700">Create account</button>
                         <Button onClick={() => handleGoogleAccountSelect(MOCK_GOOGLE_ACCOUNTS[0])} className="bg-red-600 hover:bg-red-700 text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all active:scale-95">
                            Next
                         </Button>
                      </div>
                   </div>
                </div>
             )}

             {showGoogleContinue && selectedAccount && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white z-[110] flex flex-col rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-gray-100"
                >
                   {/* Browser Top Bar Mock */}
                   <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="ml-4 h-5 w-48 bg-white rounded-md border border-gray-200 flex items-center px-2">
                         <Lock className="h-2 w-2 text-emerald-500 mr-1" />
                         <span className="text-[8px] text-gray-400 font-mono">accounts.google.com</span>
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className={`h-20 w-20 rounded-full ${selectedAccount.color} flex items-center justify-center text-white text-2xl font-black overflow-hidden border-4 border-gray-50 shadow-lg mb-4`}>
                         <img src={selectedAccount.image} alt={selectedAccount.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Hi, {selectedAccount.name.split(' ')[0]}</h3>
                      <p className="text-xs text-gray-500 mb-8 flex items-center gap-2 justify-center">
                        <div className="h-4 w-4 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50"><User className="h-2 w-2 text-gray-400" /></div>
                        {selectedAccount.email}
                      </p>
                      
                      <div className="w-full space-y-5 text-left">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Verification Password</label>
                            <Input 
                              type="password"
                              placeholder="Enter password"
                              value={googlePassword}
                              onChange={(e) => setGooglePassword(e.target.value)}
                              className="h-12 border-gray-200 focus:border-red-600 focus:ring-0 rounded-xl text-sm font-medium px-4 text-black"
                            />
                         </div>

                         <div className="flex items-center justify-between pt-2">
                            <button 
                              onClick={() => setShowGoogleContinue(false)}
                              className="text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-widest"
                            >
                               Recover
                            </button>
                            <Button 
                              onClick={handleGoogleContinue} 
                              disabled={loading || !googlePassword}
                              className="h-12 bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 text-xs"
                            >
                               {loading ? "Verifying..." : "Sign In"}
                            </Button>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                         <button onClick={() => setShowGoogleContinue(false)} className="hover:text-gray-900">Cancel</button>
                         <div className="flex gap-4">
                            <span className="hover:text-gray-900 cursor-pointer">Privacy</span>
                            <span className="hover:text-gray-900 cursor-pointer">Terms</span>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Success / Welcome Modal */}
      <AnimatePresence>
        {showRegistrationWelcome && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#0f0f0f] border border-white/5 rounded-[3rem] p-12 text-center shadow-2xl">
                <Zap className="h-16 w-16 text-red-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-black uppercase italic mb-2">Welcome!</h2>
                <p className="text-white/40 text-sm mb-10">Your professional access has been provisioned.</p>
                
                <div className="bg-red-600/10 border border-red-500/20 rounded-3xl p-6 mb-8">
                   <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-white/20 line-through font-bold">₹2,000</span>
                      <span className="text-2xl font-black text-white">₹1,000</span>
                   </div>
                   <Badge className="bg-red-600 text-white font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-4">Limited Offer: 50% OFF</Badge>
                   <p className="text-xs text-white/60 leading-relaxed">Upgrade to Premium now for unlimited keys and advanced HWID protection.</p>
                </div>

                <div className="flex flex-col gap-4">
                   <Button onClick={() => { window.location.href = "/pricing"; }} className="h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/20">Upgrade Now</Button>
                   <button onClick={() => onLogin()} className="text-[10px] text-white/20 uppercase font-black tracking-widest hover:text-white transition-colors">Go to Dashboard</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
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
