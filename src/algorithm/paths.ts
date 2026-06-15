import type { GraphNode, GraphEdge } from '../types/graph';

export interface SimplePath {
  path: string[];
  totalWeight: number;
}

export function findAllSimplePaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string
): SimplePath[] {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  for (const node of nodes) adj[node.id] = [];
  for (const edge of edges) {
    adj[edge.from].push({ to: edge.to, weight: edge.weight });
  }

  const result: SimplePath[] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[], weight: number) {
    if (current === endId) {
      result.push({ path: [...path], totalWeight: weight });
      return;
    }
    visited.add(current);
    for (const neighbor of adj[current] ?? []) {
      if (!visited.has(neighbor.to)) {
        path.push(neighbor.to);
        dfs(neighbor.to, path, weight + neighbor.weight);
        path.pop();
      }
    }
    visited.delete(current);
  }

  visited.add(startId);
  dfs(startId, [startId], 0);
  visited.delete(startId);

  return result.sort((a, b) => a.totalWeight - b.totalWeight);
}
