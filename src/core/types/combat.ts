import { z } from "zod";
import { EntityInstanceSchema, StatusEffectSchema } from "./entity";

// ─── Tabla de tipos (ventajas/desventajas) ───────────────────────

export const TypeMatchupSchema = z.object({
  attackType: z.string(),
  defendType: z.string(),
  multiplier: z.number().positive(),
});
export type TypeMatchup = z.infer<typeof TypeMatchupSchema>;

export const TypeChartSchema = z.object({
  types: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  })),
  matchups: z.array(TypeMatchupSchema),
  defaultMultiplier: z.number().default(1),
});
export type TypeChart = z.infer<typeof TypeChartSchema>;

// ─── Acciones de combate ─────────────────────────────────────────

export const CombatActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("skill"),
    skillId: z.string(),
    sourceId: z.string(),
    targetId: z.string(),
  }),
  z.object({
    kind: z.literal("swap"),
    sourceId: z.string(),
    swapInId: z.string(),
  }),
  z.object({
    kind: z.literal("item"),
    itemId: z.string(),
    sourceId: z.string(),
    targetId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("flee"),
    sourceId: z.string(),
  }),
  z.object({
    kind: z.literal("recruit"),
    sourceId: z.string(),
    targetId: z.string(),
    method: z.string().optional(),
  }),
]);
export type CombatAction = z.infer<typeof CombatActionSchema>;

// ─── Resultado de un turno ───────────────────────────────────────

export const TurnResultSchema = z.object({
  turn: z.number().int(),
  action: CombatActionSchema,
  damage: z.number().default(0),
  healing: z.number().default(0),
  isCritical: z.boolean().default(false),
  effectiveness: z.enum(["normal", "super_effective", "not_effective", "immune"]).default("normal"),
  appliedEffects: z.array(StatusEffectSchema).default([]),
  removedEffects: z.array(z.string()).default([]),
  message: z.string(),
  fainted: z.array(z.string()).default([]),
  recruited: z.string().optional(),
});
export type TurnResult = z.infer<typeof TurnResultSchema>;

// ─── Estado del combate ──────────────────────────────────────────

export const CombatantSchema = EntityInstanceSchema.extend({
  side: z.enum(["player", "enemy"]),
  position: z.number().int(),
  isActive: z.boolean().default(true),
});
export type Combatant = z.infer<typeof CombatantSchema>;

export const CombatStateSchema = z.object({
  id: z.string(),
  status: z.enum(["setup", "player_turn", "enemy_turn", "animating", "victory", "defeat", "fled"]),
  turn: z.number().int().default(0),
  maxTurns: z.number().int().optional(),

  playerTeam: z.array(CombatantSchema),
  enemyTeam: z.array(CombatantSchema),

  turnLog: z.array(TurnResultSchema).default([]),

  rewards: z.object({
    xp: z.number().default(0),
    resources: z.record(z.string(), z.number()).default({}),
    entities: z.array(z.string()).default([]),
    items: z.array(z.string()).default([]),
  }).optional(),

  environment: z.string().optional(),
  specialRules: z.array(z.string()).default([]),
});
export type CombatState = z.infer<typeof CombatStateSchema>;

// ─── Encounter template (definida en JSON del theme) ─────────────

export const EncounterTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  difficulty: z.number().min(1).max(10),
  enemies: z.array(z.object({
    templateId: z.string(),
    levelRange: z.tuple([z.number(), z.number()]),
    count: z.number().int().positive().default(1),
  })),
  environment: z.string().optional(),
  specialRules: z.array(z.string()).default([]),
  isBoss: z.boolean().default(false),
  music: z.string().optional(),
  rewards: z.object({
    xpMultiplier: z.number().default(1),
    guaranteedDrops: z.array(z.string()).default([]),
    bonusResourceChance: z.record(z.string(), z.number()).default({}),
    recruitChance: z.number().min(0).max(1).default(0),
  }).default({}),
});
export type EncounterTemplate = z.infer<typeof EncounterTemplateSchema>;

// ─── Config de combate (reglas del theme) ────────────────────────

export const CombatConfigSchema = z.object({
  maxPartySize: z.number().int().min(1).max(6).default(4),
  maxActivePerSide: z.number().int().min(1).max(3).default(1),
  baseCritChance: z.number().min(0).max(1).default(0.1),
  critMultiplier: z.number().default(1.5),
  fleeBaseChance: z.number().min(0).max(1).default(0.5),
  recruitEnabled: z.boolean().default(true),
  typeChart: TypeChartSchema.optional(),
  damageFormula: z.enum(["standard", "percentage", "flat"]).default("standard"),
  speedDeterminesTurnOrder: z.boolean().default(true),
  turnOrderStat: z.string().default("speed"),
});
export type CombatConfig = z.infer<typeof CombatConfigSchema>;
