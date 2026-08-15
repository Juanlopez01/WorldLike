"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { GameMap, MapNode } from "@/core/types";
import { getNodeConfig } from "./NodeIcon";

interface NodeMapProps {
  map: GameMap;
  currentNodeId: string | null;
  visitedNodes: string[];
  onNodeClick: (nodeId: string) => void;
  fieldClass?: string;
}

const NODE_RADIUS = 22;
const ROW_GAP = 80;
const COL_GAP = 70;
const PADDING_X = 50;
const PADDING_Y = 60;

export function NodeMap({ map, currentNodeId, visitedNodes, onNodeClick, fieldClass = "field-barrial" }: NodeMapProps) {
  const rows = useMemo(() => {
    const grouped: Record<number, MapNode[]> = {};
    for (const node of map.nodes) {
      (grouped[node.row] ??= []).push(node);
    }
    return grouped;
  }, [map.nodes]);

  const maxRow = Math.max(...map.nodes.map((n) => n.row));
  const maxCols = Math.max(...Object.values(rows).map((r) => r.length));

  const width = maxCols * COL_GAP + PADDING_X * 2;
  const height = (maxRow + 1) * ROW_GAP + PADDING_Y * 2;

  const getPos = useCallback(
    (node: MapNode) => {
      const rowNodes = rows[node.row] || [];
      const totalWidth = (rowNodes.length - 1) * COL_GAP;
      const startX = (width - totalWidth) / 2;
      const colIndex = rowNodes.findIndex((n) => n.id === node.id);
      return {
        x: startX + colIndex * COL_GAP,
        y: PADDING_Y + node.row * ROW_GAP,
      };
    },
    [rows, width]
  );

  const reachableIds = useMemo(() => {
    if (!currentNodeId) return new Set<string>();
    const current = map.nodes.find((n) => n.id === currentNodeId);
    return new Set(current?.connections ?? []);
  }, [currentNodeId, map.nodes]);

  const visitedSet = useMemo(() => new Set(visitedNodes), [visitedNodes]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="relative rounded-xl overflow-hidden" style={{ minWidth: 320 }}>
        {/* Field background */}
        <div className={`absolute inset-0 ${fieldClass}`} />
        {/* Field lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
          {/* Center line */}
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="white" strokeWidth="1" opacity="0.15" />
          {/* Center circle */}
          <circle cx={width / 2} cy={height / 2} r={40} fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
          {/* Center dot */}
          <circle cx={width / 2} cy={height / 2} r={3} fill="white" opacity="0.15" />
          {/* Top penalty area */}
          <rect x={width / 2 - 60} y={0} width={120} height={30} fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
          {/* Bottom penalty area */}
          <rect x={width / 2 - 60} y={height - 30} width={120} height={30} fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
        </svg>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="relative z-10 w-full max-w-md mx-auto"
          style={{ minWidth: 320 }}
        >
          <defs>
            <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
            </filter>
            <filter id="glow-current" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#d4a017" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines - show ALL connections */}
          {map.nodes.map((node) =>
            node.connections.map((targetId) => {
              const target = map.nodes.find((n) => n.id === targetId);
              if (!target) return null;
              const from = getPos(node);
              const to = getPos(target);

              const isActive =
                node.id === currentNodeId ||
                (visitedSet.has(node.id) && visitedSet.has(targetId));
              const isReachable =
                node.id === currentNodeId && reachableIds.has(targetId);

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={
                    isReachable
                      ? "white"
                      : isActive
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.15)"
                  }
                  strokeWidth={isReachable ? 2.5 : 1.5}
                  strokeDasharray={!isActive && !isReachable ? "4 4" : undefined}
                />
              );
            })
          )}

          {/* ALL nodes visible */}
          {map.nodes.map((node) => {
            const pos = getPos(node);
            const config = getNodeConfig(node.type);
            const isCurrent = node.id === currentNodeId;
            const isVisited = visitedSet.has(node.id);
            const isReachable = reachableIds.has(node.id);
            const isFuture = !isCurrent && !isVisited && !isReachable;

            return (
              <g key={node.id}>
                {/* Pulse ring for reachable */}
                {isReachable && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS}
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={
                    isCurrent
                      ? "#ffffff"
                      : isVisited
                        ? "rgba(255,255,255,0.3)"
                        : isReachable
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.15)"
                  }
                  stroke={
                    isCurrent
                      ? "#d4a017"
                      : isReachable
                        ? "white"
                        : isVisited
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(255,255,255,0.08)"
                  }
                  strokeWidth={isCurrent ? 3 : isReachable ? 2 : 1}
                  className={isReachable ? "cursor-pointer" : ""}
                  onClick={() => isReachable && onNodeClick(node.id)}
                  filter={isCurrent ? "url(#glow-current)" : isReachable || isVisited ? "url(#node-shadow)" : undefined}
                />

                {/* Node icon */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isCurrent ? 18 : isFuture ? 14 : 16}
                  className="pointer-events-none select-none"
                  opacity={isFuture ? 0.5 : isVisited && !isCurrent ? 0.5 : 1}
                >
                  {config.icon}
                </text>

                {/* Visited checkmark */}
                {isVisited && !isCurrent && (
                  <text
                    x={pos.x + NODE_RADIUS - 4}
                    y={pos.y - NODE_RADIUS + 6}
                    fontSize={10}
                    fill="#1b8a3a"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ✓
                  </text>
                )}

                {/* Node type label for future nodes */}
                {isFuture && node.type === "boss" && (
                  <text
                    x={pos.x}
                    y={pos.y + NODE_RADIUS + 12}
                    textAnchor="middle"
                    fontSize={8}
                    fill="rgba(255,255,255,0.5)"
                    fontWeight="bold"
                  >
                    BOSS
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
