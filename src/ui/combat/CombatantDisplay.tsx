"use client";

import { motion } from "framer-motion";
import type { Combatant } from "@/core/types";

interface CombatantDisplayProps {
  combatant: Combatant;
  side: "player" | "enemy";
  isAttacking?: boolean;
  isTakingDamage?: boolean;
  damageNumber?: number | null;
  isCritical?: boolean;
  effectiveness?: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: "#607d8b",
  uncommon: "#66bb6a",
  rare: "#42a5f5",
  epic: "#b388ff",
  legendary: "#ffd600",
};

export function CombatantDisplay({
  combatant,
  side,
  isAttacking,
  isTakingDamage,
  damageNumber,
  isCritical,
  effectiveness,
}: CombatantDisplayProps) {
  const color = RARITY_COLORS[combatant.rarity] ?? "#607d8b";
  const hpPct = combatant.currentHp / combatant.maxHp;
  const hpColor = hpPct > 0.5 ? "#00e676" : hpPct > 0.25 ? "#ffd600" : "#ff5252";

  return (
    <motion.div
      className={`flex flex-col items-center ${side === "enemy" ? "order-first" : ""}`}
      animate={
        isAttacking
          ? { x: side === "player" ? 20 : -20 }
          : isTakingDamage
          ? { x: [0, -5, 5, -3, 3, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.3 }}
    >
      {/* Portrait */}
      <div
        className="relative w-20 h-20 rounded-lg border-2 overflow-hidden mb-2"
        style={{ borderColor: color, background: `${color}10` }}
      >
        {combatant.imageUrl ? (
          <img
            src={combatant.imageUrl}
            alt={combatant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {side === "enemy" ? "👤" : "⚽"}
          </div>
        )}

        {!combatant.currentHp && (
          <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
            <span className="text-xl">💀</span>
          </div>
        )}

        {damageNumber != null && damageNumber > 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
            key={`dmg-${Date.now()}`}
          >
            <span
              className={`font-black text-lg drop-shadow-lg ${
                isCritical ? "text-yellow-400 text-xl" :
                effectiveness === "super_effective" ? "text-red-400" :
                effectiveness === "not_effective" ? "text-blue-300 text-sm" :
                "text-white"
              }`}
            >
              -{damageNumber}
              {isCritical && "!"}
            </span>
          </motion.div>
        )}
      </div>

      {/* Name + Level */}
      <div className="text-center mb-1">
        <p className="text-xs font-bold text-text truncate max-w-24">{combatant.name}</p>
        <p className="text-[9px] text-text-dim">
          Nv.{combatant.level}
          {combatant.team && <> · {combatant.team}</>}
        </p>
        {combatant.country && (
          <p className="text-[8px] text-text-dim/60 truncate max-w-24">{combatant.country}</p>
        )}
      </div>

      {/* HP bar */}
      <div className="w-24">
        <div className="flex justify-between text-[9px] mb-0.5">
          <span style={{ color: hpColor }}>HP</span>
          <span className="text-text-secondary font-mono">
            {combatant.currentHp}/{combatant.maxHp}
          </span>
        </div>
        <div className="h-2 bg-surface-light rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: hpColor }}
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Types */}
      <div className="flex gap-1 mt-1">
        {combatant.types.map((t) => (
          <span
            key={t}
            className="text-[8px] uppercase px-1 py-0.5 rounded bg-surface-light text-text-dim"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
