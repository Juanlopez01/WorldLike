import type { EntityTemplate, EntityInstance, Stats } from "../types";
import { SeededRNG } from "./rng";

let instanceCounter = 0;

export function instantiateEntity(
  template: EntityTemplate,
  rng: SeededRNG
): EntityInstance {
  const id = `inst_${template.id}_${++instanceCounter}_${Date.now()}`;
  const level = template.initialLevel ?? 1;

  const stats = { ...template.stats };
  const maxHp = calculateMaxHp(stats);

  return {
    ...template,
    instanceId: id,
    templateId: template.id,
    level,
    xp: 0,
    xpToNext: calculateXpToNext(level),
    stats,
    currentHp: maxHp,
    maxHp,
    activeEffects: [],
    cooldowns: {},
    skills: template.skills ?? [],
    learnableSkills: template.learnableSkills ?? [],
    evolutions: template.evolutions ?? [],
    tags: template.tags ?? [],
    types: template.types ?? [],
  };
}

export function calculateMaxHp(stats: Stats): number {
  const values = Object.values(stats);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.floor(avg * 2 + 50);
}

export function calculateXpToNext(
  level: number,
  base = 80,
  rate = 1.2
): number {
  return Math.floor(base * Math.pow(rate, level - 1));
}

export function addXp(
  entity: EntityInstance,
  amount: number,
  growthRates?: Stats
): { entity: EntityInstance; levelsGained: number } {
  let xp = entity.xp + amount;
  let level = entity.level;
  let xpToNext = entity.xpToNext;
  let stats = { ...entity.stats };
  let levelsGained = 0;

  while (xp >= xpToNext && level < entity.maxLevel) {
    xp -= xpToNext;
    level++;
    levelsGained++;
    xpToNext = calculateXpToNext(level);

    if (growthRates) {
      for (const [stat, growth] of Object.entries(growthRates)) {
        if (stat in stats) {
          stats[stat] = Math.min(99, stats[stat] + growth);
        }
      }
    }
  }

  const maxHp = calculateMaxHp(stats);

  return {
    entity: {
      ...entity,
      level,
      xp,
      xpToNext,
      stats,
      maxHp,
      currentHp: levelsGained > 0 ? maxHp : entity.currentHp,
    },
    levelsGained,
  };
}

export function healEntity(
  entity: EntityInstance,
  amount: number
): EntityInstance {
  return {
    ...entity,
    currentHp: Math.min(entity.maxHp, entity.currentHp + amount),
  };
}

export function damageEntity(
  entity: EntityInstance,
  amount: number
): EntityInstance {
  return {
    ...entity,
    currentHp: Math.max(0, entity.currentHp - amount),
  };
}

export function isAlive(entity: EntityInstance): boolean {
  return entity.currentHp > 0;
}

export function getOverallRating(stats: Stats): number {
  const values = Object.values(stats);
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}
