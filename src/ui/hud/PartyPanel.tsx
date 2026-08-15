"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { EntityInstance } from "@/core/types";

interface PartyPanelProps {
  party: EntityInstance[];
  onSwap: (fromIdx: number, toIdx: number) => void;
  onClose: () => void;
}

export function PartyPanel({ party, onSwap, onClose }: PartyPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      onSwap(selectedIdx, idx);
      setSelectedIdx(null);
    }
  }

  const rarityColors: Record<string, string> = {
    common: "border-text-dim/30",
    uncommon: "border-green-500/50",
    rare: "border-blue-500/50",
    epic: "border-purple-500/50",
    legendary: "border-yellow-500/50",
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-surface border-t border-border rounded-t-2xl p-4 pb-8 max-h-[80vh] overflow-y-auto"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-text">
            Plantel ({party.length})
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-text-dim hover:text-text px-2 py-1"
          >
            Cerrar
          </button>
        </div>

        {selectedIdx !== null && (
          <p className="text-[10px] text-accent mb-2 font-bold uppercase">
            Seleccioná otro jugador para intercambiar posición
          </p>
        )}

        <div className="space-y-2">
          {party.map((entity, idx) => {
            const hpPct = Math.round((entity.currentHp / entity.maxHp) * 100);
            const isSelected = selectedIdx === idx;
            const isActive = idx === 0;
            const isDead = entity.currentHp <= 0;

            const ovr = Math.round(
              Object.values(entity.stats).reduce((a, b) => a + b, 0) /
                Math.max(Object.keys(entity.stats).length, 1)
            );

            return (
              <button
                key={entity.instanceId}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : rarityColors[entity.rarity] ?? "border-border"
                } ${isDead ? "opacity-40" : "hover:bg-surface-light"} ${
                  isActive && !isSelected ? "bg-primary/5" : "bg-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                    <span className="text-lg font-black text-text-dim">{ovr}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text truncate">
                        {entity.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                          Titular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-text-dim capitalize">
                        {entity.category} · Nv.{entity.level}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          entity.rarity === "legendary"
                            ? "text-yellow-400"
                            : entity.rarity === "epic"
                            ? "text-purple-400"
                            : entity.rarity === "rare"
                            ? "text-blue-400"
                            : entity.rarity === "uncommon"
                            ? "text-green-400"
                            : "text-text-dim"
                        }`}
                      >
                        {entity.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-[10px] text-text-dim">
                      {entity.currentHp}/{entity.maxHp}
                    </div>
                    <div className="w-16 h-1.5 bg-surface-light rounded-full mt-0.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hpPct > 50
                            ? "bg-green-500"
                            : hpPct > 25
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-text-dim text-center mt-3">
          El jugador en posición 1 es el titular en combate
        </p>
      </motion.div>
    </motion.div>
  );
}
