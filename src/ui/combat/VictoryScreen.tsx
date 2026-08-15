"use client";

import { motion } from "framer-motion";

interface VictoryScreenProps {
  xp: number;
  resources: Record<string, number>;
  onContinue: () => void;
}

export function VictoryScreen({ xp, resources, onContinue }: VictoryScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm bg-surface border border-primary/30 rounded-xl overflow-hidden"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.2 }}
      >
        <div className="p-6 text-center bg-primary/5">
          <motion.span
            className="text-5xl block mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.4 }}
          >
            🏆
          </motion.span>
          <h2 className="text-xl font-black text-primary">VICTORIA</h2>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-light">
            <span className="text-xs text-text-secondary">XP ganada</span>
            <span className="text-sm font-bold text-primary">+{xp}</span>
          </div>

          {Object.entries(resources).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 rounded-lg bg-surface-light"
            >
              <span className="text-xs text-text-secondary capitalize">{key}</span>
              <span className="text-sm font-bold text-accent">+{val}</span>
            </div>
          ))}

          <button
            onClick={onContinue}
            className="w-full py-3 mt-4 rounded-lg font-bold text-sm
              bg-primary text-white hover:brightness-105 active:scale-[0.98]
              transition-all"
          >
            CONTINUAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
