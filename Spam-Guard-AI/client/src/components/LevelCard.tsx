import { ReactNode } from "react";
import { CheckCircle, AlertTriangle, XCircle, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

interface LevelCardProps {
  title: string;
  description: string;
  status: "safe" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  delay?: number;
}

export function LevelCard({ title, description, status, children, delay = 0 }: LevelCardProps) {
  const icons = {
    safe: <CheckCircle className="w-6 h-6 text-emerald-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    danger: <XCircle className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
    neutral: <Shield className="w-6 h-6 text-slate-500" />,
  };

  const borders = {
    safe: "border-emerald-500/20 hover:border-emerald-500/40",
    warning: "border-yellow-500/20 hover:border-yellow-500/40",
    danger: "border-red-500/20 hover:border-red-500/40",
    info: "border-blue-500/20 hover:border-blue-500/40",
    neutral: "border-slate-800 hover:border-slate-700",
  };

  const bg = {
    safe: "bg-emerald-500/5",
    warning: "bg-yellow-500/5",
    danger: "bg-red-500/5",
    info: "bg-blue-500/5",
    neutral: "bg-card",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative p-6 rounded-2xl border ${borders[status]} ${bg[status]} transition-all duration-300 shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="p-2 bg-background/50 rounded-full backdrop-blur-sm border border-white/5">
          {icons[status]}
        </div>
      </div>
      <div className="mt-2 text-sm text-foreground/90 font-mono space-y-2">
        {children}
      </div>
    </motion.div>
  );
}
