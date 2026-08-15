"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";
import { useMetaStore, SPECIAL_PLAYERS } from "@/core/store/meta-store";

export function MetaShopScreen() {
  const coins = useMetaStore((s) => s.coins);
  const purchasedPlayers = useMetaStore((s) => s.purchasedPlayers);
  const [justBought, setJustBought] = useState<string | null>(null);

  const handlePurchase = (playerId: string) => {
    const success = useMetaStore.getState().purchasePlayer(playerId);
    if (success) {
      setJustBought(playerId);
      setTimeout(() => setJustBought(null), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      <motion.div
        className="text-center mb-4 pt-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-xl font-black text-accent mb-1">TIENDA DE LEYENDAS</h1>
        <p className="text-[10px] text-text-secondary">
          Comprá jugadores legendarios para tu plantel inicial
        </p>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-surface border border-border card-shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-accent text-lg">🪙</span>
        <span className="text-accent font-black text-xl tabular-nums">{coins.toLocaleString()}</span>
        <span className="text-text-dim text-xs ml-1">monedas</span>
      </motion.div>

      <div className="flex-1 space-y-2 overflow-y-auto pb-20">
        {SPECIAL_PLAYERS.map((player, i) => {
          const owned = purchasedPlayers.includes(player.id);
          const canAfford = coins >= player.cost;

          return (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all card-shadow
                ${owned
                  ? "bg-surface border-primary/30"
                  : "bg-surface border-border"
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0
                ${owned ? "bg-primary/10" : "bg-accent/10"}`}
              >
                {player.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold ${owned ? "text-primary" : "text-text"}`}>
                  {player.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-accent text-[10px]">🪙</span>
                  <span className="text-[10px] text-text-secondary tabular-nums">
                    {player.cost.toLocaleString()}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {justBought === player.id ? (
                  <motion.span
                    key="bought"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-primary text-lg"
                  >
                    ✓
                  </motion.span>
                ) : owned ? (
                  <span className="text-[10px] font-bold text-white bg-primary px-2 py-1 rounded-full">
                    COMPRADO
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(player.id)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${canAfford
                        ? "bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 hover:border-accent/60"
                        : "bg-bg-alt border border-border text-text-dim cursor-not-allowed"
                      }`}
                  >
                    COMPRAR
                  </button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={() => useGameStore.getState().goToHub()}
            className="w-full py-3 rounded-xl bg-surface border border-border text-sm font-bold text-text hover:bg-surface-light transition-colors card-shadow"
          >
            VOLVER AL HUB
          </button>
        </div>
      </motion.div>
    </div>
  );
}
