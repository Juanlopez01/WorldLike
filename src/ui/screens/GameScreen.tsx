"use client";

import { useCallback, useState } from "react";
import { useGameStore } from "@/core/store/game-store";
import { NodeMap } from "../map/NodeMap";
import { GameHUD } from "../hud/GameHUD";
import { StarterSelection } from "../entity/StarterSelection";
import { NodeEventScreen } from "./NodeEventScreen";
import { EntityCard } from "../entity/EntityCard";
import { BattleScreen } from "../combat/BattleScreen";
import { EventScreen } from "./EventScreen";
import { RecruitmentScreen } from "./RecruitmentScreen";
import { ShopScreen } from "./ShopScreen";
import { CopaHubScreen } from "./CopaHubScreen";
import { CopaCompleteScreen } from "./CopaCompleteScreen";
import { MetaShopScreen } from "./MetaShopScreen";
import { PartyPanel } from "../hud/PartyPanel";
import { InventoryPanel } from "../hud/InventoryPanel";
import type { Outcome, Choice, EntityTemplate } from "@/core/types";

const COPA_FIELDS: Record<string, string> = {
  copa_barrial: "field-potrero",
  copa_provincial: "field-barrial",
  copa_primera: "field-barrial",
  copa_sudamericana: "field-profesional",
  copa_libertadores: "field-profesional",
  copa_europa_league: "field-continental",
  copa_champions: "field-continental",
  copa_mundial_clubes: "field-mundial",
  copa_del_mundo: "field-mundial",
};

export function GameScreen() {
  const status = useGameStore((s) => s.status);
  const map = useGameStore((s) => s.map);
  const currentNodeId = useGameStore((s) => s.currentNodeId);
  const visitedNodes = useGameStore((s) => s.visitedNodes);
  const party = useGameStore((s) => s.party);
  const resources = useGameStore((s) => s.resources);
  const theme = useGameStore((s) => s.theme);
  const currentCopa = useGameStore((s) => s.currentCopa);
  const currentMap = useGameStore((s) => s.currentMap);
  const seed = useGameStore((s) => s.seed);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const recruitmentOffers = useGameStore((s) => s.recruitmentOffers);
  const selectedCopaId = useGameStore((s) => s.selectedCopaId);

  const [selectedPartyIdx, setSelectedPartyIdx] = useState(0);
  const [showParty, setShowParty] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const handleNodeClick = useCallback((nodeId: string) => {
    useGameStore.getState().moveToNode(nodeId);
  }, []);

  const handleResolve = useCallback(() => {
    useGameStore.getState().resolveNode();
  }, []);

  const handleSelectStarter = useCallback((templateId: string) => {
    useGameStore.getState().selectStarter(templateId);
  }, []);

  const handleCombatEnd = useCallback(
    (result: "victory" | "defeat" | "fled", rewards: { xp: number; resources: Record<string, number> } | null) => {
      useGameStore.getState().onCombatEnd(result, rewards);
    },
    []
  );

  const handleEventChoice = useCallback(
    (outcome: Outcome, choice: Choice) => {
      useGameStore.getState().onEventChoice(outcome, choice);
    },
    []
  );

  const handleRecruit = useCallback(
    (template: EntityTemplate, swapIndex?: number) => {
      useGameStore.getState().recruitEntity(template, swapIndex);
    },
    []
  );

  const handleSkipRecruitment = useCallback(() => {
    useGameStore.getState().skipRecruitment();
  }, []);

  if (!theme) return null;

  if (status === "copa_hub") {
    return <CopaHubScreen />;
  }

  if (status === "copa_complete") {
    return <CopaCompleteScreen />;
  }

  if (status === "meta_shop") {
    return <MetaShopScreen />;
  }

  if (status === "selecting_starter") {
    return <StarterSelection theme={theme} onSelect={handleSelectStarter} />;
  }

  if (status === "combat") {
    return <BattleScreen onCombatEnd={handleCombatEnd} />;
  }

  if (status === "event" && currentEvent && party[0]) {
    return (
      <EventScreen
        event={currentEvent}
        playerStats={party[0].stats}
        playerResources={resources}
        onChoiceResult={handleEventChoice}
      />
    );
  }

  if (status === "recruitment" && recruitmentOffers.length > 0) {
    return (
      <RecruitmentScreen
        offers={recruitmentOffers}
        cost={{ monedas: 100 }}
        playerResources={resources}
        party={party}
        maxPartySize={theme?.combatConfig?.maxPartySize ?? 2}
        onRecruit={handleRecruit}
        onSkip={handleSkipRecruitment}
      />
    );
  }

  if (status === "shop" && theme) {
    return <ShopScreen />;
  }

  if (status === "game_over") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <span className="text-6xl mb-4">💀</span>
        <h1 className="text-2xl font-black text-danger mb-2">DERROTA</h1>
        <p className="text-sm text-text-secondary mb-6">
          Tu aventura ha terminado
        </p>
        <button
          onClick={() => useGameStore.getState().goToHub()}
          className="px-6 py-2 rounded-lg bg-surface border border-border text-text text-sm font-bold hover:bg-surface-light transition-colors"
        >
          VOLVER AL HUB
        </button>
      </div>
    );
  }

  const currentNode = map?.nodes.find((n) => n.id === currentNodeId) ?? null;

  return (
    <div className="h-screen flex flex-col p-4 pb-16 max-w-md mx-auto overflow-hidden">
      <GameHUD
        theme={theme}
        resources={resources}
        party={party}
        currentCopa={currentCopa}
        currentMap={currentMap}
        copa={theme.copas[currentCopa - 1] ?? null}
        seed={seed}
      />

      {map && (
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {map.name}
            </h3>
            {currentNode && (
              <span className="text-[10px] text-text-dim">
                Fila {currentNode.row + 1}/{Math.max(...map.nodes.map((n) => n.row)) + 1}
              </span>
            )}
          </div>
          <NodeMap
            map={map}
            currentNodeId={currentNodeId}
            visitedNodes={visitedNodes}
            onNodeClick={handleNodeClick}
            fieldClass={selectedCopaId ? COPA_FIELDS[selectedCopaId] ?? "field-barrial" : "field-barrial"}
          />
        </div>
      )}

      {party[selectedPartyIdx] && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {theme.uiTheme.labels.entitySingular} activo
            </h3>
            {party.length > 1 && (
              <button
                onClick={() => setShowParty(true)}
                className="text-[10px] font-bold text-accent uppercase hover:text-accent/80 transition-colors"
              >
                Plantel ({party.length})
              </button>
            )}
          </div>
          <EntityCard entity={party[selectedPartyIdx]} compact />
        </div>
      )}

      {status === "node_event" && currentNode && (
        <NodeEventScreen node={currentNode} onResolve={handleResolve} />
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {party.length > 1 && (
          <button
            onClick={() => setShowParty(true)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-[10px] font-bold text-text hover:bg-surface-light transition-colors"
          >
            Plantel
          </button>
        )}
        <button
          onClick={() => setShowInventory(true)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-[10px] font-bold text-text hover:bg-surface-light transition-colors"
        >
          Items
        </button>
      </div>

      {showParty && (
        <PartyPanel
          party={party}
          onSwap={(from, to) => {
            useGameStore.getState().swapPartyMembers(from, to);
            setSelectedPartyIdx(0);
          }}
          onClose={() => setShowParty(false)}
        />
      )}

      {showInventory && (
        <InventoryPanel onClose={() => setShowInventory(false)} />
      )}
    </div>
  );
}
