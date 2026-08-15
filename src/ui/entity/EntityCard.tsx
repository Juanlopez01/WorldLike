"use client";

import { motion } from "framer-motion";
import type { EntityInstance, EntityTemplate, Rarity } from "@/core/types";
import { getOverallRating } from "@/core/engine/entity-manager";

type Entity = EntityInstance | EntityTemplate;

interface EntityCardProps {
  entity: Entity;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const RARITY_GRADIENT: Record<Rarity, { from: string; to: string; accent: string }> = {
  common: { from: "#8e9eab", to: "#6b7d8d", accent: "#5a6d7d" },
  uncommon: { from: "#2e8b57", to: "#1a6b3a", accent: "#0d5a2a" },
  rare: { from: "#2980b9", to: "#1a5a8a", accent: "#0d4a7a" },
  epic: { from: "#7e57c2", to: "#5a3a9a", accent: "#4a2a8a" },
  legendary: { from: "#d4a017", to: "#b8860b", accent: "#8b6914" },
};

const STAT_LABELS: Record<string, string> = {
  ritmo: "RIT",
  tiro: "TIR",
  pase: "PAS",
  regate: "REG",
  defensa: "DEF",
  fisico: "FIS",
  reflejos: "REF",
  posicion: "POS",
};

export function EntityCard({ entity, selected, compact, onClick }: EntityCardProps) {
  const rarity = RARITY_GRADIENT[entity.rarity];
  const overall = getOverallRating(entity.stats);
  const level = "level" in entity ? entity.level : ("initialLevel" in entity ? entity.initialLevel : 1);
  const isInstance = "currentHp" in entity;

  const stats = Object.entries(entity.stats).slice(0, 6);
  const leftStats = stats.slice(0, 3);
  const rightStats = stats.slice(3, 6);

  if (compact) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={onClick ? { scale: 1.01 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        className={`relative rounded-xl overflow-hidden transition-all ${onClick ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-primary" : ""}`}
        style={{
          background: `linear-gradient(135deg, ${rarity.from}18, ${rarity.to}08)`,
          border: `1px solid ${rarity.from}30`,
        }}
      >
        <div className="flex items-center gap-3 p-2.5">
          {entity.imageUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${rarity.from}30, ${rarity.to}15)` }}>
              <img src={entity.imageUrl} alt={entity.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `linear-gradient(135deg, ${rarity.from}30, ${rarity.to}15)` }}>
              ⚽
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-text truncate">{entity.name}</h3>
            <p className="text-[9px] text-text-secondary">{entity.category} · Nv.{level}</p>
            {isInstance && (
              <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: `${rarity.from}20` }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp) * 100}%`,
                    backgroundColor: (entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp > 0.5 ? "#27ae60" : (entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp > 0.25 ? "#d4a017" : "#c0392b",
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-lg font-black" style={{ color: rarity.from }}>{overall}</span>
            <span className="text-[7px] text-text-dim block -mt-0.5">OVR</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -3 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`relative w-full max-w-[220px] mx-auto aspect-[3/4.2] rounded-2xl overflow-hidden transition-all
        ${onClick ? "cursor-pointer" : ""}
        ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : ""}
      `}
      style={{
        background: `linear-gradient(160deg, ${rarity.from}, ${rarity.to} 60%, ${rarity.accent})`,
        boxShadow: selected ? `0 8px 24px ${rarity.from}40` : `0 4px 12px rgba(0,0,0,0.15)`,
      }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `radial-gradient(circle at 30% 20%, white 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }} />

      {/* Top section: OVR + position + country */}
      <div className="relative z-10 flex justify-between items-start p-3 pb-0">
        <div className="text-center">
          <div className="text-3xl font-black text-white leading-none drop-shadow-sm">{overall}</div>
          <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">OVR</div>
          <div className="text-[9px] font-bold text-white/80 uppercase mt-1">{entity.category.slice(0, 3)}</div>
          <div className="text-[9px] text-white/60 mt-0.5">Nv.{level}</div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {entity.types.slice(0, 2).map((t) => (
            <span key={t} className="text-[7px] font-bold uppercase tracking-wider text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Player image */}
      <div className="relative z-10 flex justify-center -mt-1">
        {entity.imageUrl ? (
          <div className="w-28 h-28 relative">
            <img
              src={entity.imageUrl}
              alt={entity.name}
              className="w-full h-full object-contain drop-shadow-lg"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-28 h-28 flex items-center justify-center text-5xl opacity-50">
            ⚽
          </div>
        )}
      </div>

      {/* Bottom card: name + stats */}
      <div className="relative z-10 mx-2 -mt-2 mb-2 rounded-xl bg-black/20 backdrop-blur-sm p-2.5 border border-white/10">
        {/* Name bar */}
        <div className="text-center mb-2 pb-1.5 border-b border-white/15">
          <h3 className="text-xs font-black text-white truncate">{entity.name}</h3>
          {entity.team && (
            <p className="text-[8px] text-white/50 truncate">{entity.team} {entity.country ? `· ${entity.country}` : ""}</p>
          )}
        </div>

        {/* Stats hexagonal layout (like EA FC) */}
        <div className="flex justify-between gap-1">
          <div className="flex-1 space-y-0.5">
            {leftStats.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/90 tabular-nums w-5 text-right">{value}</span>
                <span className="text-[7px] font-bold text-white/50 uppercase tracking-wider">{STAT_LABELS[key] ?? key.slice(0, 3).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex-1 space-y-0.5">
            {rightStats.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/90 tabular-nums w-5 text-right">{value}</span>
                <span className="text-[7px] font-bold text-white/50 uppercase tracking-wider">{STAT_LABELS[key] ?? key.slice(0, 3).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HP bar for instances */}
        {isInstance && (
          <div className="mt-2 pt-1.5 border-t border-white/10">
            <div className="flex items-center justify-between text-[8px] text-white/50 mb-0.5">
              <span>HP</span>
              <span className="tabular-nums">{(entity as EntityInstance).currentHp}/{(entity as EntityInstance).maxHp}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: (entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp > 0.5 ? "#4caf50" : (entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp > 0.25 ? "#ffc107" : "#f44336",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${((entity as EntityInstance).currentHp / (entity as EntityInstance).maxHp) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* XP bar for instances */}
        {"xp" in entity && "xpToNext" in entity && (
          <div className="mt-1">
            <div className="h-0.5 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400/70 transition-all"
                style={{ width: `${(entity.xp / entity.xpToNext) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rarity label */}
      <div className="absolute top-2 right-2 z-20">
        <span className="text-[7px] font-black uppercase tracking-widest text-white/40">
          {entity.rarity === "legendary" ? "★" : entity.rarity === "epic" ? "◆" : ""}
        </span>
      </div>
    </motion.div>
  );
}
