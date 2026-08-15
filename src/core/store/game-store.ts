import { create } from "zustand/react";
import type { GameMap, MapNode, EntityInstance, EntityTemplate, ThemePack, EncounterTemplate, GameEvent, Outcome, Choice, Copa, Item, InventorySlot } from "../types";
import { generateMap, revealConnectedNodes } from "../engine/map-generator";
import { instantiateEntity, addXp } from "../engine/entity-manager";
import { SeededRNG } from "../engine/rng";
import { useCombatStore } from "./combat-store";
import { useMetaStore, COPA_REWARDS } from "./meta-store";

export interface GameState {
  status: "idle" | "copa_hub" | "selecting_starter" | "map" | "node_event" | "combat" | "event" | "recruitment" | "shop" | "game_over" | "copa_complete" | "meta_shop";
  seed: number;
  currentCopa: number;
  currentMap: number;
  map: GameMap | null;
  currentNodeId: string | null;
  visitedNodes: string[];
  party: EntityInstance[];
  resources: Record<string, number>;
  theme: ThemePack | null;
  currentEvent: GameEvent | null;
  recruitmentOffers: EntityTemplate[];
  inventory: InventorySlot[];
  shopOffers: { itemId: string; price: number }[];
  selectedCopaId: string | null;
  copaReward: number;

  setTheme: (theme: ThemePack) => void;
  goToHub: () => void;
  goToMetaShop: () => void;
  startCopa: (copaId: string) => void;
  selectStarter: (templateId: string) => void;
  moveToNode: (nodeId: string) => void;
  completeNode: () => void;
  resolveNode: () => void;
  startCombat: () => void;
  onCombatEnd: (result: "victory" | "defeat" | "fled", rewards: { xp: number; resources: Record<string, number> } | null) => void;
  triggerEvent: () => void;
  onEventChoice: (outcome: Outcome, choice: Choice) => void;
  triggerRecruitment: () => void;
  recruitEntity: (template: EntityTemplate) => void;
  skipRecruitment: () => void;
  swapPartyMembers: (fromIdx: number, toIdx: number) => void;
  addToParty: (entity: EntityInstance) => void;
  updateResources: (changes: Record<string, number>) => void;
  useItem: (itemId: string) => void;
  buyItem: (itemId: string, price: number) => void;
  generateShopOffers: () => void;
  leaveShop: () => void;
  getCurrentCopa: () => Copa | null;
  saveRun: () => void;
  loadRun: () => boolean;
  reset: () => void;
}

function getMapsPerCopa(theme: ThemePack, copaIndex: number): number {
  if (theme.copas.length > 0 && theme.copas[copaIndex]) {
    return theme.copas[copaIndex].mapsPerCopa;
  }
  return 1;
}

function getMapRows(mapInCopa: number, mapsPerCopa: number): { rows: number; nodesMin: number; nodesMax: number } {
  if (mapsPerCopa <= 1) return { rows: 8, nodesMin: 2, nodesMax: 4 };
  if (mapInCopa <= 3) return { rows: 5 + Math.min(mapInCopa - 1, 1), nodesMin: 2, nodesMax: 3 };
  if (mapInCopa <= 6) return { rows: 6 + Math.min(mapInCopa - 4, 1), nodesMin: 2, nodesMax: 4 };
  return { rows: 5, nodesMin: 2, nodesMax: 3 };
}

