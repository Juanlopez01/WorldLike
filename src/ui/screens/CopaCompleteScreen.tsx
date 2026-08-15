"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";
import { useMetaStore } from "@/core/store/meta-store";

export function CopaCompleteScreen() {
  const theme = useGameStore((s) => s.theme);
  const currentCopa = useGameStore((s) => s.currentCopa);
  const copaReward = useGameStore((s) => s.copaReward);
  const coins = useMetaStore((s) => s.coins);

  if (!theme) return null;

  const copa = theme.copas[currentCopa - 1];
  if (!copa) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 field-profesional opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-bg/60" />

      <motion.div
        className="text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.span
          className="text-7xl block mb-4"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          🏆
        </motion.span>

        <h1 className="text-3xl font-black text-primary mb-2">
          COPA GANADA
        </h1>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">{copa.emoji}</span>
          <span className="text-xl font-bold text-text">{copa.name}</span>
        </div>

        <div className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />

        <motion.div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface border-2 border-accent/30 card-shadow"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-2xl">🪙</span>
          <div className="text-left">
            <div className="text-2xl font-black text-accent tabular-nums">
              +{copaReward.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-secondary">
              monedas ganadas
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-4 text-sm text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Total: <span className="text-accent font-bold">{coins.toLocaleString()}</span> 🪙
        </motion.p>
      </motion.div>

      <motion.button
        onClick={() => useGameStore.getState().goToHub()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 mt-10 px-8 py-3 rounded-xl font-bold text-sm
          bg-primary text-white
          hover:brightness-105 active:scale-95
          transition-all glow-green card-shadow"
      >
        VOLVER AL HUB
      </motion.button>
    </div>
  );
}
