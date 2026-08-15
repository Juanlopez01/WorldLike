import { z } from "zod";
import { ConditionSchema } from "./common";

// ─── Meta Progression (persiste entre runs) ──────────────────────

export const UnlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  category: z.enum(["passive", "starter_entity", "starter_item", "map_modifier", "cosmetic", "difficulty"]),
  cost: z.number().int().positive(),
  maxLevel: z.number().int().positive().default(1),
  effect: z.object({
    type: z.string(),
    value: z.number(),
    target: z.string().optional(),
  }),
  conditions: z.array(ConditionSchema).default([]),
  tier: z.number().int().min(1).max(5).default(1),
});
export type Unlock = z.infer<typeof UnlockSchema>;

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  condition: ConditionSchema,
  reward: z.object({
    metaCurrency: z.number().default(0),
    unlockId: z.string().optional(),
  }),
  hidden: z.boolean().default(false),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const MetaProgressionSchema = z.object({
  themeId: z.string(),
  metaCurrency: z.number().int().default(0),
  totalRuns: z.number().int().default(0),
  bestRun: z.object({
    act: z.number().int(),
    score: z.number(),
    date: z.string().datetime(),
  }).optional(),
  victories: z.number().int().default(0),
  unlocks: z.record(z.string(), z.number().int()),
  achievements: z.array(z.string()),
  statistics: z.object({
    totalCombats: z.number().int().default(0),
    totalEntitiesRecruited: z.number().int().default(0),
    totalTurnsPlayed: z.number().int().default(0),
    favoriteEntity: z.string().optional(),
    highestDamage: z.number().default(0),
  }),
});
export type MetaProgression = z.infer<typeof MetaProgressionSchema>;
