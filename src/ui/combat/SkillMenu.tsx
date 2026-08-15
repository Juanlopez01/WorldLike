"use client";

import { motion } from "framer-motion";
import type { Skill, Combatant } from "@/core/types";

interface SkillMenuProps {
  skills: Skill[];
  attacker: Combatant;
  onSelectSkill: (skillId: string) => void;
  onFlee: () => void;
  onRecruit: () => void;
  recruitEnabled: boolean;
  disabled?: boolean;
}

export function SkillMenu({
  skills,
  attacker,
  onSelectSkill,
  onFlee,
  onRecruit,
  recruitEnabled,
  disabled,
}: SkillMenuProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-text-dim uppercase tracking-wider">
        Habilidades
      </h4>

      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill, i) => {
          const onCooldown = (attacker.cooldowns[skill.id] ?? 0) > 0;
          const isDisabled = disabled || onCooldown;

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
            🤝 Reclutar
          </button>
        )}
        <button
          onClick={onFlee}
          disabled={disabled}
          className="flex-1 py-2 rounded-lg border border-border bg-surface text-xs font-bold
            text-text-secondary hover:border-text-dim hover:bg-surface-light transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🏃 Huir
        </button>
      </div>
    </div>
  );
}
