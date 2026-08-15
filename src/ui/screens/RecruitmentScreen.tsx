"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { EntityTemplate } from "@/core/types";
import { EntityCard } from "../entity/EntityCard";

interface RecruitmentScreenProps {
  offers: EntityTemplate[];
  cost: Record<string, number>;
  playerResources: Record<string, number>;
  onRecruit: (template: EntityTemplate) => void;
  onSkip: () => void;
}

export function RecruitmentScreen({
  offers,
  cost,
  playerResources,
  onRecruit,
  onSkip,
}: RecruitmentScreenProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const canAfford = Object.entries(cost).every(
    ([r, c]) => (playerResources[r] ?? 0) >= c
  );

  const handleConfirm = () => {
    if (selectedIdx === null || !canAfford) return;
    onRecruit(offers[selectedIdx]);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-md bg-surface border border-border rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="p-4 text-center bg-[#00e676]/5">
          <span className="text-3xl block mb-2">🤝</span>
          <h2 className="text-lg font-bold text-text">Fichaje</h2>
          <p className="text-xs text-text-secondary mt-1">
            Elegí un jugador para sumar a tu equipo
          </p>
          {Object.entries(cost).length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              {Object.entries(cost).map(([r, c]) => (
                <span
                  key={r}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    (playerResources[r] ?? 0) >= c
                      ? "bg-surface-light text-text-secondary"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {c} {r}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {offers.map((template, i) => (
            <EntityCard
              key={template.id}
              entity={template}
              selected={selectedIdx === i}
              onClick={() => setSelectedIdx(i)}
            />
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-bold text-sm border border-border text-text-secondary hover:bg-surface-light active:scale-[0.98] transition-all"
            >
              PASAR
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIdx === null || !canAfford}
              className={`
                flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98]
                ${selectedIdx !== null && canAfford
                  ? "bg-primary text-white hover:brightness-105"
                  : "bg-surface-light text-text-dim cursor-not-allowed"
                }
              `}
            >
              FICHAR
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
