import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Layout } from "@/components/Layout";
import { AppStoreProvider } from "@/lib/app-store";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import Licenses from "@/pages/Licenses";
import Users from "@/pages/Users";
import Tokens from "@/pages/Tokens";
import Settings from "@/pages/Settings";
import Integration from "@/pages/Integration";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import AuditLog from "@/pages/AuditLog";
import Pricing from "@/pages/Pricing";
import Landing from "@/pages/Landing";

const queryClient = new QueryClient();

const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.12 } },
};

function PageRoutes() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: "100%" }}
      >
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/applications" component={Applications} />
          <Route path="/licenses" component={Licenses} />
          <Route path="/users" component={Users} />
          <Route path="/tokens" component={Tokens} />
          <Route path="/integration" component={Integration} />
          <Route path="/settings" component={Settings} />
          <Route path="/audit-log" component={AuditLog} />
          <Route path="/pricing" component={Pricing} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem("synauth_session");
    if (session === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(255,26,26,0.2)]" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Initializing SynAuth...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppStoreProvider>
          <WouterRouter base={(import.meta.env.BASE_URL || "").replace(/\/$/, "")}>
            <Switch>
              <Route path="/auth">
                {!isAuthenticated ? (
                  <Auth onLogin={() => setIsAuthenticated(true)} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              
              <Route path="/">
                 {isAuthenticated ? (
                   <Layout><PageRoutes /></Layout>
                 ) : (
                   <Landing />
                 )}
              </Route>

              {/* Catch-all for protected routes */}
              <Route path="/:rest*">
                {isAuthenticated ? (
                  <Layout><PageRoutes /></Layout>
                ) : (
                  <Landing />
                )}
              </Route>
            </Switch>
          </WouterRouter>
        </AppStoreProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
