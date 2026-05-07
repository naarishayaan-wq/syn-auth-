import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Mail, Lock, LogIn, UserPlus, ShieldCheck, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleBackground } from "@/components/ParticleBackground";

const MOCK_GOOGLE_ACCOUNTS = [
  { name: "Shaan Computers", email: "admin@gmail.com", avatar: "S" },
  { name: "Guest User", email: "guest@synauth.dev", avatar: "G" },
];

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Google Flow States
  const [showGoogleFlow, setShowGoogleFlow] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<typeof MOCK_GOOGLE_ACCOUNTS[0] | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

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
        if ((users[email] && users[email] === password) || (email === "admin@gmail.com" && password === "admin")) {
          localStorage.setItem("synauth_session", "true");
          localStorage.setItem("synauth_user_email", email);
          localStorage.setItem("synauth_username", email.split("@")[0]);
          localStorage.setItem("synauth_display_name", email.split("@")[0]);
          onLogin();
        } else {
          setError("Invalid email or password.");
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
          localStorage.setItem("synauth_session", "true");
          localStorage.setItem("synauth_user_email", email);
          localStorage.setItem("synauth_username", email.split("@")[0]);
          localStorage.setItem("synauth_display_name", email.split("@")[0]);
          onLogin();
        }
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setShowGoogleFlow(true);
  };

  const selectAccount = (acc: typeof MOCK_GOOGLE_ACCOUNTS[0]) => {
    setSelectedAccount(acc);
    setConfirmStep(true);
    setIsAddingAccount(false);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      selectAccount({ name: newName, email: newEmail, avatar: newName[0].toUpperCase() });
    }
  };

  const finalizeGoogleLogin = () => {
    if (!selectedAccount) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("synauth_session", "true");
      localStorage.setItem("synauth_user_email", selectedAccount.email);
      localStorage.setItem("synauth_username", selectedAccount.name);
      localStorage.setItem("synauth_display_name", selectedAccount.name);
      onLogin();
    }, 1000);
  };

  const resetGoogleFlow = () => {
    setShowGoogleFlow(false);
    setConfirmStep(false);
    setSelectedAccount(null);
    setIsAddingAccount(false);
    setNewName("");
    setNewEmail("");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-foreground">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showGoogleFlow ? (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-md p-8 z-10"
          >
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_40px_rgba(255,26,26,0.5)] mb-4">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-widest text-white text-glow">SYN AUTH</h1>
              <p className="text-muted-foreground text-xs font-medium mt-2 text-center uppercase tracking-[0.2em]">
                Secure Dashboard Access
              </p>
            </div>

            <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
              
              <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5 mb-6">
                <button
                  onClick={() => { setIsLogin(true); setError(""); }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isLogin ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(""); }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isLogin ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] ml-1 font-bold">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="admin@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 bg-black/60 border-white/10 focus-visible:ring-primary h-12 transition-all focus-visible:shadow-[0_0_20px_rgba(255,26,26,0.2)] rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] ml-1 font-bold">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 bg-black/60 border-white/10 focus-visible:ring-primary h-12 transition-all focus-visible:shadow-[0_0_20px_rgba(255,26,26,0.2)] rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] text-white font-black uppercase tracking-widest transition-all mt-4 rounded-xl"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      {isLogin ? "Authenticate" : "Create Account"}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                    <span className="bg-[#0f0f0f] px-4 text-muted-foreground/60">Social Login</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-12 mt-6 bg-black/60 border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all font-bold text-white/90 rounded-xl group"
                >
                  <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="google-flow"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-md p-8 z-20"
          >
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-1 shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Sign in with Google</h2>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Choose an account</p>
                    </div>
                  </div>
                  <button onClick={resetGoogleFlow} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
               </div>

               <div className="p-4 space-y-2">
                <AnimatePresence mode="wait">
                   {isAddingAccount ? (
                     <motion.div
                       key="add-account-form"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="p-4 space-y-4"
                     >
                       <form onSubmit={handleAddAccount} className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Your Name</label>
                           <Input 
                             value={newName}
                             onChange={(e) => setNewName(e.target.value)}
                             placeholder="John Doe"
                             className="bg-black/50 border-white/10 rounded-xl h-11"
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Email Address</label>
                           <Input 
                             type="email"
                             value={newEmail}
                             onChange={(e) => setNewEmail(e.target.value)}
                             placeholder="john@example.com"
                             className="bg-black/50 border-white/10 rounded-xl h-11"
                             required
                           />
                         </div>
                         <Button type="submit" className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-lg mt-2">
                           Add and Continue
                         </Button>
                         <button 
                           type="button"
                           onClick={() => setIsAddingAccount(false)}
                           className="w-full text-xs text-muted-foreground hover:text-white transition-colors py-2 uppercase font-bold tracking-widest"
                         >
                           Back to accounts
                         </button>
                       </form>
                     </motion.div>
                   ) : !confirmStep ? (
                     <motion.div
                       key="account-list"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-2"
                     >
                       {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                         <button
                           key={acc.email}
                           onClick={() => selectAccount(acc)}
                           className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                         >
                           <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                             {acc.avatar}
                           </div>
                           <div className="text-left flex-1 min-w-0">
                             <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{acc.name}</p>
                             <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
                           </div>
                           <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                         </button>
                       ))}
                       <button 
                         onClick={() => setIsAddingAccount(true)}
                         className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-white/70 border border-transparent hover:border-white/5"
                       >
                         <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
                           +
                         </div>
                         Use another account
                       </button>
                     </motion.div>
                   ) : (
                     <motion.div
                       key="confirm-step"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="p-6 flex flex-col items-center text-center space-y-6"
                     >
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/40 shadow-[0_0_40px_rgba(255,26,26,0.3)]">
                            {selectedAccount?.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#0f0f0f]">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-xl font-bold text-white">Welcome back, {selectedAccount?.name}</h2>
                          <p className="text-sm text-muted-foreground mt-1.5 px-4">
                            You're signing in as <span className="text-white font-medium">{selectedAccount?.email}</span>. Click continue to proceed to your dashboard.
                          </p>
                        </div>

                        <div className="w-full space-y-3 pt-4">
                          <Button
                            onClick={finalizeGoogleLogin}
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl shadow-lg"
                          >
                            {loading ? (
                              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                              "Continue to Dashboard"
                            )}
                          </Button>
                          <button
                            onClick={() => { setConfirmStep(false); setSelectedAccount(null); }}
                            className="text-xs text-muted-foreground hover:text-white transition-colors uppercase font-bold tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <div className="p-4 bg-white/3 text-[10px] text-muted-foreground text-center border-t border-white/5">
                 To continue, Google will share your name, email address, and profile picture with Syn-Auth.
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
