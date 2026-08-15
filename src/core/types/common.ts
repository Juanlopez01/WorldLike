import { z } from "zod";

// ─── Primitivas reutilizables ────────────────────────────────────

export const RaritySchema = z.enum([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
]);
export type Rarity = z.infer<typeof RaritySchema>;

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  current: z.number(),
  max: z.number().optional(),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const StatsSchema = z.record(z.string(), z.number());
export type Stats = z.infer<typeof StatsSchema>;

export const StatDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
});
export type StatDefinition = z.infer<typeof StatDefinitionSchema>;

export const ConditionSchema = z.object({
  type: z.enum(["stat_gte", "stat_lte", "has_entity", "has_skill", "has_tag", "resource_gte", "flag"]),
  target: z.string(),
  value: z.union([z.number(), z.string(), z.boolean()]),
});
export type Condition = z.infer<typeof ConditionSchema>;

export const WeightedIdSchema = z.object({
  id: z.string(),
  weight: z.number().positive(),
});
export type WeightedId = z.infer<typeof WeightedIdSchema>;
