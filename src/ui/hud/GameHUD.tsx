"use client";

import type { ThemePack, EntityInstance, Copa } from "@/core/types";
import { ResourceBar } from "./ResourceBar";
import { PartyBar } from "./PartyBar";

interface GameHUDProps {
  theme: ThemePack;
  resources: Record<string, number>;
  party: EntityInstance[];
  currentCopa: number;
  currentMap: number;
  copa: Copa | null;
  seed: number;
}

export function GameHUD({ theme, resources, party, currentCopa, currentMap, copa, seed }: GameHUDProps) {
  const mapLabels = ["Fecha 1", "Fecha 2", "Fecha 3", "Octavos", "Cuartos", "Semifinal", "La Final"];
  const mapLabel = mapLabels[currentMap - 1] ?? `Mapa ${currentMap}`;

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{copa?.emoji ?? theme.icon}</span>
          <div>
            <h2 className="text-sm font-bold text-text leading-tight">
              {copa ? copa.name : theme.name}
            </h2>
            <p className="text-[10px] text-text-dim">
              {copa
                ? `Copa ${currentCopa}/9 · ${mapLabel}`
                : `Acto ${currentCopa} · Seed #${seed}`
              }
            </p>
          </div>
        </div>
        <ResourceBar resources={resources} theme={theme} />
      </div>

      {/* Party */}
      <PartyBar party={party} />
    </div>
  );
}
