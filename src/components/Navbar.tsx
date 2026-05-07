import { Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar({ setMobileOpen }: { setMobileOpen: (v: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden text-muted-foreground"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="w-full flex-1 flex items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search licenses, users, or tokens..."
            className="w-full bg-black/40 border-white/10 pl-9 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 transition-all duration-300 focus-visible:shadow-[0_0_15px_rgba(255,26,26,0.15)]"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,26,26,0.8)]" />
        </Button>
      </div>
    </header>
  );
}