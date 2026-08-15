"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GameEvent, Choice, Outcome } from "@/core/types";

interface EventScreenProps {
  event: GameEvent;
  playerStats: Record<string, number>;
  playerResources: Record<string, number>;
  onChoiceResult: (outcome: Outcome, choice: Choice) => void;
}

export function EventScreen({
  event,
  playerStats,
  playerResources,
  onChoiceResult,
}: EventScreenProps) {
  const [result, setResult] = useState<{
    outcome: Outcome;
    choice: Choice;
    success: boolean;
  } | null>(null);

  const handleChoice = (choice: Choice) => {
    for (const [resource, cost] of Object.entries(choice.costs)) {
      if ((playerResources[resource] ?? 0) < cost) return;
    }

    let success = true;
    if (choice.successChance < 1) {
      let chance = choice.successChance;
      if (choice.checkStat && choice.checkThreshold) {
        const statVal = playerStats[choice.checkStat] ?? 0;
        const bonus = (statVal - choice.checkThreshold) * 0.01;
        chance = Math.min(0.95, Math.max(0.05, chance + bonus));
      }
      success = Math.random() < chance;
    }

    const outcome = success
      ? choice.successOutcome
      : choice.failureOutcome ?? choice.successOutcome;

    setResult({ outcome, choice, success });
  };

  const handleContinue = () => {
    if (!result) return;
    onChoiceResult(result.outcome, result.choice);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm bg-surface border border-border rounded-xl overflow-hidden max-h-[85vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="p-4 text-center bg-[#b388ff]/5">
          <span className="text-3xl block mb-2">📜</span>
          <h2 className="text-lg font-bold text-text">{event.title}</h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Choices or Result */}
        <div className="p-4">
          {!result ? (
            <div className="space-y-2">
              {event.choices.map((choice) => {
                const canAfford = Object.entries(choice.costs).every(
                  ([r, c]) => (playerResources[r] ?? 0) >= c
                );

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    disabled={!canAfford}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-all
                      ${canAfford
                        ? "border-border bg-surface-light hover:border-primary/40 hover:bg-primary/5 cursor-pointer active:scale-[0.98]"
                        : "border-border/50 bg-surface opacity-40 cursor-not-allowed"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {choice.icon && (
                        <span className="text-lg mt-0.5">{choice.icon}</span>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text">
                          {choice.text}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(choice.costs).map(([r, c]) => (
                            <span
                              key={r}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger"
                            >
                              -{c} {r}
                            </span>
                          ))}
                          {choice.checkStat && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info">
                              {choice.checkStat} ≥ {choice.checkThreshold}
                            </span>
                          )}
                          {choice.successChance < 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                              {Math.round(choice.successChance * 100)}% base
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg border ${
                  result.success
                    ? "border-primary/30 bg-primary/5"
                    : "border-danger/30 bg-danger/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {result.success ? "✅" : "❌"}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${
                      result.success ? "text-primary" : "text-danger"
                    }`}
                  >
                    {result.success ? "Éxito" : "Fracaso"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {result.outcome.description}
                </p>
              </div>

              {/* Outcome details */}
              <div className="space-y-1">
                {Object.entries(result.outcome.resourceChanges).map(
                  ([key, val]) =>
                    val !== 0 && (
                      <div
                        key={key}
                        className="flex justify-between text-xs px-2 py-1 rounded bg-surface-light"
                      >
                        <span className="text-text-secondary capitalize">
                          {key}
                        </span>
                        <span
                          className={
                            val > 0 ? "text-primary font-bold" : "text-danger font-bold"
                          }
                        >
                          {val > 0 ? "+" : ""}
                          {val}
                        </span>
                      </div>
                    )
                )}
                {result.outcome.xpGain && result.outcome.xpGain > 0 && (
                  <div className="flex justify-between text-xs px-2 py-1 rounded bg-surface-light">
                    <span className="text-text-secondary">XP</span>
                    <span className="text-primary font-bold">
                      +{result.outcome.xpGain}
                    </span>
                  </div>
                )}
                {result.outcome.healParty && result.outcome.healParty > 0 && (
                  <div className="flex justify-between text-xs px-2 py-1 rounded bg-surface-light">
                    <span className="text-text-secondary">Curación</span>
                    <span className="text-primary font-bold">
                      +{result.outcome.healParty} HP
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:brightness-105 active:scale-[0.98] transition-all"
              >
                CONTINUAR
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