export const useGameStore = create<GameState>((set, get) => ({
  status: "idle",
  seed: 0,
  currentCopa: 1,
  currentMap: 1,
  map: null,
  currentNodeId: null,
  visitedNodes: [],
  party: [],
  resources: {},
  theme: null,
  currentEvent: null,
  recruitmentOffers: [],
  inventory: [],
  shopOffers: [],
  selectedCopaId: null,
  copaReward: 0,

  setTheme: (theme) => {
    set({ theme, status: "copa_hub" });
  },

  goToHub: () => {
    set({
      status: "copa_hub",
      map: null,
      currentNodeId: null,
      visitedNodes: [],
      party: [],
      resources: {},
      currentEvent: null,
      recruitmentOffers: [],
      inventory: [],
      shopOffers: [],
      selectedCopaId: null,
      copaReward: 0,
    });
    try { localStorage.removeItem("futbolike_save"); } catch {}
  },

  goToMetaShop: () => {
    set({ status: "meta_shop" });
  },

  startCopa: (copaId) => {
    const { theme } = get();
    if (!theme) return;

    const copaIndex = theme.copas.findIndex((c) => c.id === copaId);
    if (copaIndex < 0) return;

    const seed = Math.floor(Math.random() * 999999);
    const copa = theme.copas[copaIndex];
    const mapsPerCopa = copa.mapsPerCopa;
    const { rows, nodesMin, nodesMax } = getMapRows(1, mapsPerCopa);

    const configOverride = {
      ...theme.mapGenConfig,
      rowsPerAct: rows,
      nodesPerRow: { min: nodesMin, max: nodesMax },
    };
    const map = generateMap(configOverride, copaIndex + 1, seed);
    map.copa = copaIndex + 1;
    map.mapInCopa = 1;
    map.name = `${copa.emoji} ${copa.name} — Fecha 1`;

    useMetaStore.getState().incrementRuns();

    set({
      status: "selecting_starter",
      seed,
      currentCopa: copaIndex + 1,
      currentMap: 1,
      map,
      currentNodeId: null,
      visitedNodes: [],
      party: [],
      resources: { ...theme.starter.initialResources },
      selectedCopaId: copaId,
      inventory: theme.starter.initialItems?.map((i) => ({ itemId: i.itemId, quantity: i.quantity })) ?? [],
      shopOffers: [],
      copaReward: 0,
    });
  },

  selectStarter: (templateId) => {
    const { theme, seed, map } = get();
    if (!theme || !map) return;

    const template = theme.entities.find((e) => e.id === templateId);
    if (!template) return;

    const rng = new SeededRNG(seed);
    const instance = instantiateEntity(template, rng);

    const startNodeId = map.startNodeId;
    const revealedMap = revealConnectedNodes(map, startNodeId);

    set({
      status: "map",
      party: [instance],
      currentNodeId: startNodeId,
      map: revealedMap,
    });
  },

  moveToNode: (nodeId) => {
    const { map, currentNodeId, visitedNodes, resources } = get();
    if (!map || !currentNodeId) return;

    const currentNode = map.nodes.find((n) => n.id === currentNodeId);
    if (!currentNode || !currentNode.connections.includes(nodeId)) return;

    const updatedMap = revealConnectedNodes(
      {
        ...map,
        nodes: map.nodes.map((n) =>
          n.id === currentNodeId ? { ...n, visited: true } : n
        ),
      },
      nodeId
    );

    set({
      map: updatedMap,
      currentNodeId: nodeId,
      visitedNodes: [...visitedNodes, currentNodeId],
      status: "node_event",
      resources: {
        ...resources,
        energia: Math.max(0, (resources.energia ?? 100) - 8),
      },
    });
  },

  completeNode: () => {
    set({ status: "map" });
  },

  resolveNode: () => {
    const { map, currentNodeId } = get();
    if (!map || !currentNodeId) return;

    const node = map.nodes.find((n) => n.id === currentNodeId);
    if (!node) return;

    if (node.type === "battle" || node.type === "elite" || node.type === "boss") {
      get().startCombat();
      return;
    }

    if (node.type === "event" || node.type === "mystery") {
      get().triggerEvent();
      return;
    }

    if (node.type === "recruitment") {
      get().triggerRecruitment();
      return;
    }

    if (node.type === "rest") {
      set((state) => ({
        party: state.party.map((e) => ({
          ...e,
          currentHp: Math.min(e.maxHp, e.currentHp + Math.floor(e.maxHp * 0.3)),
        })),
        status: "map",
        resources: {
          ...state.resources,
          energia: Math.min(100, (state.resources.energia ?? 100) + 40),
        },
      }));
      get().saveRun();
      return;
    }

    if (node.type === "treasure" || node.type === "shop") {
      const rng = new SeededRNG(get().seed + Date.now());
      if (node.type === "treasure") {
        const monedas = 30 + rng.nextInt(0, 50);
        const healAmount = rng.nextInt(10, 30);
        set((state) => ({
          party: state.party.map((e) => ({
            ...e,
            currentHp: Math.min(e.maxHp, e.currentHp + healAmount),
          })),
          status: "map",
        }));
        get().updateResources({ monedas, moral: 5 });
        get().saveRun();
        return;
      }
      get().generateShopOffers();
      set({ status: "shop" });
      return;
    }

    set({ status: "map" });
  },

  startCombat: () => {
    const { theme, map, currentNodeId, party, seed, currentCopa } = get();
    if (!theme || !map || !currentNodeId) return;

    const node = map.nodes.find((n) => n.id === currentNodeId);
    if (!node) return;

    const copa = theme.copas[currentCopa - 1];
    const encounters = theme.encounters ?? [];
    let encounter: EncounterTemplate | undefined;

    if (copa) {
      const pool = copa.encounterPools;
      if (node.type === "boss") {
        const bossEncs = encounters.filter((e) => pool.boss.includes(e.id));
        encounter = bossEncs[Math.floor(Math.random() * bossEncs.length)];
      } else if (node.type === "elite") {
        const eliteEncs = encounters.filter((e) => pool.elite.includes(e.id));
        encounter = eliteEncs[Math.floor(Math.random() * eliteEncs.length)];
      } else {
        const normalEncs = encounters.filter((e) => pool.normal.includes(e.id));
        encounter = normalEncs[Math.floor(Math.random() * normalEncs.length)];
      }
    }

    if (!encounter) {
      if (node.type === "boss") {
        encounter = encounters.find((e) => e.isBoss);
      } else if (node.type === "elite") {
        const eliteEncs = encounters.filter((e) => !e.isBoss && e.difficulty >= 4);
        encounter = eliteEncs[Math.floor(Math.random() * eliteEncs.length)] ?? encounters[0];
      } else {
        const normalEncs = encounters.filter((e) => !e.isBoss && e.difficulty < 4);
        encounter = normalEncs[Math.floor(Math.random() * normalEncs.length)] ?? encounters[0];
      }
    }

    if (!encounter) {
      set({ status: "map" });
      return;
    }

    useCombatStore.getState().startCombat(party, encounter, theme, seed);
    set({
      status: "combat",
      resources: {
        ...get().resources,
        energia: Math.max(0, (get().resources.energia ?? 100) - (node.type === "elite" || node.type === "boss" ? 10 : 5)),
      },
    });
  },

  onCombatEnd: (result, rewards) => {
    if (result === "victory") {
      const { map, currentNodeId, currentCopa, currentMap, theme, seed, party, resources, selectedCopaId } = get();

      let updatedParty = party;
      if (rewards) {
        updatedParty = party.map((e) =>
          e.currentHp > 0 ? addXp(e, rewards.xp).entity : e
        );
      }

      const resourceChanges = rewards?.resources ?? {};

      if (map && currentNodeId) {
        const node = map.nodes.find((n) => n.id === currentNodeId);
        if (node?.type === "boss" && theme) {
          const mapsPerCopa = getMapsPerCopa(theme, currentCopa - 1);
          const isLastMapInCopa = currentMap >= mapsPerCopa;

          if (isLastMapInCopa) {
            const copaId = selectedCopaId || theme.copas[currentCopa - 1]?.id || "";
            const reward = COPA_REWARDS[copaId] ?? 50;
            useMetaStore.getState().completeCopa(copaId);

            set({
              status: "copa_complete",
              party: updatedParty,
              copaReward: reward,
            });
            get().updateResources({ ...resourceChanges, moral: 20 });
            try { localStorage.removeItem("futbolike_save"); } catch {}
            return;
          }

          const nextMap = currentMap + 1;
          const { rows, nodesMin, nodesMax } = getMapRows(nextMap, mapsPerCopa);

          const configOverride = {
            ...theme.mapGenConfig,
            rowsPerAct: rows,
            nodesPerRow: { min: nodesMin, max: nodesMax },
          };
          const linearAct = currentCopa;
          const newMapObj = generateMap(configOverride, linearAct, seed + nextMap);
          newMapObj.copa = currentCopa;
          newMapObj.mapInCopa = nextMap;

          const copaData = theme.copas[currentCopa - 1];
          const mapLabels = ["Fecha 1", "Fecha 2", "Fecha 3", "Octavos", "Cuartos", "Semifinal", "La Final"];
          const label = mapLabels[nextMap - 1] ?? `Mapa ${nextMap}`;
          newMapObj.name = copaData
            ? `${copaData.emoji} ${copaData.name} — ${label}`
            : `Mapa ${nextMap}`;

          const revealedMap = revealConnectedNodes(newMapObj, newMapObj.startNodeId);
          set({
            currentMap: nextMap,
            map: revealedMap,
            currentNodeId: newMapObj.startNodeId,
            visitedNodes: [],
            status: "map",
            party: updatedParty,
          });
          get().updateResources({ ...resourceChanges, energia: 30 - Math.max(0, (resources.energia ?? 0)), moral: 10 });
          return;
        }
      }

      set({ status: "map", party: updatedParty });
      get().updateResources(resourceChanges);
      get().saveRun();
    } else if (result === "defeat") {
      set({ status: "game_over" });
    } else {
      set({
        status: "map",
        resources: {
          ...get().resources,
          moral: Math.max(0, (get().resources.moral ?? 100) - 10),
        },
      });
    }
  },

  triggerRecruitment: () => {
    const { theme, party, seed, currentCopa } = get();
    if (!theme) return;

    const maxParty = theme.combatConfig?.maxPartySize ?? 2;
    if (party.length >= maxParty) {
      set({ status: "map" });
      return;
    }

    const partyIds = new Set(party.map((e) => e.templateId));
    const available = theme.entities.filter(
      (e) => !partyIds.has(e.id) && !e.id.startsWith("e_")
    );

    if (available.length === 0) {
      set({ status: "map" });
      return;
    }

    const copa = theme.copas[currentCopa - 1];
    let offers: EntityTemplate[];

    if (copa) {
      const rng = new SeededRNG(seed + Date.now());
      const rates = copa.rarityRates;
      const picked: EntityTemplate[] = [];

      for (let i = 0; i < 3 && available.length > 0; i++) {
        const roll = rng.next();
        let rarity: string;
        if (roll < rates.legendary) rarity = "legendary";
        else if (roll < rates.legendary + rates.epic) rarity = "epic";
        else if (roll < rates.legendary + rates.epic + rates.rare) rarity = "rare";
        else if (roll < rates.legendary + rates.epic + rates.rare + rates.uncommon) rarity = "uncommon";
        else rarity = "common";

        const pool = available.filter((e) => e.rarity === rarity && !picked.some((p) => p.id === e.id));
        if (pool.length > 0) {
          picked.push(rng.pick(pool));
        } else {
          const fallback = available.filter((e) => !picked.some((p) => p.id === e.id));
          if (fallback.length > 0) picked.push(rng.pick(fallback));
        }
      }
      offers = picked;
    } else {
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      offers = shuffled.slice(0, Math.min(3, shuffled.length));
    }

    set({ recruitmentOffers: offers, status: "recruitment" });
  },

  recruitEntity: (template) => {
    const { seed } = get();
    const rng = new SeededRNG(seed + Date.now());
    const instance = instantiateEntity(template, rng);

    set((state) => ({
      party: [...state.party, instance],
      recruitmentOffers: [],
      status: "map",
      resources: {
        ...state.resources,
        moral: Math.min(100, (state.resources.moral ?? 100) + 5),
      },
    }));
    get().updateResources({ monedas: -100 });
  },

  skipRecruitment: () => {
    set({ recruitmentOffers: [], status: "map" });
  },

  triggerEvent: () => {
    const { theme, resources, currentCopa } = get();
    if (!theme) return;

    const copa = theme.copas[currentCopa - 1];
    let eligiblePools: string[];

    if (copa) {
      eligiblePools = copa.eventPoolIds;
    } else {
      eligiblePools = theme.eventPools.length > 0 ? [theme.eventPools[0].id] : [];
    }

    const allPoolEvents = theme.eventPools
      .filter((p) => eligiblePools.includes(p.id))
      .flatMap((p) => p.events);

    if (allPoolEvents.length === 0) {
      set({ status: "map" });
      return;
    }

    const eligible = allPoolEvents.filter((pe) => {
      return pe.conditions.every((c) => {
        if (c.type === "stat_gte") return (resources[c.target] ?? 0) >= Number(c.value);
        if (c.type === "stat_lte") return (resources[c.target] ?? 0) <= Number(c.value);
        return true;
      });
    });

    if (eligible.length === 0) {
      set({ status: "map" });
      return;
    }

    const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let picked = eligible[0];
    for (const entry of eligible) {
      roll -= entry.weight;
      if (roll <= 0) { picked = entry; break; }
    }

    const event = theme.events.find((e) => e.id === picked.eventId);
    if (!event) {
      set({ status: "map" });
      return;
    }

    set({ currentEvent: event, status: "event" });
  },

  onEventChoice: (outcome, _choice) => {
    const { party, resources } = get();

    let updatedParty = [...party];

    if (outcome.xpGain) {
      updatedParty = updatedParty.map((e) =>
        e.currentHp > 0 ? addXp(e, outcome.xpGain!).entity : e
      );
    }

    if (outcome.healParty) {
      const heal = outcome.healParty;
      updatedParty = updatedParty.map((e) => ({
        ...e,
        currentHp: Math.min(e.maxHp, e.currentHp + heal),
      }));
    }

    if (outcome.statChanges) {
      const { targetEntity, changes } = outcome.statChanges;
      updatedParty = updatedParty.map((e, i) => {
        const shouldApply =
          targetEntity === "all_party" ||
          (targetEntity === "active" && i === 0) ||
          (targetEntity === "random_party" && i === Math.floor(Math.random() * updatedParty.length));
        if (!shouldApply) return e;
        const newStats = { ...e.stats };
        for (const [stat, delta] of Object.entries(changes)) {
          newStats[stat] = Math.max(1, Math.min(99, (newStats[stat] ?? 0) + delta));
        }
        return { ...e, stats: newStats };
      });
    }

    const resourceChanges = { ...outcome.resourceChanges };

    set({ party: updatedParty, currentEvent: null, status: "map" });
    get().updateResources(resourceChanges);
    get().saveRun();
  },

  useItem: (itemId) => {
    const { theme, party, inventory } = get();
    if (!theme) return;

    const slot = inventory.find((s) => s.itemId === itemId);
    if (!slot || slot.quantity <= 0) return;

    const item = theme.items.find((i) => i.id === itemId);
    if (!item || item.type !== "consumable") return;

    let updatedParty = [...party];
    const updatedInventory = inventory.map((s) =>
      s.itemId === itemId ? { ...s, quantity: s.quantity - 1 } : s
    ).filter((s) => s.quantity > 0);

    if (item.effect.type === "heal") {
      updatedParty = updatedParty.map((e) => ({
        ...e,
        currentHp: Math.min(e.maxHp, e.currentHp + item.effect.value),
      }));
    } else if (item.effect.type === "revive") {
      const dead = updatedParty.find((e) => e.currentHp <= 0);
      if (dead) {
        updatedParty = updatedParty.map((e) =>
          e.instanceId === dead.instanceId
            ? { ...e, currentHp: Math.floor(e.maxHp * (item.effect.value / 100)) }
            : e
        );
      }
    } else if (item.effect.type === "resource" && item.effect.target) {
      get().updateResources({ [item.effect.target]: item.effect.value });
    }

    set({ party: updatedParty, inventory: updatedInventory });
  },

  buyItem: (itemId, price) => {
    const { resources, inventory, theme } = get();
    if (!theme) return;
    if ((resources.monedas ?? 0) < price) return;

    const item = theme.items.find((i) => i.id === itemId);
    if (!item) return;

    const existing = inventory.find((s) => s.itemId === itemId);
    let updatedInventory: InventorySlot[];
    if (existing) {
      if (existing.quantity >= item.maxStack) return;
      updatedInventory = inventory.map((s) =>
        s.itemId === itemId ? { ...s, quantity: s.quantity + 1 } : s
      );
    } else {
      updatedInventory = [...inventory, { itemId, quantity: 1 }];
    }

    set({ inventory: updatedInventory });
    get().updateResources({ monedas: -price });
  },

  generateShopOffers: () => {
    const { theme, seed } = get();
    if (!theme || theme.shops.length === 0) return;

    const shop = theme.shops[0];
    const rng = new SeededRNG(seed + Date.now());
    const offers: { itemId: string; price: number }[] = [];
    const totalWeight = shop.itemPool.reduce((sum, p) => sum + p.weight, 0);

    for (let i = 0; i < shop.slots; i++) {
      let roll = rng.next() * totalWeight;
      let picked = shop.itemPool[0];
      for (const entry of shop.itemPool) {
        roll -= entry.weight;
        if (roll <= 0) { picked = entry; break; }
      }
      const item = theme.items.find((it) => it.id === picked.itemId);
      if (item) {
        offers.push({
          itemId: picked.itemId,
          price: Math.round(item.price * picked.priceMultiplier),
        });
      }
    }

    set({ shopOffers: offers });
  },

  leaveShop: () => {
    set({ status: "map", shopOffers: [] });
    get().saveRun();
  },

  swapPartyMembers: (fromIdx, toIdx) => {
    set((state) => {
      const newParty = [...state.party];
      const temp = newParty[fromIdx];
      newParty[fromIdx] = newParty[toIdx];
      newParty[toIdx] = temp;
      return { party: newParty };
    });
  },

  addToParty: (entity) => {
    set((state) => ({ party: [...state.party, entity] }));
  },

  updateResources: (changes) => {
    set((state) => {
      const resources = { ...state.resources };
      for (const [key, delta] of Object.entries(changes)) {
        resources[key] = Math.max(0, (resources[key] || 0) + delta);
        if (key === "moral" || key === "energia") {
          resources[key] = Math.min(100, resources[key]);
        }
      }
      return { resources };
    });
  },

  getCurrentCopa: () => {
    const { theme, currentCopa } = get();
    if (!theme || theme.copas.length === 0) return null;
    return theme.copas[currentCopa - 1] ?? null;
  },

  saveRun: () => {
    const state = get();
    const saveData = {
      seed: state.seed,
      currentCopa: state.currentCopa,
      currentMap: state.currentMap,
      map: state.map,
      currentNodeId: state.currentNodeId,
      visitedNodes: state.visitedNodes,
      party: state.party,
      resources: state.resources,
      status: state.status,
      inventory: state.inventory,
      selectedCopaId: state.selectedCopaId,
    };
    try {
      localStorage.setItem("futbolike_save", JSON.stringify(saveData));
    } catch {}
  },

  loadRun: () => {
    try {
      const raw = localStorage.getItem("futbolike_save");
      if (!raw) return false;
      const data = JSON.parse(raw);
      const { theme } = get();
      if (!theme) return false;
      set({
        seed: data.seed,
        currentCopa: data.currentCopa,
        currentMap: data.currentMap,
        map: data.map,
        currentNodeId: data.currentNodeId,
        visitedNodes: data.visitedNodes,
        party: data.party,
        resources: data.resources,
        status: data.status === "combat" || data.status === "event" || data.status === "recruitment" || data.status === "node_event" || data.status === "shop"
          ? "map"
          : data.status,
        currentEvent: null,
        recruitmentOffers: [],
        inventory: data.inventory ?? [],
        shopOffers: [],
        selectedCopaId: data.selectedCopaId ?? null,
      });
      return true;
    } catch {
      return false;
    }
  },

  reset: () => {
    try { localStorage.removeItem("futbolike_save"); } catch {}
    set({
      status: "idle",
      seed: 0,
      currentCopa: 1,
      currentMap: 1,
      map: null,
      currentNodeId: null,
      visitedNodes: [],
      party: [],
      resources: {},
      theme: null,
      currentEvent: null,
      recruitmentOffers: [],
      inventory: [],
      shopOffers: [],
      selectedCopaId: null,
      copaReward: 0,
    });
  },
}));
