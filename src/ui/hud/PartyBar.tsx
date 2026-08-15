"use client";

import { motion } from "framer-motion";
import type { EntityInstance } from "@/core/types";
import { getOverallRating } from "@/core/engine/entity-manager";

interface PartyBarProps {
  party: EntityInstance[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: "#607d8b",
  uncommon: "#66bb6a",
  rare: "#42a5f5",
  epic: "#b388ff",
  legendary: "#ffd600",
};

export function PartyBar({ party, onSelect, selectedIndex }: PartyBarProps) {
  if (party.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {party.map((entity, i) => {
        const color = RARITY_COLORS[entity.rarity] ?? "#607d8b";
        const hpPct = entity.currentHp / entity.maxHp;
        const isSelected = selectedIndex === i;

        return (
          <motion.button
            key={entity.instanceId}
            onClick={() => onSelect?.(i)}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex-shrink-0 w-14 rounded-lg border overflow-hidden
              transition-colors
              ${isSelected ? "border-primary bg-surface-glow" : "border-border bg-surface"}
            `}
          >
            {/* Rarity accent */}
            <div className="h-0.5" style={{ backgroundColor: color }} />

            <div className="p-1.5 flex flex-col items-center">
              {/* Mini portrait */}
              {entity.imageUrl ? (
                <img
                  src={entity.imageUrl}
                  alt={entity.name}
                  className="w-8 h-8 rounded object-cover mb-1"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded mb-1 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {getOverallRating(entity.stats)}
                </div>
              )}

              {/* Name */}
              <span className="text-[8px] text-text-secondary truncate w-full text-center leading-tight">
                {entity.name.split(" ").pop()}
              </span>

              {/* HP mini bar */}
              <div className="w-full h-0.5 mt-1 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${hpPct * 100}%`,
                    backgroundColor:
                      hpPct > 0.5 ? "#00e676" : hpPct > 0.25 ? "#ffd600" : "#ff5252",
                  }}
                />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
