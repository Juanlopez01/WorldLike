"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { EntityInstance } from "@/core/types";
import { getOverallRating } from "@/core/engine/entity-manager";

interface PlayerDetailPanelProps {
  entity: EntityInstance;
  onClose: () => void;
}

const STAT_LABELS: Record<string, string> = {
  ritmo: "Ritmo",
  tiro: "Tiro",
  pase: "Pase",
  regate: "Regate",
  defensa: "Defensa",
  fisico: "Físico",
  reflejos: "Reflejos",
  posicion: "Posición",
};

const RARITY_COLORS: Record<string, string> = {
  common: "#64748b",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#fbbf24",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Común",
  uncommon: "Poco común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
};

export function PlayerDetailPanel({ entity, onClose }: PlayerDetailPanelProps) {
  const overall = getOverallRating(entity.stats);
  const rarityColor = RARITY_COLORS[entity.rarity] ?? "#64748b";
  const hpPercent = entity.maxHp > 0 ? (entity.currentHp / entity.maxHp) * 100 : 0;
  const xpPercent = entity.xpToNext > 0 ? (entity.xp / entity.xpToNext) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl bg-bg border-t border-border"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          <div className="sticky top-0 bg-bg/90 backdrop-blur-sm z-10 px-4 pt-3 pb-2 border-b border-border/50">
            <div className="w-8 h-1 bg-border rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {entity.imageUrl ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}10)` }}>
                    <img src={entity.imageUrl} alt={entity.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}10)` }}>
                    ⚽
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-black text-text">{entity.name}</h2>
                  <p className="text-[10px] text-text-secondary">
                    {entity.category} · Nv.{entity.level}
                    {entity.team && ` · ${entity.team}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black" style={{ color: rarityColor }}>{overall}</span>
                <span className="text-[8px] text-text-dim block -mt-1">OVR</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 space-y-4">
            {/* Rarity + Types */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ color: rarityColor, backgroundColor: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                {RARITY_LABELS[entity.rarity] ?? entity.rarity}
              </span>
              {entity.types.map((t) => (
                <span key={t} className="text-[9px] font-bold uppercase text-text-dim bg-surface px-2 py-0.5 rounded-full border border-border">
                  {t}
                </span>
              ))}
            </div>

            {/* HP + XP bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-text-secondary font-bold">HP</span>
                  <span className="text-text-dim tabular-nums">{entity.currentHp}/{entity.maxHp}</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${hpPercent}%`,
                      backgroundColor: hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#eab308" : "#ef4444",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-text-secondary font-bold">XP</span>
                  <span className="text-text-dim tabular-nums">{entity.xp}/{entity.xpToNext}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400/70 transition-all" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-bold mb-2">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {Object.entries(entity.stats).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-text-secondary w-14 truncate">
                      {STAT_LABELS[key] ?? key}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(value, 99)}%`,
                          backgroundColor: value >= 80 ? "#22c55e" : value >= 60 ? "#3b82f6" : value >= 40 ? "#eab308" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-text tabular-nums w-5 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-bold mb-2">
                Habilidades ({entity.skills.length})
              </h3>
              <div className="space-y-1.5">
                {entity.skills.map((skill) => (
                  <div key={skill.id} className="p-2 rounded-lg bg-surface border border-border/50">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-text">{skill.name}</span>
                      <div className="flex items-center gap-2 text-[9px]">
                        {skill.power > 0 && (
                          <span className="font-mono font-bold text-primary">{skill.power}</span>
                        )}
                        <span className="text-text-dim">{skill.accuracy}%</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-text-secondary leading-relaxed">{skill.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[8px] text-text-dim">
                      {skill.damageType && (
                        <span className="uppercase font-bold bg-surface-light px-1.5 py-0.5 rounded">{skill.damageType}</span>
                      )}
                      {skill.cost > 0 && <span>{skill.cost} {skill.costResource}</span>}
                      {skill.cooldown > 0 && <span>CD: {skill.cooldown}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passive */}
            {"passiveAbility" in entity && entity.passiveAbility && (
              <div>
                <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-bold mb-2">Pasiva</h3>
                <div className="p-2 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-[10px] text-accent font-bold">{String(entity.passiveAbility)}</p>
                </div>
              </div>
            )}

            {/* Flavor text */}
            {entity.flavorText && (
              <p className="text-[9px] text-text-dim italic text-center py-2 border-t border-border/30">
                &ldquo;{entity.flavorText}&rdquo;
              </p>
            )}
          </div>

          <div className="p-4 pt-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text hover:bg-surface-light transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
