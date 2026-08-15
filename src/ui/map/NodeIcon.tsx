"use client";

import type { NodeType } from "@/core/types";

const NODE_CONFIG: Record<NodeType, { icon: string; color: string; label: string }> = {
  battle: { icon: "⚔️", color: "#ff5252", label: "Batalla" },
  elite: { icon: "🌟", color: "#ffd600", label: "Elite" },
  boss: { icon: "💀", color: "#ff1744", label: "Boss" },
  event: { icon: "📜", color: "#b388ff", label: "Evento" },
  shop: { icon: "🛒", color: "#40c4ff", label: "Tienda" },
  rest: { icon: "🏕️", color: "#69f0ae", label: "Descanso" },
  mystery: { icon: "❓", color: "#ffd600", label: "Misterio" },
  treasure: { icon: "💎", color: "#ffd740", label: "Tesoro" },
  recruitment: { icon: "🤝", color: "#00e676", label: "Fichaje" },
};

export function getNodeConfig(type: NodeType) {
  return NODE_CONFIG[type] ?? NODE_CONFIG.battle;
}

export function NodeIcon({ type, size = 20 }: { type: NodeType; size?: number }) {
  const config = getNodeConfig(type);
  return <span style={{ fontSize: size }}>{config.icon}</span>;
}
