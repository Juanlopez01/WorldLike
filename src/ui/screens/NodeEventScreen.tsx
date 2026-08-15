"use client";

import { motion } from "framer-motion";
import type { MapNode } from "@/core/types";
import { getNodeConfig } from "../map/NodeIcon";

interface NodeEventScreenProps {
  node: MapNode;
  onResolve: () => void;
}

export function NodeEventScreen({ node, onResolve }: NodeEventScreenProps) {
  const config = getNodeConfig(node.type);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm bg-surface border border-border rounded-xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div
          className="p-4 text-center"
          style={{
            background: `linear-gradient(180deg, ${config.color}15, transparent)`,
          }}
        >
          <span className="text-4xl block mb-2">{config.icon}</span>
          <h2 className="text-lg font-bold text-text">{config.label}</h2>
          <p className="text-xs text-text-secondary mt-1">
            {node.description || getNodeDescription(node)}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {node.difficulty && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Dificultad</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        i < node.difficulty!
                          ? node.difficulty! > 7
                            ? "#ff5252"
                            : node.difficulty! > 4
                            ? "#ffd600"
                            : "#00e676"
                          : "#1e3048",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onResolve}
            className="w-full py-3 rounded-lg font-bold text-sm
              bg-primary text-white hover:brightness-105 active:scale-[0.98]
              transition-all"
          >
            {getActionLabel(node.type)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getNodeDescription(node: MapNode): string {
  switch (node.type) {
    case "battle": return "Un rival aparece en tu camino";
    case "elite": return "Un oponente de elite te desafia";
    case "boss": return "El desafio final de este acto";
    case "event": return "Algo inesperado ocurre...";
    case "shop": return "Un mercado con ofertas tentadoras";
    case "rest": return "Un lugar tranquilo para recuperarse";
    case "mystery": return "Lo desconocido aguarda...";
    case "treasure": return "Un cofre brilla ante tus ojos";
    case "recruitment": return "Alguien quiere unirse a tu equipo";
    default: return "";
  }
}

function getActionLabel(type: string): string {
  switch (type) {
    case "battle":
    case "elite":
    case "boss": return "PELEAR";
    case "shop": return "ENTRAR";
    case "rest": return "DESCANSAR";
    case "recruitment": return "RECLUTAR";
    default: return "CONTINUAR";
  }
}
