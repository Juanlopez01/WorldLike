"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useCombatStore } from "@/core/store/combat-store";
import { CombatantDisplay } from "./CombatantDisplay";
import { SkillMenu } from "./SkillMenu";
import { TurnLog } from "./TurnLog";
import { VictoryScreen } from "./VictoryScreen";
import type { CombatAction } from "@/core/types";

interface BattleScreenProps {
  onCombatEnd: (result: "victory" | "defeat" | "fled", rewards: { xp: number; resources: Record<string, number> } | null) => void;
}

export function BattleScreen({ onCombatEnd }: BattleScreenProps) {
  const combat = useCombatStore((s) => s.combat);
  const lastResult = useCombatStore((s) => s.lastResult);
  const rewards = useCombatStore((s) => s.rewards);

  const activePlayer = useMemo(
    () => combat?.playerTeam.find((c) => c.isActive && c.currentHp > 0) ?? null,
    [combat]
  );
  const activeEnemy = useMemo(
    () => combat?.enemyTeam.find((c) => c.isActive && c.currentHp > 0) ?? null,
    [combat]
  );

  const isPlayerTurn = combat?.status === "player_turn";
  const isAnimating = combat?.status === "enemy_turn";

  const handleSkill = useCallback(
    (skillId: string) => {
      if (!activePlayer || !activeEnemy) return;
      const action: CombatAction = {
        kind: "skill",
        skillId,
        sourceId: activePlayer.instanceId,
        targetId: activeEnemy.instanceId,
      };
      useCombatStore.getState().playerAction(action);
    },
    [activePlayer, activeEnemy]
  );

  const handleFlee = useCallback(() => {
    if (!activePlayer) return;
    const action: CombatAction = {
      kind: "flee",
      sourceId: activePlayer.instanceId,
    };
    useCombatStore.getState().playerAction(action);
  }, [activePlayer]);

  const handleRecruit = useCallback(() => {
    if (!activePlayer || !activeEnemy) return;
    const action: CombatAction = {
      kind: "recruit",
      sourceId: activePlayer.instanceId,
      targetId: activeEnemy.instanceId,
    };
    useCombatStore.getState().playerAction(action);
  }, [activePlayer, activeEnemy]);

  const handleContinue = useCallback(() => {
    if (!combat) return;
    const result = combat.status === "victory" ? "victory" : combat.status === "defeat" ? "defeat" : "fled";
    onCombatEnd(result as "victory" | "defeat" | "fled", rewards);
    useCombatStore.getState().endCombat();
  }, [combat, rewards, onCombatEnd]);

  if (!combat) return null;

  if (combat.status === "victory" && rewards) {
    return (
      <VictoryScreen
        xp={rewards.xp}
        resources={rewards.resources}
        onContinue={handleContinue}
      />
    );
  }

  if (combat.status === "defeat") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-full max-w-sm bg-surface border border-danger/30 rounded-xl p-6 text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <span className="text-5xl block mb-2">💀</span>
          <h2 className="text-xl font-black text-danger mb-4">DERROTA</h2>
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-lg font-bold text-sm bg-surface-light border border-border text-text hover:bg-surface transition-all"
          >
            CONTINUAR
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (combat.status === "fled") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <span className="text-5xl block mb-2">🏃</span>
          <h2 className="text-xl font-black text-text-secondary mb-4">HUISTE</h2>
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-lg font-bold text-sm bg-surface-light border border-border text-text hover:bg-surface transition-all"
          >
            CONTINUAR
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-bg p-4 max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest">
          Turno {combat.turn}
        </h2>
        <div className="flex justify-center gap-1 mt-1">
          {combat.environment && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-surface-light text-text-dim uppercase">
              {combat.environment}
            </span>
          )}
          <span
            className={`text-[9px] px-2 py-0.5 rounded font-bold ${
              isPlayerTurn
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent"
            }`}
          >
            {isPlayerTurn ? "TU TURNO" : "TURNO RIVAL"}
          </span>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-around py-4">
          {activeEnemy && (
            <CombatantDisplay
              combatant={activeEnemy}
              side="enemy"
              isAttacking={isAnimating && lastResult?.action.kind === "skill"}
              isTakingDamage={
                isPlayerTurn &&
                lastResult !== null &&
                lastResult.damage > 0 &&
                lastResult.action.sourceId !== activeEnemy.instanceId
              }
              damageNumber={
                isPlayerTurn && lastResult && lastResult.action.sourceId !== activeEnemy.instanceId
                  ? lastResult.damage
                  : null
              }
              isCritical={isPlayerTurn && lastResult?.isCritical}
              effectiveness={isPlayerTurn ? lastResult?.effectiveness : undefined}
            />
          )}

          <div className="text-2xl text-text-dim font-black">VS</div>

          {activePlayer && (
            <CombatantDisplay
              combatant={activePlayer}
              side="player"
              isAttacking={
                isAnimating === false &&
                lastResult !== null &&
                lastResult.action.kind === "skill" &&
                lastResult.damage > 0 &&
                lastResult.action.sourceId === activePlayer.instanceId
              }
              damageNumber={
                lastResult && lastResult.action.sourceId !== activePlayer.instanceId
                  ? lastResult.damage
                  : null
              }
              isCritical={lastResult?.action.sourceId !== activePlayer?.instanceId && lastResult?.isCritical}
              effectiveness={lastResult?.action.sourceId !== activePlayer?.instanceId ? lastResult?.effectiveness : undefined}
            />
          )}
        </div>

        {/* Enemy team indicators */}
        <div className="flex justify-center gap-1 mb-2">
          {combat.enemyTeam.map((e) => (
            <div
              key={e.instanceId}
              className={`w-2 h-2 rounded-full ${
                e.currentHp > 0
                  ? e.isActive
                    ? "bg-danger"
                    : "bg-danger/40"
                  : "bg-surface-light"
              }`}
            />
          ))}
        </div>

        {/* Turn log */}
        <TurnLog log={combat.turnLog} />
      </div>

      {/* Controls */}
      <div className="mt-auto pt-3 border-t border-border">
        {activePlayer && (
          <SkillMenu
            skills={activePlayer.skills}
            attacker={activePlayer}
            onSelectSkill={handleSkill}
            onFlee={handleFlee}
            onRecruit={handleRecruit}
            recruitEnabled={true}
            disabled={!isPlayerTurn}
          />
        )}
      </div>
    </motion.div>
  );
}
