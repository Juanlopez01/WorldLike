"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";
import { useMetaStore, ALBUM_PRICES } from "@/core/store/meta-store";
import type { EntityTemplate, Rarity } from "@/core/types";

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

const RARITY_COLORS: Record<Rarity, { bg: string; border: string; text: string; label: string }> = {
  common: { bg: "#8e9eab15", border: "#8e9eab40", text: "#8e9eab", label: "Común" },
  uncommon: { bg: "#2e8b5715", border: "#2e8b5740", text: "#2e8b57", label: "Infrecuente" },
  rare: { bg: "#2980b915", border: "#2980b940", text: "#2980b9", label: "Raro" },
  epic: { bg: "#7e57c215", border: "#7e57c240", text: "#7e57c2", label: "Épico" },
  legendary: { bg: "#d4a01715", border: "#d4a01740", text: "#d4a017", label: "Legendario" },
};

export function MetaShopScreen() {
  const theme = useGameStore((s) => s.theme);
  const coins = useMetaStore((s) => s.coins);
  const collection = useMetaStore((s) => s.collection);
  const [activeRarity, setActiveRarity] = useState<Rarity | "all">("all");
  const [search, setSearch] = useState("");
  const [justBought, setJustBought] = useState<string | null>(null);
  const [showOwned, setShowOwned] = useState<"all" | "owned" | "missing">("all");

  const allPlayers = useMemo(() => {
    if (!theme) return [];
    return theme.entities
      .filter((e) => !e.id.startsWith("e_"))
      .sort((a, b) => {
        const ri = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
        if (ri !== 0) return ri;
        return a.name.localeCompare(b.name);
      });
  }, [theme]);

  const filtered = useMemo(() => {
    let list = allPlayers;
    if (activeRarity !== "all") list = list.filter((e) => e.rarity === activeRarity);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.team && e.team.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }
    if (showOwned === "owned") list = list.filter((e) => collection.includes(e.id));
    if (showOwned === "missing") list = list.filter((e) => !collection.includes(e.id));
    return list;
  }, [allPlayers, activeRarity, search, showOwned, collection]);

  const totalPlayers = allPlayers.length;
  const ownedCount = allPlayers.filter((e) => collection.includes(e.id)).length;
  const progressPct = totalPlayers > 0 ? Math.round((ownedCount / totalPlayers) * 100) : 0;

  const handlePurchase = (player: EntityTemplate) => {
    const success = useMetaStore.getState().purchaseForAlbum(player.id, player.rarity);
    if (success) {
      setJustBought(player.id);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  if (!theme) return null;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="text-center pt-5 pb-3 px-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-xl font-black tracking-tight">
          <span className="text-primary">ÁLBUM</span>{" "}
          <span className="text-text-dim text-sm font-medium">DE FIGURITAS</span>
        </h1>
        <p className="text-[10px] text-text-secondary mt-0.5">
          Coleccioná todos los jugadores
        </p>
      </motion.div>

      {/* Coins + progress */}
      <motion.div
        className="mx-4 mb-3 p-3 rounded-xl bg-surface border border-border card-shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">🪙</span>
            <span className="text-accent font-black text-lg tabular-nums">{coins.toLocaleString()}</span>
          </div>
          <span className="text-xs text-text-secondary tabular-nums">
            {ownedCount}/{totalPlayers} ({progressPct}%)
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-border/40">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Search */}
      <div className="px-4 mb-2">
        <input
          type="text"
          placeholder="Buscar jugador, equipo o posición..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text
            placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Rarity filter tabs */}
      <div className="px-4 mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveRarity("all")}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border
            ${activeRarity === "all"
              ? "bg-primary/15 border-primary/40 text-primary"
              : "bg-surface border-border text-text-dim hover:text-text"}`}
        >
          TODOS
        </button>
        {RARITY_ORDER.map((r) => {
          const rc = RARITY_COLORS[r];
          const count = allPlayers.filter((e) => e.rarity === r).length;
          const owned = allPlayers.filter((e) => e.rarity === r && collection.includes(e.id)).length;
          return (
            <button
              key={r}
              onClick={() => setActiveRarity(r)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border
                ${activeRarity === r
                  ? `border-opacity-60 text-opacity-100`
                  : "hover:opacity-80"}`}
              style={{
                backgroundColor: activeRarity === r ? rc.bg : "transparent",
                borderColor: activeRarity === r ? rc.border : "var(--border)",
                color: activeRarity === r ? rc.text : "var(--text-dim)",
              }}
            >
              {rc.label.toUpperCase()} ({owned}/{count})
            </button>
          );
        })}
      </div>

      {/* Owned filter */}
      <div className="px-4 mb-3 flex gap-1.5">
        {(["all", "missing", "owned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setShowOwned(f)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border
              ${showOwned === f
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-transparent border-border text-text-dim"}`}
          >
            {f === "all" ? "Todos" : f === "owned" ? "Tengo" : "Faltan"}
          </button>
        ))}
        <span className="ml-auto text-[9px] text-text-dim self-center tabular-nums">
          {filtered.length} jugador{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Player grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="grid grid-cols-2 gap-2">
            {filtered.map((player, i) => {
              const owned = collection.includes(player.id);
              const rc = RARITY_COLORS[player.rarity];
              const price = ALBUM_PRICES[player.rarity] ?? ALBUM_PRICES.common;
              const canAfford = coins >= price;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.015, 0.2) }}
                  className={`relative rounded-xl overflow-hidden border transition-all
                    ${owned ? "opacity-100" : "opacity-80"}`}
                  style={{
                    backgroundColor: owned ? rc.bg : "var(--surface)",
                    borderColor: owned ? rc.border : "var(--border)",
                  }}
                >
                  {/* Player image + info */}
                  <div className="flex items-center gap-2 p-2">
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${rc.text}25, ${rc.text}10)` }}
                    >
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className={`w-full h-full object-cover ${!owned ? "grayscale" : ""}`}
                          loading="lazy"
                        />
                      ) : (
                        <span className={`text-lg ${!owned ? "grayscale" : ""}`}>⚽</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] font-bold text-text truncate">{player.name}</h3>
                      <p className="text-[8px] text-text-secondary truncate">
                        {player.category} · {player.team || "Sin equipo"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="text-[7px] font-bold uppercase px-1 py-0.5 rounded"
                          style={{ color: rc.text, backgroundColor: `${rc.text}15` }}
                        >
                          {rc.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="px-2 pb-2">
                    <AnimatePresence mode="wait">
                      {justBought === player.id ? (
                        <motion.div
                          key="bought"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="text-center py-1"
                        >
                          <span className="text-primary text-sm font-bold">✓ Pegada!</span>
                        </motion.div>
                      ) : owned ? (
                        <div key="owned" className="flex items-center justify-center gap-1 py-1">
                          <span
                            className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ color: rc.text, backgroundColor: `${rc.text}20` }}
                          >
                            ✓ EN ÁLBUM
                          </span>
                        </div>
                      ) : (
                        <button
                          key="buy"
                          onClick={() => handlePurchase(player)}
                          disabled={!canAfford}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1
                            ${canAfford
                              ? "bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25"
                              : "bg-bg-alt border border-border text-text-dim cursor-not-allowed"}`}
                        >
                          <span>🪙</span>
                          <span className="tabular-nums">{price.toLocaleString()}</span>
                        </button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-text-dim">No se encontraron jugadores</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => useGameStore.getState().goToHub()}
            className="w-full py-3 rounded-xl bg-surface border border-border text-sm font-bold text-text hover:bg-surface-light transition-colors card-shadow"
          >
            VOLVER AL HUB
          </button>
        </div>
      </motion.div>
    </div>
  );
}
