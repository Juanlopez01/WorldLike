import { z } from "zod";
import { ResourceSchema, StatDefinitionSchema } from "./common";
import { EntityCategorySchema, EntityTemplateSchema } from "./entity";
import { EncounterTemplateSchema, CombatConfigSchema, TypeChartSchema } from "./combat";
import { GameEventSchema, EventPoolSchema } from "./event";
import { MapGenConfigSchema } from "./map";
import { ItemSchema } from "./run";
import { UnlockSchema, AchievementSchema } from "./meta";

// ─── Copa (tournament progression) ──────────────────────────────

export const CopaSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  region: z.string(),
  difficultyRange: z.tuple([z.number(), z.number()]),
  mapsPerCopa: z.number().int().default(7),
  rarityRates: z.object({
    common: z.number(),
    uncommon: z.number(),
    rare: z.number(),
    epic: z.number(),
    legendary: z.number(),
  }),
  encounterPools: z.object({
    normal: z.array(z.string()),
    elite: z.array(z.string()),
    boss: z.array(z.string()),
  }),
  eventPoolIds: z.array(z.string()),
});
export type Copa = z.infer<typeof CopaSchema>;

// ─── Gacha / Recruitment Config ──────────────────────────────────

export const GachaPoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  cost: z.record(z.string(), z.number()),
  rates: z.object({
    common: z.number(),
    uncommon: z.number(),
    rare: z.number(),
    epic: z.number(),
    legendary: z.number(),
  }),
  pityThreshold: z.number().int().optional(),
  pityGuaranteedRarity: z.enum(["rare", "epic", "legendary"]).optional(),
  entityPool: z.array(z.string()),
  featured: z.array(z.string()).default([]),
  featuredBoost: z.number().default(1),
});
export type GachaPool = z.infer<typeof GachaPoolSchema>;

// ─── Shop Config ─────────────────────────────────────────────────

export const ShopConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  refreshCost: z.record(z.string(), z.number()).optional(),
  slots: z.number().int().min(1).max(12).default(4),
  itemPool: z.array(z.object({
    itemId: z.string(),
    weight: z.number().positive(),
    priceMultiplier: z.number().default(1),
  })),
  entityPool: z.array(z.object({
    templateId: z.string(),
    weight: z.number().positive(),
    price: z.record(z.string(), z.number()),
  })).default([]),
});
export type ShopConfig = z.infer<typeof ShopConfigSchema>;

// ─── UI Theme (colores, labels, flavor text) ─────────────────────

export const UIThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  surfaceColor: z.string(),
  fontFamily: z.string().optional(),
  borderStyle: z.enum(["rounded", "sharp", "fantasy", "pixel"]).default("rounded"),
  cardStyle: z.enum(["minimal", "ornate", "sporty", "rustic"]).default("minimal"),

  labels: z.object({
    entitySingular: z.string(),
    entityPlural: z.string(),
    partySingular: z.string(),
    partyPlural: z.string(),
    recruitVerb: z.string(),
    battleVerb: z.string(),
    currency: z.string(),
    metaCurrency: z.string(),
  }),

  backgrounds: z.object({
    map: z.string().optional(),
    combat: z.string().optional(),
    menu: z.string().optional(),
    shop: z.string().optional(),
  }).default({}),
});
export type UITheme = z.infer<typeof UIThemeSchema>;

// ─── Starter Config ──────────────────────────────────────────────

export const StarterConfigSchema = z.object({
  chooseBetween: z.number().int().min(1).max(5).default(3),
  starterPool: z.array(z.string()),
  initialResources: z.record(z.string(), z.number()),
  initialItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
  })).default([]),
});
export type StarterConfig = z.infer<typeof StarterConfigSchema>;

// ─── ThemePack: EL contrato principal ────────────────────────────
// Un ThemePack = 1 juego completo. El engine no sabe nada
// que no esté definido acá.

export const ThemePackSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  icon: z.string(),
  coverUrl: z.string().optional(),

  // Definiciones del dominio
  statDefinitions: z.array(StatDefinitionSchema),
  resourceDefinitions: z.array(ResourceSchema),
  entityCategories: z.array(EntityCategorySchema),

  // Contenido
  entities: z.array(EntityTemplateSchema),
  encounters: z.array(EncounterTemplateSchema),
  events: z.array(GameEventSchema),
  eventPools: z.array(EventPoolSchema),
  items: z.array(ItemSchema),

  // Progresión por copas
  copas: z.array(CopaSchema).default([]),

  // Sistemas
  combatConfig: CombatConfigSchema,
  mapGenConfig: MapGenConfigSchema,
  typeChart: TypeChartSchema.optional(),
  gachaPools: z.array(GachaPoolSchema).default([]),
  shops: z.array(ShopConfigSchema).default([]),

  // Inicio de run
  starter: StarterConfigSchema,

  // Meta-progresión
  unlocks: z.array(UnlockSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),

  // UI
  uiTheme: UIThemeSchema,

  // Balanceo
  balancing: z.object({
    xpCurve: z.enum(["linear", "exponential", "logarithmic"]).default("exponential"),
    xpBasePerLevel: z.number().default(100),
    xpGrowthRate: z.number().default(1.2),
    difficultyScaling: z.number().default(1.15),
    healOnLevelUp: z.boolean().default(true),
    maxInventorySlots: z.number().int().default(20),
  }).default({}),
});
export type ThemePack = z.infer<typeof ThemePackSchema>;
