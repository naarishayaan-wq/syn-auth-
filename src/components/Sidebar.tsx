import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  AppWindow,
  Key,
  Users,
  Code2,
  Settings,
  Terminal,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: AppWindow },
  { href: "/licenses", label: "Licenses", icon: Key },
  { href: "/users", label: "Users", icon: Users },
  { href: "/tokens", label: "Tokens", icon: Code2 },
  { href: "/integration", label: "Integration", icon: Terminal },
  { href: "/audit-log", label: "Audit Log", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border w-64 p-4 z-50 relative">
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(255,26,26,0.3)]">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white text-glow">SYN AUTH</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const isIntegration = item.href === "/integration";
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer relative group",
                  isActive
                    ? "bg-primary/10 text-primary text-glow font-medium"
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                  isIntegration && !isActive && "border border-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(255,26,26,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-white transition-colors"
                  )}
                />
                <span>{item.label}</span>
                {isIntegration && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    SDK
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5 px-2 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(255,26,26,0.1)] text-primary shrink-0">
              {(localStorage.getItem("synauth_display_name") || localStorage.getItem("synauth_user_email") || "G").substring(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {localStorage.getItem("synauth_display_name") || localStorage.getItem("synauth_username") || "Ghost Dev"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {localStorage.getItem("synauth_user_email") || "admin@synauth.dev"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => { 
              localStorage.removeItem("synauth_session"); 
              localStorage.removeItem("synauth_user_email");
              localStorage.removeItem("synauth_username");
              localStorage.removeItem("synauth_display_name");
              window.location.reload(); 
            }}
            className="p-2.5 rounded-xl text-red-400/80 hover:bg-red-500/20 hover:text-red-400 transition-all bg-red-500/10 shrink-0 border border-red-500/20 shadow-[0_0_15px_rgba(255,26,26,0.1)]"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block h-screen fixed inset-y-0 left-0 z-50">
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full"
        >
          <SidebarContent />
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
