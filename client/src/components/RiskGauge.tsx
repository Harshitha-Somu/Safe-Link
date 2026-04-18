import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number; // 0.0 to 1.0
  size?: number;
}

export function RiskGauge({ score, size = 120 }: RiskGaugeProps) {
  // Normalize score for display (safe is low risk score? usually risk score 0 is safe, 1 is spam)
  // Assuming score 0.0 = Safe, 1.0 = Spam
  
  const percentage = Math.min(Math.max(score * 100, 0), 100);
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = "text-emerald-500";
  if (score > 0.25) color = "text-yellow-500";
  if (score > 0.50) color = "text-orange-500";
  if (score > 0.75) color = "text-red-500";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-800"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <motion.circle
          className={color}
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold font-mono ${color}`}>
          {(score * 100).toFixed(0)}
        </span>
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
          Risk Score
        </span>
      </div>
    </div>
  );
}
