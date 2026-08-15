import { z } from "zod";
import { ConditionSchema } from "./common";

// ─── Outcomes (resultados de una elección) ───────────────────────

export const OutcomeSchema = z.object({
  description: z.string(),
  resourceChanges: z.record(z.string(), z.number()).default({}),
  statChanges: z.object({
    targetEntity: z.enum(["active", "all_party", "random_party", "specific"]),
    entityId: z.string().optional(),
    changes: z.record(z.string(), z.number()),
  }).optional(),
  addEntity: z.string().optional(),
  removeEntity: z.string().optional(),
  addSkill: z.object({ entityTarget: z.string(), skillId: z.string() }).optional(),
  setFlag: z.object({ key: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) }).optional(),
  triggerEvent: z.string().optional(),
  triggerCombat: z.string().optional(),
  healParty: z.number().optional(),
  xpGain: z.number().optional(),
});
export type Outcome = z.infer<typeof OutcomeSchema>;

// ─── Choices (opciones que el jugador puede elegir) ──────────────

export const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  tooltip: z.string().optional(),
  icon: z.string().optional(),
  conditions: z.array(ConditionSchema).default([]),
  costs: z.record(z.string(), z.number()).default({}),
  successChance: z.number().min(0).max(1).default(1),
  checkStat: z.string().optional(),
  checkThreshold: z.number().optional(),
  successOutcome: OutcomeSchema,
  failureOutcome: OutcomeSchema.optional(),
  tags: z.array(z.string()).default([]),
});
export type Choice = z.infer<typeof ChoiceSchema>;

// ─── Game Event (el nodo narrativo/decisión) ─────────────────────

export const GameEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  category: z.enum(["story", "random", "shop", "rest", "recruit", "special", "boss_intro"]),

  conditions: z.array(ConditionSchema).default([]),
  priority: z.number().default(0),
  unique: z.boolean().default(false),
  maxOccurrences: z.number().int().positive().optional(),

  choices: z.array(ChoiceSchema).min(1),

  tags: z.array(z.string()).default([]),
  act: z.number().int().optional(),
});
export type GameEvent = z.infer<typeof GameEventSchema>;

// ─── Event Pool (agrupación para generación procedural) ──────────

export const EventPoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  events: z.array(z.object({
    eventId: z.string(),
    weight: z.number().positive(),
    conditions: z.array(ConditionSchema).default([]),
  })),
});
export type EventPool = z.infer<typeof EventPoolSchema>;
