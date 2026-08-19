"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";
import { useMetaStore } from "@/core/store/meta-store";
import { COPA_REWARDS } from "@/core/store/meta-store";

const COPA_FIELDS: Record<string, string> = {
  copa_barrial: "field-potrero",
  copa_provincial: "field-barrial",
  copa_primera: "field-barrial",
  copa_sudamericana: "field-profesional",
  copa_libertadores: "field-profesional",
  copa_europa_league: "field-continental",
  copa_champions: "field-continental",
  copa_mundial_clubes: "field-mundial",
  copa_del_mundo: "field-mundial",
};

export function CopaHubScreen() {
  const theme = useGameStore((s) => s.theme);
  const coins = useMetaStore((s) => s.coins);
  const completedCopas = useMetaStore((s) => s.completedCopas);
  const totalRuns = useMetaStore((s) => s.totalRuns);

  if (!theme) return null;

  const copaIds = theme.copas.map((c) => c.id);

  const isUnlocked = (copaId: string) => {
    return useMetaStore.getState().isCopaUnlocked(copaId, copaIds);
  };

  const isCompleted = (copaId: string) => completedCopas.includes(copaId);

  const lastCompleted = [...theme.copas].reverse().find((c) => completedCopas.includes(c.id));
  const currentFieldClass = lastCompleted ? (COPA_FIELDS[lastCompleted.id] ?? "field-potrero") : "field-potrero";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Field header */}
      <div className="relative">
        <div className={`absolute inset-0 ${currentFieldClass} opacity-40`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />

        <motion.div
          className="relative z-10 text-center pt-6 pb-8 px-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-primary">FUTBO</span>
            <span className="text-accent">LIKE</span>
          </h1>
          <div className="h-0.5 w-20 mx-auto mt-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
        </motion.div>
      </div>

      <div className="flex-1 px-4 max-w-md mx-auto w-full">
        {/* Stats bar */}
        <motion.div
          className="flex items-center justify-between mb-4 p-3 rounded-xl bg-surface border border-border card-shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">🪙</span>
            <span className="text-accent font-black text-lg tabular-nums">{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-dim">
              {totalRuns} {totalRuns === 1 ? "partida" : "partidas"}
            </span>
            <button
              onClick={() => useGameStore.getState().goToMetaShop()}
              className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-bold
                hover:bg-accent/20 hover:border-accent/50 transition-all"
            >
              ÁLBUM
            </button>
          </div>
        </motion.div>

        {/* Copa list */}
        <div className="space-y-2 pb-20">
          {theme.copas.map((copa, i) => {
            const unlocked = isUnlocked(copa.id);
            const completed = isCompleted(copa.id);
            const reward = COPA_REWARDS[copa.id] ?? 50;
            const fieldClass = COPA_FIELDS[copa.id] ?? "field-potrero";

            return (
              <motion.button
                key={copa.id}
                disabled={!unlocked}
                onClick={() => unlocked && useGameStore.getState().startCopa(copa.id)}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={unlocked ? { x: 3 } : undefined}
                whileTap={unlocked ? { scale: 0.98 } : undefined}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden
                  ${completed
                    ? "bg-surface border-2 border-primary/40 card-shadow"
                    : unlocked
                      ? "bg-surface border border-border hover:border-primary/40 card-shadow"
                      : "bg-bg-alt border border-border/60 opacity-50 cursor-not-allowed"
                  }`}
              >
                {/* Mini field stripe */}
                {unlocked && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${fieldClass} rounded-l-xl`} />
                )}

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ml-1
                  ${completed
                    ? "bg-primary/10"
                    : unlocked
                      ? "bg-bg-alt"
                      : "bg-bg-alt/50"
                  }`}
                >
                  {completed ? "✅" : unlocked ? copa.emoji : "🔒"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold truncate ${completed ? "text-primary" : unlocked ? "text-text" : "text-text-dim"}`}>
                      {copa.name}
                    </h3>
                    {completed && (
                      <span className="text-[9px] font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">
                        GANADA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-dim">
                      {copa.region}
                    </span>
                    <span className="text-[10px] text-text-dim">·</span>
                    <span className="text-[10px] text-text-dim">
                      Dif. {copa.difficultyRange[0]}-{copa.difficultyRange[1]}
                    </span>
                    <span className="text-[10px] text-text-dim">·</span>
                    <span className="text-[10px] text-accent font-bold">
                      🪙 {reward}
                    </span>
                  </div>
                </div>

                <span className={`text-lg ${unlocked ? "text-primary" : "text-text-dim/30"}`}>
                  {unlocked ? "→" : ""}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={() => useGameStore.getState().reset()}
            className="w-full py-2 rounded-lg text-[10px] font-bold text-text-dim hover:text-text-secondary transition-colors"
          >
            VOLVER AL INICIO
          </button>
        </div>
      </motion.div>
    </div>
  );
}
