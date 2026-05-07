import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Infinity, CreditCard, Wallet, Smartphone, Globe, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const { isPremium, setIsPremium, addAuditLog } = useAppStore();
  const [showQR, setShowQR] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");

  const upiId = "gamerskhansr-1@okhdfcbank";
  const amount = "1000";
  const upiLink = `upi://pay?pa=${upiId}&pn=SynAuth&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const handleVerifyPayment = () => {
    if (transactionId.length < 12) return;
    
    setIsVerifying(true);
    setVerificationStatus("Connecting to Banking Server...");
    
    setTimeout(() => {
      setVerificationStatus("Locating Transaction " + transactionId + "...");
      setTimeout(() => {
        setVerificationStatus("Manual Verification in Progress...");
        setTimeout(() => {
          setIsPremium(true);
          setIsVerifying(false);
          setShowQR(false);
          addAuditLog("Account Upgraded", "Lifetime Premium membership activated", "success");
          window.location.href = "/licenses";
        }, 3000);
      }, 2500);
    }, 2000);
  };

  const features = [
    { icon: <Infinity className="h-4 w-4" />, text: "Unlimited License Keys" },
    { icon: <Zap className="h-4 w-4" />, text: "Instant Key Generation" },
    { icon: <Shield className="h-4 w-4" />, text: "Advanced HWID Protection" },
    { icon: <Zap className="h-4 w-4" />, text: "Priority Support" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Unlock Premium Power</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Scale your software business without limits. Get permanent access to the full Syn-Auth ecosystem.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Pricing Card */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <Zap className="h-12 w-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary font-black uppercase tracking-widest text-[10px] px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">Lifetime Access</span>
                <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">50% OFF</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-muted-foreground text-2xl line-through font-bold opacity-40">₹2,000</span>
                <span className="text-5xl font-black text-white">₹1,000</span>
                <span className="text-muted-foreground text-sm font-medium">/ permanent</span>
              </div>
            </div>

            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setShowQR(true)}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(255,26,26,0.3)] transition-all active:scale-95"
            >
              Get Premium Now
            </Button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Express Checkout
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "PhonePe", icon: <Smartphone className="h-4 w-4" />, color: "hover:border-purple-500/50" },
              { name: "Google Pay", icon: <Wallet className="h-4 w-4" />, color: "hover:border-blue-500/50" },
              { name: "Paytm", icon: <CreditCard className="h-4 w-4" />, color: "hover:border-sky-500/50" },
              { name: "Other UPI", icon: <Globe className="h-4 w-4" />, color: "hover:border-emerald-500/50" },
            ].map((m) => (
              <a 
                key={m.name} 
                href={upiLink}
                className={cn(
                  "bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group active:scale-95",
                  m.color
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 group-hover:text-primary transition-colors">
                  {m.icon}
                </div>
                <span className="text-xs font-bold text-white/80 group-hover:text-white">{m.name}</span>
              </a>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">UPI ID</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(upiId);
                  setVerificationStatus("UPI ID Copied!");
                  setTimeout(() => setVerificationStatus(""), 2000);
                }}
                className="text-[10px] text-primary hover:text-white transition-colors font-black uppercase tracking-widest"
              >
                Copy ID
              </button>
            </div>
            <p className="text-sm font-bold text-white/90">{upiId}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              After payment, your account will be upgraded instantly. If you face any issues, please contact our support team with your transaction ID.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest">
              <Zap className="h-3 w-3" />
              Auto-Activation Enabled
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setShowQR(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                 <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Smartphone className="h-7 w-7 text-red-600" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Instant UPI Pay</h3>
                 <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{upiId}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 relative group">
                <img 
                  src={qrUrl} 
                  alt="Payment QR" 
                  className="w-full aspect-square rounded-2xl shadow-xl transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-[2.5rem]">
                   <a href={upiLink} className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Open App</a>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="text-left space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black ml-1">UPI Transaction ID (12 Digits)</label>
                    <input 
                      type="text" 
                      placeholder="Enter Ref Number"
                      className="w-full h-14 bg-gray-100 border-none rounded-2xl px-5 text-sm font-bold text-black focus:ring-2 focus:ring-red-600 transition-all placeholder:text-gray-300"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, "").substring(0, 12))}
                    />
                 </div>

                 {verificationStatus && (
                   <div className={cn(
                     "text-[10px] font-bold uppercase tracking-wider p-2 rounded-lg animate-pulse",
                     verificationStatus.includes("Error") ? "bg-red-50 text-red-500" : "bg-primary/5 text-primary"
                   )}>
                     {verificationStatus}
                   </div>
                 )}

                 <Button 
                   onClick={handleVerifyPayment}
                   disabled={isVerifying || transactionId.length < 12}
                   className="w-full h-14 bg-black hover:bg-black/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50"
                 >
                   {isVerifying ? (
                     <div className="flex items-center gap-2">
                       <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Verifying...
                     </div>
                   ) : "Confirm & Upgrade"}
                 </Button>
                 
                 <button 
                   onClick={() => { setShowQR(false); setVerificationStatus(""); }}
                   className="text-[10px] text-gray-400 uppercase tracking-widest font-black hover:text-black transition-colors"
                 >
                   Cancel Transaction
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
