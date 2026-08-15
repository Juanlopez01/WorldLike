"use client";

import { useCallback, useEffect, useState } from "react";
import type { ThemePack } from "@/core/types";
import { useGameStore } from "@/core/store/game-store";
import { useMetaStore } from "@/core/store/meta-store";
import { TitleScreen } from "@/ui/screens/TitleScreen";
import { GameScreen } from "@/ui/screens/GameScreen";

export default function Home() {
  const [themes, setThemes] = useState<{ pack: ThemePack; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const status = useGameStore((s) => s.status);

  useEffect(() => {
    useMetaStore.getState().loadMeta();

    async function loadThemes() {
      try {
        const { loadFutbolMonTheme } = await import("@/themes/futbolmon");
        const futbolmon = await loadFutbolMonTheme();
        setThemes([{ pack: futbolmon, label: "FutbolMon" }]);
      } catch (err) {
        console.error("Error loading themes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadThemes();
  }, []);

  const handleSelectTheme = useCallback((theme: ThemePack) => {
    useGameStore.getState().setTheme(theme);
  }, []);

  const handleContinue = useCallback((theme: ThemePack) => {
    const store = useGameStore.getState();
    store.setTheme(theme);
    store.loadRun();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "idle") {
    return <TitleScreen themes={themes} onSelectTheme={handleSelectTheme} onContinue={handleContinue} />;
  }

  return <GameScreen />;
}
