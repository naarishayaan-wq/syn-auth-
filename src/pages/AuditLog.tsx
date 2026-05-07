import { motion, Variants } from "framer-motion";
import { 
  Shield, Activity, Clock, Search, Filter, 
  CheckCircle, AlertCircle, Info, XCircle, Trash2, Download
} from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function AuditLogPage() {
  const { auditLogs } = useAppStore();
  const [search, setSearch] = useState("");

  const filteredLogs = auditLogs.filter(log => 
    log.event.toLowerCase().includes(search.toLowerCase()) ||
    log.detail.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "danger": return <XCircle className="w-4 h-4 text-red-500" />;
      case "warn": return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-500/10 border-emerald-500/20";
      case "danger": return "bg-red-500/10 border-red-500/20";
      case "warn": return "bg-amber-500/10 border-amber-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">Monitor all system events and security activities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-black/40 border-white/10">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" /> Clear Logs
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search events or details..." 
            className="pl-10 bg-black/40 border-white/10 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-black/40 border-white/10 gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Event Stream
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredLogs.length} events logged
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                variants={rowVariants}
                className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4"
              >
                <div className={`p-2 rounded-lg border ${getTypeStyles(log.type)}`}>
                  {getTypeIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{log.event}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {log.time}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{log.detail}</p>
                </div>
              </motion.div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto opacity-20 mb-4" />
                <p>No audit logs found matching your criteria.</p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
