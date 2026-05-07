import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Mail, Lock, LogIn, UserPlus, ShieldCheck, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleBackground } from "@/components/ParticleBackground";

const MOCK_GOOGLE_ACCOUNTS = [
  { name: "Shaan Computers", email: "admin@gmail.com", avatar: "S", image: "./avatar1.png" },
  { name: "Guest User", email: "guest@synauth.dev", avatar: "G", image: "./avatar2.png" },
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
  const [googlePassword, setGooglePassword] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);

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
    setShowGooglePassword(true); // Always ask for password even in Google flow
    setConfirmStep(false);
    setIsAddingAccount(false);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      selectAccount({ name: newName, email: newEmail, avatar: newName[0].toUpperCase() });
    }
  };

  const finalizeGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !googlePassword) return;
    setLoading(true);
    
    setTimeout(() => {
      // Simulate validation
      if (googlePassword.length < 4) {
        setError("Invalid password for Google account.");
        setLoading(false);
        return;
      }
      
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
    setShowGooglePassword(false);
    setGooglePassword("");
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[400px] z-50 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] overflow-hidden font-sans"
          >
            {/* Real Google Header */}
            <div className="p-8 pb-4 flex flex-col items-center text-center">
              <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h2 className="text-2xl font-normal text-[#202124] mb-1 font-['Inter',_sans-serif]">Sign in</h2>
              <p className="text-[#202124] text-base mb-6 font-['Inter',_sans-serif]">to continue to Syn-Auth</p>
            </div>

            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {isAddingAccount ? (
                  <motion.div
                    key="add-account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="space-y-4">
                      <div className="relative">
                        <Input 
                          placeholder="Email or phone"
                          className="h-14 border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded text-base placeholder:text-[#5f6368] bg-transparent text-[#202124]"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="text-[#1a73e8] text-sm font-medium hover:text-[#174ea6] cursor-pointer">Forgot email?</div>
                      <p className="text-[#5f6368] text-sm leading-relaxed mt-10">
                        Not your computer? Use Guest mode to sign in privately. <span className="text-[#1a73e8] font-medium cursor-pointer">Learn more</span>
                      </p>
                      <div className="flex justify-between items-center pt-8">
                        <div className="text-[#1a73e8] text-sm font-medium hover:bg-[#f8f9fa] px-2 py-2 rounded cursor-pointer transition-colors" onClick={() => setIsAddingAccount(false)}>Create account</div>
                        <Button 
                          onClick={() => { if(newEmail) selectAccount({ name: newEmail.split('@')[0], email: newEmail, avatar: newEmail[0].toUpperCase() }) }}
                          className="bg-[#1a73e8] hover:bg-[#174ea6] text-white px-6 h-9 rounded font-medium text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : showGooglePassword ? (
                  <motion.div
                    key="google-password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex items-center gap-2 px-2 py-1 border border-[#dadce0] rounded-full mb-4">
                        {selectedAccount?.image ? (
                          <img src={selectedAccount.image} className="h-5 w-5 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-[10px] text-white font-bold">
                            {selectedAccount?.avatar}
                          </div>
                        )}
                        <span className="text-sm font-medium text-[#3c4043]">{selectedAccount?.email}</span>
                        <svg className="w-4 h-4 text-[#5f6368]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10l5 5 5-5H7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-normal text-[#202124] mb-1">Welcome</h3>
                    </div>

                    <form onSubmit={finalizeGoogleLogin} className="space-y-6">
                      <div className="relative">
                        <Input 
                          type="password"
                          placeholder="Enter your password"
                          className="h-14 border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded text-base bg-transparent text-[#202124]"
                          value={googlePassword}
                          onChange={(e) => setGooglePassword(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="show-pass" className="h-4 w-4 rounded border-[#dadce0] text-[#1a73e8]" />
                        <label htmlFor="show-pass" className="text-sm text-[#202124]">Show password</label>
                      </div>

                      <div className="flex justify-between items-center pt-8">
                        <div className="text-[#1a73e8] text-sm font-medium hover:bg-[#f8f9fa] px-2 py-2 rounded cursor-pointer transition-colors" onClick={() => setShowGooglePassword(false)}>Back</div>
                        <Button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#1a73e8] hover:bg-[#174ea6] text-white px-6 h-10 rounded font-medium text-sm min-w-[80px]"
                        >
                          {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Next"}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="account-list"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="border border-[#dadce0] rounded-lg overflow-hidden mb-8">
                      {MOCK_GOOGLE_ACCOUNTS.map((acc, i) => (
                        <button
                          key={acc.email}
                          onClick={() => selectAccount(acc)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-[#f8f9fa] transition-colors text-left ${i !== MOCK_GOOGLE_ACCOUNTS.length - 1 ? 'border-b border-[#dadce0]' : ''}`}
                        >
                          {acc.image ? (
                            <img src={acc.image} className="h-7 w-7 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-[#1a73e8] flex items-center justify-center text-xs text-white font-bold">
                              {acc.avatar}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3c4043] truncate">{acc.name}</p>
                            <p className="text-xs text-[#5f6368] truncate">{acc.email}</p>
                          </div>
                        </button>
                      ))}
                      <button 
                        onClick={() => setIsAddingAccount(true)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-[#f8f9fa] transition-colors text-left border-t border-[#dadce0]"
                      >
                        <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center border border-[#dadce0] text-[#5f6368]">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-[#3c4043]">Use another account</span>
                      </button>
                    </div>

                    <p className="text-[#5f6368] text-xs leading-relaxed mb-8">
                      To continue, Google will share your name, email address, language preference, and profile picture with Syn-Auth. Before using this app, you can review Syn-Auth's <span className="text-[#1a73e8] cursor-pointer font-medium">privacy policy</span> and <span className="text-[#1a73e8] cursor-pointer font-medium">terms of service</span>.
                    </p>

                    <div className="flex justify-start">
                      <div className="text-[#5f6368] text-xs font-medium hover:bg-[#f8f9fa] px-2 py-2 rounded cursor-pointer transition-colors" onClick={resetGoogleFlow}>Cancel</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
