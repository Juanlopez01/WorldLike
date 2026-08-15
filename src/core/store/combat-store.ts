import { create } from "zustand/react";
import type {
  CombatState,
  CombatAction,
  TurnResult,
  EncounterTemplate,
  EntityInstance,
  ThemePack,
} from "../types";
import {
  createCombatState,
  executePlayerAction,
  executeEnemyTurn,
  calculateRewards,
  getActivePlayer,
  getActiveEnemy,
  buildModifiers,
} from "../engine/combat-engine";
import { SeededRNG } from "../engine/rng";
import { useGameStore } from "./game-store";

export interface CombatStore {
  combat: CombatState | null;
  encounter: EncounterTemplate | null;
  theme: ThemePack | null;
  rng: SeededRNG | null;
  lastResult: TurnResult | null;
  rewards: { xp: number; resources: Record<string, number> } | null;

  startCombat: (
    party: EntityInstance[],
    encounter: EncounterTemplate,
    theme: ThemePack,
    seed: number
  ) => void;
  playerAction: (action: CombatAction) => void;
  endCombat: () => void;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  combat: null,
  encounter: null,
  theme: null,
  rng: null,
  lastResult: null,
  rewards: null,

  startCombat: (party, encounter, theme, seed) => {
    const rng = new SeededRNG(seed + Date.now());
    const combat = createCombatState(party, encounter, theme, rng);
    set({ combat, encounter, theme, rng, lastResult: null, rewards: null });
  },

  playerAction: (action) => {
    const { combat, theme, rng } = get();
    if (!combat || !theme || combat.status !== "player_turn") return;

    const config = theme.combatConfig;
    const typeChart = config.typeChart ?? theme.typeChart;

    const resources = useGameStore.getState().resources;
    const mods = buildModifiers(resources);
    const playerResult = executePlayerAction(combat, action, config, typeChart, rng ?? undefined, mods);
    let newState = playerResult.state;

    set({ combat: newState, lastResult: playerResult.result });

    if (newState.status === "enemy_turn") {
      setTimeout(() => {
        const current = get();
        if (!current.combat || current.combat.status !== "enemy_turn") return;

        const enemyResult = executeEnemyTurn(
          current.combat,
          config,
          typeChart,
          current.rng ?? undefined
        );

        const finalState = enemyResult.state;

        if (finalState.status === "victory" || finalState.status === "defeat") {
          const enc = get().encounter;
          const rewards =
            finalState.status === "victory" && enc
              ? calculateRewards(finalState, enc)
              : null;
          set({ combat: finalState, lastResult: enemyResult.result, rewards });
        } else {
          set({ combat: finalState, lastResult: enemyResult.result });
        }
      }, 800);
    } else if (newState.status === "victory" || newState.status === "defeat") {
      const enc = get().encounter;
      const rewards =
        newState.status === "victory" && enc
          ? calculateRewards(newState, enc)
          : null;
      set({ rewards });
    }
  },

  endCombat: () => {
    set({ combat: null, encounter: null, theme: null, rng: null, lastResult: null, rewards: null });
  },
}));
