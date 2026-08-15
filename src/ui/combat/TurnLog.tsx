"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TurnResult } from "@/core/types";

interface TurnLogProps {
  log: TurnResult[];
  maxVisible?: number;
}

export function TurnLog({ log, maxVisible = 4 }: TurnLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log.length]);

  const visible = log.slice(-maxVisible);

  return (
    <div
      ref={scrollRef}
      className="space-y-1 max-h-28 overflow-y-auto"
    >
      {visible.map((entry, i) => (
        <motion.div
          key={`${entry.turn}-${i}`}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`text-[11px] px-2 py-1 rounded ${getLogStyle(entry)}`}
        >
          <span>{entry.message}</span>
        </motion.div>
      ))}
    </div>
  );
}

function getLogStyle(entry: TurnResult): string {
  if (entry.fainted.length > 0) return "bg-danger/10 text-danger";
  if (entry.effectiveness === "super_effective") return "bg-accent/10 text-accent";
  if (entry.effectiveness === "not_effective") return "bg-surface-light text-text-dim";
  if (entry.isCritical) return "bg-primary/10 text-primary";
  if (entry.recruited) return "bg-info/10 text-info";
  return "bg-surface text-text-secondary";
}
