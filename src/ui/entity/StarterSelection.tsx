"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EntityTemplate, ThemePack } from "@/core/types";
import { EntityCard } from "./EntityCard";

interface StarterSelectionProps {
  theme: ThemePack;
  onSelect: (templateId: string) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function StarterSelection({ theme, onSelect }: StarterSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const starters = useMemo(() => {
    const pool = theme.starter.starterPool
      .map((id) => theme.entities.find((e) => e.id === id))
      .filter((e): e is EntityTemplate => !!e);
    return shuffleArray(pool).slice(0, theme.starter.chooseBetween);
  }, [theme]);

  return (
    <div className="h-screen flex flex-col items-center justify-center overflow-y-auto p-3 sm:p-4">
      <motion.div
        className="text-center mb-3 sm:mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-lg sm:text-xl font-black text-text mb-1">
          {theme.uiTheme.labels.recruitVerb}
        </h1>
        <p className="text-[10px] sm:text-xs text-text-secondary">
          Elegí tu {theme.uiTheme.labels.entitySingular} inicial
        </p>
        <div className="mt-2 h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
      </motion.div>

      <div className="flex justify-center gap-2 sm:gap-3 w-full max-w-2xl px-1">
        <AnimatePresence>
          {starters.map((entity, i) => (
            <motion.div
              key={entity.id}
              className="flex-1 min-w-0 max-w-[180px]"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              <EntityCard
                entity={entity}
                selected={selectedId === entity.id}
                onClick={() => setSelectedId(entity.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={() => onSelect(selectedId)}
            className="mt-3 sm:mt-4 px-8 py-3 rounded-lg font-bold text-sm
              bg-primary text-white
              hover:brightness-110 active:scale-95
              transition-all glow-green"
          >
            CONFIRMAR
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
