import { z } from "zod";
import { ConditionSchema, RaritySchema, StatsSchema } from "./common";

// ─── Skills / Habilidades ────────────────────────────────────────

export const StatusEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["buff", "debuff", "dot", "hot", "shield", "stun", "custom"]),
  stat: z.string().optional(),
  value: z.number(),
  duration: z.number().int().positive(),
  icon: z.string().optional(),
});
export type StatusEffect = z.infer<typeof StatusEffectSchema>;

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  power: z.number().default(0),
  cost: z.number().default(0),
  costResource: z.string().default("energy"),
  accuracy: z.number().min(0).max(100).default(100),
  targetType: z.enum(["single_enemy", "all_enemies", "self", "single_ally", "all_allies"]).default("single_enemy"),
  damageType: z.string().optional(),
  effects: z.array(StatusEffectSchema).default([]),
  cooldown: z.number().int().default(0),
  unlockLevel: z.number().int().default(1),
  tags: z.array(z.string()).default([]),
});
export type Skill = z.infer<typeof SkillSchema>;

// ─── Evolución ───────────────────────────────────────────────────

export const EvolutionPathSchema = z.object({
  targetId: z.string(),
  conditions: z.array(ConditionSchema),
  cost: z.record(z.string(), z.number()).default({}),
  description: z.string().optional(),
});
export type EvolutionPath = z.infer<typeof EvolutionPathSchema>;

// ─── Entidad Base ────────────────────────────────────────────────
// Este es el schema central: un Dragón, un Jugador de fútbol,
// una Receta y un Caballero son todos BaseEntity con stats distintos.

export const BaseEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  category: z.string(),
  rarity: RaritySchema,
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  team: z.string().optional(),
  country: z.string().optional(),

  level: z.number().int().default(1),
  maxLevel: z.number().int().default(50),
  xp: z.number().default(0),
  xpToNext: z.number().default(100),

  stats: StatsSchema,
  baseStats: StatsSchema,
  growthRates: StatsSchema.optional(),

  skills: z.array(SkillSchema).default([]),
  learnableSkills: z.array(z.object({
    skillId: z.string(),
    level: z.number().int(),
  })).default([]),

  types: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  evolutions: z.array(EvolutionPathSchema).default([]),

  passiveAbility: z.string().optional(),
  flavorText: z.string().optional(),
});
export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// ─── Template vs Instance ────────────────────────────────────────
// Los JSON definen EntityTemplates (plantillas inmutables).
// Al reclutar/obtener una entidad, se instancia con estado mutable.

export const EntityTemplateSchema = BaseEntitySchema.omit({
  level: true,
  xp: true,
  xpToNext: true,
}).extend({
  initialLevel: z.number().int().default(1),
});
export type EntityTemplate = z.infer<typeof EntityTemplateSchema>;

export const EntityInstanceSchema = BaseEntitySchema.extend({
  instanceId: z.string(),
  templateId: z.string(),
  nickname: z.string().optional(),
  activeEffects: z.array(StatusEffectSchema).default([]),
  currentHp: z.number(),
  maxHp: z.number(),
  cooldowns: z.record(z.string(), z.number()).default({}),
});
export type EntityInstance = z.infer<typeof EntityInstanceSchema>;

// ─── Categoría de entidades (definida por theme) ─────────────────

export const EntityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  namePlural: z.string(),
  icon: z.string(),
  description: z.string(),
  maxInParty: z.number().int().positive(),
});
export type EntityCategory = z.infer<typeof EntityCategorySchema>;
