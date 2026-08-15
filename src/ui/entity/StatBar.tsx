"use client";

import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: string;
  delay?: number;
}

export function StatBar({
  label,
  value,
  max = 99,
  color = "#00e676",
  icon,
  delay = 0,
}: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      {icon && <span className="w-4 text-center text-[10px]">{icon}</span>}
      <span className="w-12 text-text-secondary truncate uppercase tracking-wider text-[10px]">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
        />
      </div>
      <span
        className="w-6 text-right font-mono text-[11px]"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
