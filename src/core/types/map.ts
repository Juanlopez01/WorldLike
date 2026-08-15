import { z } from "zod";
import { ConditionSchema, WeightedIdSchema } from "./common";

// ─── Tipos de nodo ───────────────────────────────────────────────

export const NodeTypeSchema = z.enum([
  "battle",
  "elite",
  "boss",
  "event",
  "shop",
  "rest",
  "mystery",
  "treasure",
  "recruitment",
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

// ─── Nodo del mapa ───────────────────────────────────────────────

export const MapNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  row: z.number().int(),
  col: z.number().int(),
  connections: z.array(z.string()),
  visited: z.boolean().default(false),
  revealed: z.boolean().default(true),

  label: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),

  encounterId: z.string().optional(),
  eventId: z.string().optional(),
  shopPoolId: z.string().optional(),

  difficulty: z.number().min(1).max(10).optional(),
  conditions: z.array(ConditionSchema).default([]),
  tags: z.array(z.string()).default([]),
});
export type MapNode = z.infer<typeof MapNodeSchema>;

// ─── Mapa completo (un "acto" o "zona") ──────────────────────────

export const GameMapSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  act: z.number().int().positive(),
  copa: z.number().int().positive().optional(),
  mapInCopa: z.number().int().positive().optional(),
  backgroundUrl: z.string().optional(),
  nodes: z.array(MapNodeSchema),
  startNodeId: z.string(),
  bossNodeId: z.string(),
});
export type GameMap = z.infer<typeof GameMapSchema>;

// ─── Config de generación procedural ─────────────────────────────

export const MapGenConfigSchema = z.object({
  rowsPerAct: z.number().int().min(3).max(20).default(8),
  nodesPerRow: z.object({
    min: z.number().int().min(1).default(2),
    max: z.number().int().min(2).default(4),
  }),
  totalActs: z.number().int().min(1).max(10).default(3),

  nodeDistribution: z.array(z.object({
    type: NodeTypeSchema,
    weight: z.number().positive(),
    minPerAct: z.number().int().default(0),
    maxPerAct: z.number().int().optional(),
  })),

  connectionRules: z.object({
    maxForward: z.number().int().default(3),
    allowCross: z.boolean().default(true),
  }).default({}),

  eliteMinRow: z.number().int().default(3),
  restMinRow: z.number().int().default(4),
  shopMinRow: z.number().int().default(2),

  encounterPools: z.record(z.string(), z.array(WeightedIdSchema)),
});
export type MapGenConfig = z.infer<typeof MapGenConfigSchema>;
