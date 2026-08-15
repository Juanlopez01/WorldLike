import { create } from "zustand/react";

const STORAGE_KEY = "futbolike_meta";

export interface SpecialPlayer {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

export const SPECIAL_PLAYERS: SpecialPlayer[] = [
  { id: "sp_maradona", name: "Diego Maradona", cost: 10000, emoji: "🇦🇷" },
  { id: "sp_pele", name: "Pelé", cost: 7500, emoji: "🇧🇷" },
  { id: "sp_zidane", name: "Zinedine Zidane", cost: 5000, emoji: "🇫🇷" },
  { id: "sp_ronaldo_n", name: "Ronaldo Nazário", cost: 5000, emoji: "🇧🇷" },
  { id: "sp_cruyff", name: "Johan Cruyff", cost: 3500, emoji: "🇳🇱" },
  { id: "sp_ronaldinho", name: "Ronaldinho", cost: 3000, emoji: "🇧🇷" },
  { id: "sp_di_stefano", name: "Alfredo Di Stéfano", cost: 2500, emoji: "🇦🇷" },
  { id: "sp_van_basten", name: "Marco van Basten", cost: 1500, emoji: "🇳🇱" },
  { id: "sp_beckenbauer", name: "Franz Beckenbauer", cost: 1000, emoji: "🇩🇪" },
  { id: "sp_maldini", name: "Paolo Maldini", cost: 500, emoji: "🇮🇹" },
];

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
  purchasedPlayers: string[];
  totalRuns: number;
  totalVictories: number;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  completeCopa: (copaId: string) => void;
  isCopaUnlocked: (copaId: string, allCopaIds: string[]) => boolean;
  purchasePlayer: (playerId: string) => boolean;
  hasPurchasedPlayer: (playerId: string) => boolean;
  incrementRuns: () => void;
  saveMeta: () => void;
  loadMeta: () => void;
  resetMeta: () => void;
}

export const useMetaStore = create<MetaState>((set, get) => ({
  coins: 0,
  completedCopas: [],
  purchasedPlayers: [],
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

  purchasePlayer: (playerId) => {
    const player = SPECIAL_PLAYERS.find((p) => p.id === playerId);
    if (!player) return false;
    if (get().hasPurchasedPlayer(playerId)) return false;
    if (!get().spendCoins(player.cost)) return false;
    set((s) => ({ purchasedPlayers: [...s.purchasedPlayers, playerId] }));
    get().saveMeta();
    return true;
  },

  hasPurchasedPlayer: (playerId) => get().purchasedPlayers.includes(playerId),

  incrementRuns: () => {
    set((s) => ({ totalRuns: s.totalRuns + 1 }));
    get().saveMeta();
  },

  saveMeta: () => {
    try {
      const { coins, completedCopas, purchasedPlayers, totalRuns, totalVictories } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, completedCopas, purchasedPlayers, totalRuns, totalVictories }));
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
        purchasedPlayers: data.purchasedPlayers ?? [],
        totalRuns: data.totalRuns ?? 0,
        totalVictories: data.totalVictories ?? 0,
      });
    } catch {}
  },

  resetMeta: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    set({ coins: 0, completedCopas: [], purchasedPlayers: [], totalRuns: 0, totalVictories: 0 });
  },
}));
