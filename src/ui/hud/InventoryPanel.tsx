"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";

interface InventoryPanelProps {
  onClose: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const inventory = useGameStore((s) => s.inventory);
  const theme = useGameStore((s) => s.theme);

  if (!theme) return null;

  function handleUse(itemId: string) {
    useGameStore.getState().useItem(itemId);
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-surface border-t border-border rounded-t-2xl p-4 pb-8 max-h-[80vh] overflow-y-auto"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-text">
            Inventario ({inventory.length})
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-text-dim hover:text-text px-2 py-1"
          >
            Cerrar
          </button>
        </div>

        {inventory.length === 0 ? (
          <p className="text-xs text-text-dim text-center py-8">
            No tenés items. Visitá una tienda.
          </p>
        ) : (
          <div className="space-y-2">
            {inventory.map((slot) => {
              const item = theme.items.find((i) => i.id === slot.itemId);
              if (!item) return null;

              const isConsumable = item.type === "consumable";

              const rarityBorder =
                item.rarity === "legendary" ? "border-yellow-500/40" :
                item.rarity === "epic" ? "border-purple-500/40" :
                item.rarity === "rare" ? "border-blue-500/40" :
                item.rarity === "uncommon" ? "border-green-500/40" :
                "border-border";

              const effectText =
                item.effect.type === "heal" ? `+${item.effect.value} HP` :
                item.effect.type === "revive" ? `Revive ${item.effect.value}% HP` :
                item.effect.type === "resource" ? `+${item.effect.value} ${item.effect.target}` :
                item.effect.type === "buff" ? `+${item.effect.value} ${item.effect.target}` :
                item.effect.type === "xp_boost" ? `XP x${item.effect.value}` :
                "";

              return (
                <div
                  key={slot.itemId}
                  className={`bg-surface border ${rarityBorder} rounded-lg p-3 flex items-center gap-3`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-xl">
                    {item.icon ?? "📦"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-text">{item.name}</span>
                    <p className="text-[10px] text-text-dim">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-accent font-bold">{effectText}</span>
                      <span className="text-[10px] text-text-dim">x{slot.quantity}</span>
                    </div>
                  </div>

                  {isConsumable && (
                    <button
                      onClick={() => handleUse(slot.itemId)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-bold uppercase hover:bg-primary/30 transition-colors"
                    >
                      Usar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
