"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EntityTemplate, ThemePack } from "@/core/types";
import { EntityCard } from "./EntityCard";
import { useMetaStore, SPECIAL_PLAYERS } from "@/core/store/meta-store";

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
  const purchasedPlayers = useMetaStore((s) => s.purchasedPlayers);

  const starters = useMemo(() => {
    const pool = theme.starter.starterPool
      .map((id) => theme.entities.find((e) => e.id === id))
      .filter((e): e is EntityTemplate => !!e);
    return shuffleArray(pool).slice(0, theme.starter.chooseBetween);
  }, [theme]);

  const specialStarters = useMemo(() => {
    if (purchasedPlayers.length === 0) return [];
    return purchasedPlayers
      .map((spId) => {
        const sp = SPECIAL_PLAYERS.find((p) => p.id === spId);
        if (!sp) return null;
        const entity = theme.entities.find((e) => e.id === spId);
        return entity ? { entity, sp } : null;
      })
      .filter((x): x is { entity: EntityTemplate; sp: typeof SPECIAL_PLAYERS[number] } => !!x);
  }, [theme, purchasedPlayers]);

  return (
    <motion.div
      className="h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="text-center mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-xl font-black text-text mb-1">
          {theme.uiTheme.labels.recruitVerb}
        </h1>
        <p className="text-xs text-text-secondary">
          Elegí tu {theme.uiTheme.labels.entitySingular} inicial
        </p>
        <div className="mt-2 h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
      </motion.div>

      {specialStarters.length > 0 && (
        <motion.div
          className="w-full max-w-2xl mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 text-center">
            Leyendas compradas
          </h3>
          <div className="flex justify-center gap-3">
            {specialStarters.map(({ entity }, i) => (
              <motion.div
                key={entity.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="w-[160px]"
              >
                <div className={`rounded-xl border-2 transition-all ${selectedId === entity.id ? "border-accent glow-yellow" : "border-accent/30"}`}>
                  <EntityCard
                    entity={entity}
                    selected={selectedId === entity.id}
                    onClick={() => setSelectedId(entity.id)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="h-px bg-border my-3" />
        </motion.div>
      )}

      <div className="flex justify-center gap-3 w-full max-w-2xl">
        <AnimatePresence>
          {starters.map((entity, i) => (
            <motion.div
              key={entity.id}
              className="w-[160px]"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: (specialStarters.length > 0 ? 0.5 : 0.3) + i * 0.15 }}
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
            className="mt-4 px-8 py-3 rounded-lg font-bold text-sm
              bg-primary text-white
              hover:brightness-110 active:scale-95
              transition-all glow-green"
          >
            CONFIRMAR
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
