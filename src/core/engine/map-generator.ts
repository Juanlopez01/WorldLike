import type { MapNode, GameMap, MapGenConfig, NodeType } from "../types";
import { SeededRNG } from "./rng";

interface NodeDistEntry {
  type: NodeType;
  weight: number;
  minPerAct: number;
  maxPerAct?: number;
}

export function generateMap(
  config: MapGenConfig,
  act: number,
  seed: number
): GameMap {
  const rng = new SeededRNG(seed + act * 7919);
  const rows = config.rowsPerAct;
  const nodes: MapNode[] = [];
  const grid: string[][] = [];

  // Generate node counts per row
  const rowCounts: number[] = [];
  for (let r = 0; r < rows; r++) {
    if (r === 0) {
      rowCounts.push(1); // start node
    } else if (r === rows - 1) {
      rowCounts.push(1); // boss node
    } else {
      rowCounts.push(rng.nextInt(config.nodesPerRow.min, config.nodesPerRow.max));
    }
  }

  // Track type counts for min/max enforcement
  const typeCounts: Record<string, number> = {};
  const dist = config.nodeDistribution;

  // Assign types to each position
  for (let r = 0; r < rows; r++) {
    const rowIds: string[] = [];
    const count = rowCounts[r];

    for (let c = 0; c < count; c++) {
      const nodeId = `node_${act}_${r}_${c}`;
      rowIds.push(nodeId);

      let nodeType: NodeType;

      if (r === 0) {
        nodeType = "battle";
      } else if (r === rows - 1) {
        nodeType = "boss";
      } else {
        nodeType = pickNodeType(dist, typeCounts, r, rows, config, rng);
      }

      typeCounts[nodeType] = (typeCounts[nodeType] || 0) + 1;

      nodes.push({
        id: nodeId,
        type: nodeType,
        row: r,
        col: c,
        connections: [],
        visited: false,
        revealed: r <= 1,
        difficulty: Math.ceil((r / rows) * 10 * (act * 0.5 + 0.5)),
        tags: [],
        conditions: [],
      });
    }
    grid.push(rowIds);
  }

  // Enforce minimums: replace random nodes if needed
  for (const entry of dist) {
    const current = typeCounts[entry.type] || 0;
    if (current < entry.minPerAct && entry.type !== "boss") {
      const deficit = entry.minPerAct - current;
      let replaced = 0;
      for (const node of rng.shuffle(nodes)) {
        if (replaced >= deficit) break;
        if (node.row === 0 || node.row === rows - 1) continue;
        if (node.type === entry.type) continue;
        // Don't replace types that are at their minimum
        const nodeEntry = dist.find((d) => d.type === node.type);
        const nodeCount = typeCounts[node.type] || 0;
        if (nodeEntry && nodeCount <= nodeEntry.minPerAct) continue;

        typeCounts[node.type] = (typeCounts[node.type] || 0) - 1;
        node.type = entry.type;
        typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
        replaced++;
      }
    }
  }

  // Generate connections (each node connects to 1-maxForward nodes in next row)
  for (let r = 0; r < rows - 1; r++) {
    const currentRow = grid[r];
    const nextRow = grid[r + 1];

    for (const nodeId of currentRow) {
      const node = nodes.find((n) => n.id === nodeId)!;
      const numConnections = Math.min(
        rng.nextInt(1, config.connectionRules.maxForward),
        nextRow.length
      );

      // Always connect to at least one node
      const targets = rng.shuffle([...nextRow]).slice(0, numConnections);
      node.connections = targets;
    }

    // Ensure every node in nextRow has at least one incoming connection
    for (const nextId of nextRow) {
      const hasIncoming = currentRow.some((currId) => {
        const n = nodes.find((n) => n.id === currId)!;
        return n.connections.includes(nextId);
      });
      if (!hasIncoming) {
        const randomParent = rng.pick(currentRow);
        const parent = nodes.find((n) => n.id === randomParent)!;
        if (!parent.connections.includes(nextId)) {
          parent.connections.push(nextId);
        }
      }
    }
  }

  const startNodeId = grid[0][0];
  const bossNodeId = grid[rows - 1][0];

  // Mark start as revealed and give it a label
  const startNode = nodes.find((n) => n.id === startNodeId)!;
  startNode.revealed = true;
  startNode.visited = false;

  return {
    id: `map_act${act}_seed${seed}`,
    name: `Acto ${act}`,
    description: "",
    act,
    nodes,
    startNodeId,
    bossNodeId,
  };
}

function pickNodeType(
  dist: NodeDistEntry[],
  counts: Record<string, number>,
  row: number,
  totalRows: number,
  config: MapGenConfig,
  rng: SeededRNG
): NodeType {
  const eligible = dist.filter((entry) => {
    if (entry.type === "boss") return false;
    // Row restrictions
    if (entry.type === "elite" && row < config.eliteMinRow) return false;
    if (entry.type === "rest" && row < config.restMinRow) return false;
    if (entry.type === "shop" && row < config.shopMinRow) return false;
    // Max per act
    const current = counts[entry.type] || 0;
    if (entry.maxPerAct !== undefined && current >= entry.maxPerAct) return false;
    return true;
  });

  if (eligible.length === 0) {
    return "battle";
  }

  return rng.pickWeighted(eligible).type;
}

export function getReachableNodes(
  map: GameMap,
  currentNodeId: string
): MapNode[] {
  const current = map.nodes.find((n) => n.id === currentNodeId);
  if (!current) return [];
  return map.nodes.filter((n) => current.connections.includes(n.id));
}

export function revealConnectedNodes(map: GameMap, nodeId: string): GameMap {
  const node = map.nodes.find((n) => n.id === nodeId);
  if (!node) return map;

  return {
    ...map,
    nodes: map.nodes.map((n) => {
      if (node.connections.includes(n.id)) {
        return { ...n, revealed: true };
      }
      // Also reveal nodes connected FROM the connected nodes (one step ahead)
      if (node.connections.some((connId) => {
        const connNode = map.nodes.find((cn) => cn.id === connId);
        return connNode?.connections.includes(n.id);
      })) {
        return { ...n, revealed: true };
      }
      return n;
    }),
  };
}
