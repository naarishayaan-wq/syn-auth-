import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AppWindow, Users, Key, Activity, TrendingUp, Shield, Clock } from "lucide-react";
import { MOCK_APPS, MOCK_USERS, MOCK_LICENSES } from "@/lib/mock-data";

const areaData: any[] = [];

const pieData = [
  { name: "Active", value: 0 },
  { name: "Banned", value: 0 },
  { name: "Inactive", value: 0 },
];
const PIE_COLORS = ["#ff1a1a", "#8b0000", "#333333"];

const recentActivity: any[] = [];

const stats = [
  { label: "Total Apps", value: "0", icon: AppWindow, change: "0 this month", color: "#ff1a1a" },
  { label: "Active Users", value: "0", icon: Users, change: "0 this week", color: "#ff1a1a" },
  { label: "Total Licenses", value: "0", icon: Key, change: "0 this week", color: "#ff1a1a" },
  { label: "Active Sessions", value: "0", icon: Activity, change: "None live", color: "#ff1a1a" },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function Dashboard() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, ghost_dev. Here's what's happening.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            data-testid={`stat-card-${stat.label.toLowerCase().replace(/ /g, "-")}`}
            className="relative rounded-xl border border-white/10 bg-card p-5 overflow-hidden group cursor-default"
            style={{ boxShadow: "0 0 0 1px rgba(255,26,26,0.05), 0 4px 24px rgba(0,0,0,0.4)" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />{stat.change}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 rounded-xl border border-white/10 bg-card p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">User Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Active sessions over the last 7 days</p>
            </div>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff1a1a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff1a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid rgba(255,26,26,0.2)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#888" }}
                itemStyle={{ color: "#ff1a1a" }}
              />
              <Area type="monotone" dataKey="users" stroke="#ff1a1a" strokeWidth={2} fill="url(#redGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-xl border border-white/10 bg-card p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">User Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid rgba(255,26,26,0.2)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#e0e0e0" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        className="rounded-xl border border-white/10 bg-card p-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-testid={`activity-item-${item.id}`}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                item.type === "success" ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" :
                item.type === "danger" ? "bg-red-500 shadow-[0_0_6px_rgba(255,26,26,0.8)]" :
                item.type === "warn" ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" :
                "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{item.event}</p>
                <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
