"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/core/store/game-store";
import type { InventorySlot } from "@/core/types";

export function ShopScreen() {
  const shopOffers = useGameStore((s) => s.shopOffers);
  const resources = useGameStore((s) => s.resources);
  const inventory = useGameStore((s) => s.inventory);
  const theme = useGameStore((s) => s.theme);

  if (!theme) return null;

  const shopConfig = theme.shops[0];
  const monedas = resources.monedas ?? 0;

  function handleBuy(itemId: string, price: number) {
    useGameStore.getState().buyItem(itemId, price);
  }

  function handleLeave() {
    useGameStore.getState().leaveShop();
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="text-center mb-6">
          <span className="text-4xl">{shopConfig?.icon ?? "🏪"}</span>
          <h1 className="text-lg font-black text-text mt-2 uppercase tracking-wider">
            {shopConfig?.name ?? "Tienda"}
          </h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-text">{monedas}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {shopOffers.map((offer, idx) => {
            const item = theme.items.find((i) => i.id === offer.itemId);
            if (!item) return null;

            const canAfford = monedas >= offer.price;
            const owned = inventory.find((s) => s.itemId === offer.itemId);
            const atMax = owned && owned.quantity >= item.maxStack;

            const rarityColor =
              item.rarity === "legendary" ? "text-yellow-400" :
              item.rarity === "epic" ? "text-purple-400" :
              item.rarity === "rare" ? "text-blue-400" :
              item.rarity === "uncommon" ? "text-green-400" :
              "text-text-dim";

            return (
              <motion.div
                key={`${offer.itemId}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-xl">
                  {item.icon ?? "📦"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text truncate">
                      {item.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${rarityColor}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-dim mt-0.5">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-dim capitalize">{item.type}</span>
                    {owned && (
                      <span className="text-[10px] text-text-dim">
                        Tenés: {owned.quantity}/{item.maxStack}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(offer.itemId, offer.price)}
                  disabled={!canAfford || !!atMax}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !canAfford || atMax
                      ? "bg-surface-light text-text-dim cursor-not-allowed"
                      : "bg-accent text-white hover:bg-accent/80"
                  }`}
                >
                  🪙 {offer.price}
                </button>
              </motion.div>
            );
          })}
        </div>

        {inventory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">
              Tu inventario
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {inventory.map((slot) => {
                const item = theme.items.find((i) => i.id === slot.itemId);
                if (!item) return null;
                return (
                  <div
                    key={slot.itemId}
                    className="bg-surface-light border border-border rounded-md px-2 py-1 flex items-center gap-1"
                  >
                    <span className="text-xs">{item.icon ?? "📦"}</span>
                    <span className="text-[10px] text-text font-bold">{item.name}</span>
                    <span className="text-[10px] text-text-dim">x{slot.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleLeave}
          className="w-full py-3 rounded-lg bg-surface border border-border text-text text-sm font-bold hover:bg-surface-light transition-colors"
        >
          SALIR DE LA TIENDA
        </button>
      </motion.div>
    </div>
  );
}
