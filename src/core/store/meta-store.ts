import { create } from "zustand/react";

const STORAGE_KEY = "futbolike_meta";

export const ALBUM_PRICES: Record<string, number> = {
  common: 3500,
  uncommon: 5000,
  rare: 10000,
  epic: 20000,
  legendary: 35000,
};

export const COPA_REWARDS: Record<string, number> = {
  copa_barrial: 50,
  copa_provincial: 100,
  copa_primera: 250,
  copa_sudamericana: 500,
  copa_libertadores: 1000,
  copa_europa_league: 1500,
  copa_champions: 2500,
  copa_mundial_clubes: 5000,
  copa_del_mundo: 10000,
};

export interface MetaState {
  coins: number;
  completedCopas: string[];
  collection: string[];
  totalRuns: number;
  totalVictories: number;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  completeCopa: (copaId: string) => void;
  isCopaUnlocked: (copaId: string, allCopaIds: string[]) => boolean;
  purchaseForAlbum: (playerId: string, rarity: string) => boolean;
  hasInCollection: (playerId: string) => boolean;
  incrementRuns: () => void;
  saveMeta: () => void;
  loadMeta: () => void;
  resetMeta: () => void;
}

export const useMetaStore = create<MetaState>((set, get) => ({
  coins: 0,
  completedCopas: [],
  collection: [],
  totalRuns: 0,
  totalVictories: 0,

  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveMeta();
  },

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set({ coins: coins - amount });
    get().saveMeta();
    return true;
  },

  completeCopa: (copaId) => {
    const { completedCopas } = get();
    if (completedCopas.includes(copaId)) return;
    set({ completedCopas: [...completedCopas, copaId], totalVictories: get().totalVictories + 1 });
    const reward = COPA_REWARDS[copaId] ?? 50;
    get().addCoins(reward);
  },

  isCopaUnlocked: (copaId, allCopaIds) => {
    const idx = allCopaIds.indexOf(copaId);
    if (idx <= 0) return true;
    return get().completedCopas.includes(allCopaIds[idx - 1]);
  },

  purchaseForAlbum: (playerId, rarity) => {
    const cost = ALBUM_PRICES[rarity] ?? ALBUM_PRICES.common;
    if (get().hasInCollection(playerId)) return false;
    if (!get().spendCoins(cost)) return false;
    set((s) => ({ collection: [...s.collection, playerId] }));
    get().saveMeta();
    return true;
  },

  hasInCollection: (playerId) => get().collection.includes(playerId),

  incrementRuns: () => {
    set((s) => ({ totalRuns: s.totalRuns + 1 }));
    get().saveMeta();
  },

  saveMeta: () => {
    try {
      const { coins, completedCopas, collection, totalRuns, totalVictories } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, completedCopas, collection, totalRuns, totalVictories }));
    } catch {}
  },

  loadMeta: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        coins: data.coins ?? 0,
        completedCopas: data.completedCopas ?? [],
        collection: data.collection ?? data.purchasedPlayers ?? [],
        totalRuns: data.totalRuns ?? 0,
        totalVictories: data.totalVictories ?? 0,
      });
    } catch {}
  },

  resetMeta: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    set({ coins: 0, completedCopas: [], collection: [], totalRuns: 0, totalVictories: 0 });
  },
}));
