"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Skill, Combatant, TypeChart } from "@/core/types";
import { getTypeMultiplier } from "@/core/engine/combat-engine";

interface SkillMenuProps {
  skills: Skill[];
  attacker: Combatant;
  enemyTypes: string[];
  typeChart?: TypeChart;
  onSelectSkill: (skillId: string) => void;
  onFlee: () => void;
  onRecruit: () => void;
  recruitEnabled: boolean;
  disabled?: boolean;
}

function getEffectivenessLabel(effectiveness: string): { text: string; color: string } | null {
  if (effectiveness === "super_effective") return { text: "Ventaja", color: "text-primary" };
  if (effectiveness === "not_effective") return { text: "Desventaja", color: "text-danger" };
  if (effectiveness === "immune") return { text: "Inmune", color: "text-text-dim" };
  return null;
}

function getOverallTypeAdvantage(
  attackerTypes: string[],
  defenderTypes: string[],
  typeChart?: TypeChart
): { text: string; color: string; icon: string } | null {
  if (!typeChart || attackerTypes.length === 0 || defenderTypes.length === 0) return null;

  let bestMult = 1;
  let bestAttack = "";
  let bestDefend = "";

  for (const atkType of attackerTypes) {
    for (const defType of defenderTypes) {
      const matchup = typeChart.matchups.find(
        (m) => m.attackType === atkType && m.defendType === defType
      );
      if (matchup && matchup.multiplier > bestMult) {
        bestMult = matchup.multiplier;
        bestAttack = atkType;
        bestDefend = defType;
      }
    }
  }

  let worstMult = 1;
  let worstAttack = "";
  let worstDefend = "";

  for (const atkType of attackerTypes) {
    for (const defType of defenderTypes) {
      const matchup = typeChart.matchups.find(
        (m) => m.attackType === atkType && m.defendType === defType
      );
      if (matchup && matchup.multiplier < worstMult) {
        worstMult = matchup.multiplier;
        worstAttack = atkType;
        worstDefend = defType;
      }
    }
  }

  if (bestMult > 1) {
    return {
      text: `${bestAttack} > ${bestDefend}`,
      color: "text-primary",
      icon: "▲",
    };
  }
  if (worstMult < 1) {
    return {
      text: `${worstAttack} < ${worstDefend}`,
      color: "text-danger",
      icon: "▼",
    };
  }
  return null;
}

export function SkillMenu({
  skills,
  attacker,
  enemyTypes,
  typeChart,
  onSelectSkill,
  onFlee,
  onRecruit,
  recruitEnabled,
  disabled,
}: SkillMenuProps) {
  const typeAdvantage = useMemo(
    () => getOverallTypeAdvantage(attacker.types, enemyTypes, typeChart),
    [attacker.types, enemyTypes, typeChart]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] text-text-dim uppercase tracking-wider">
          Habilidades
        </h4>
        {typeAdvantage && (
          <span className={`text-[9px] font-bold ${typeAdvantage.color} uppercase`}>
            {typeAdvantage.icon} {typeAdvantage.text}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill, i) => {
          const onCooldown = (attacker.cooldowns[skill.id] ?? 0) > 0;
          const isDisabled = disabled || onCooldown;

          const { effectiveness } = getTypeMultiplier(
            attacker.types,
            enemyTypes,
            skill.damageType,
            typeChart
          );
          const effLabel = getEffectivenessLabel(effectiveness ?? "normal");

          return (
            <motion.button
              key={skill.id}
              onClick={() => !isDisabled && onSelectSkill(skill.id)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              disabled={isDisabled}
              className={`
                text-left p-2 rounded-lg border text-xs transition-all
                ${isDisabled
                  ? "opacity-40 cursor-not-allowed border-border bg-surface"
                  : effLabel?.text === "Ventaja"
                    ? "border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 active:scale-[0.97] cursor-pointer"
                    : effLabel?.text === "Desventaja"
                      ? "border-danger/30 bg-danger/5 hover:border-danger/50 hover:bg-danger/10 active:scale-[0.97] cursor-pointer"
                      : "border-border bg-surface hover:border-primary/50 hover:bg-surface-light active:scale-[0.97] cursor-pointer"
                }
              `}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-text truncate">{skill.name}</span>
                <span className="text-primary font-mono text-[10px]">
                  {skill.power > 0 ? skill.power : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-text-dim">
                {skill.damageType && (
                  <span className="uppercase">{skill.damageType}</span>
                )}
                <span>{skill.accuracy}%</span>
                {skill.cost > 0 && <span>{skill.cost} {skill.costResource}</span>}
                {onCooldown && (
                  <span className="text-accent">CD: {attacker.cooldowns[skill.id]}</span>
                )}
                {effLabel && (
                  <span className={`font-bold ${effLabel.color}`}>
                    {effLabel.text === "Ventaja" ? "▲" : effLabel.text === "Desventaja" ? "▼" : "—"} {effLabel.text}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        {recruitEnabled && (
          <button
            onClick={onRecruit}
            disabled={disabled}
            className="flex-1 py-2 rounded-lg border border-border bg-surface text-xs font-bold
              text-info hover:border-info/40 hover:bg-info/5 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reclutar
          </button>
        )}
        <button
          onClick={onFlee}
          disabled={disabled}
          className="flex-1 py-2 rounded-lg border border-border bg-surface text-xs font-bold
            text-text-secondary hover:border-text-dim hover:bg-surface-light transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Huir
        </button>
      </div>
    </div>
  );
}
