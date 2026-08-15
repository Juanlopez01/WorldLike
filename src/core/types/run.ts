import { z } from "zod";
import { EntityInstanceSchema } from "./entity";

// ─── Party (equipo activo del jugador) ───────────────────────────

export const PartySchema = z.object({
  active: z.array(EntityInstanceSchema),
  bench: z.array(EntityInstanceSchema).default([]),
  maxSize: z.number().int().positive(),
});
export type Party = z.infer<typeof PartySchema>;

// ─── Inventory ───────────────────────────────────────────────────

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
  type: z.enum(["consumable", "equipment", "key", "passive"]),
  effect: z.object({
    type: z.enum(["heal", "buff", "revive", "recruit_boost", "xp_boost", "resource", "custom"]),
    target: z.string().optional(),
    value: z.number(),
    duration: z.number().optional(),
  }),
  maxStack: z.number().int().positive().default(99),
  price: z.number().default(0),
  tags: z.array(z.string()).default([]),
});
export type Item = z.infer<typeof ItemSchema>;

export const InventorySlotSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
});
export type InventorySlot = z.infer<typeof InventorySlotSchema>;

// ─── Run State (estado de una partida/run individual) ────────────

export const RunStateSchema = z.object({
  id: z.string(),
  themeId: z.string(),
  seed: z.number(),
  status: z.enum(["active", "victory", "defeat", "abandoned"]),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  currentCopa: z.number().int().positive(),
  currentMap: z.number().int().positive(),
  currentNodeId: z.string(),
  visitedNodes: z.array(z.string()),

  party: PartySchema,
  resources: z.record(z.string(), z.number()),
  inventory: z.array(InventorySlotSchema).default([]),

  flags: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  eventHistory: z.array(z.string()),
  combatHistory: z.array(z.object({
    encounterId: z.string(),
    result: z.enum(["victory", "defeat", "fled"]),
    turns: z.number().int(),
  })),

  totalTurns: z.number().int().default(0),
  entitiesRecruited: z.number().int().default(0),
  entitiesLost: z.number().int().default(0),

  difficulty: z.number().min(1).max(10).default(1),
});
export type RunState = z.infer<typeof RunStateSchema>;

// ─── Snapshot para save/load ─────────────────────────────────────

export const RunSnapshotSchema = RunStateSchema.extend({
  version: z.string(),
  mapState: z.any(),
});
export type RunSnapshot = z.infer<typeof RunSnapshotSchema>;
