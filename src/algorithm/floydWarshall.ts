import type { GraphNode, GraphEdge, FloydWarshallResult } from '../types/graph';

export function floydWarshall(
  nodes: GraphNode[],
  edges: GraphEdge[]
): FloydWarshallResult {
  const ids = nodes.map(n => n.id);
  const dist: Record<string, Record<string, number>> = {};
  const next: Record<string, Record<string, string | null>> = {};

  for (const i of ids) {
    dist[i] = {};
    next[i] = {};
    for (const j of ids) {
      dist[i][j] = i === j ? 0 : Infinity;
      next[i][j] = null;
    }
  }

  for (const edge of edges) {
    dist[edge.from][edge.to] = edge.weight;
    next[edge.from][edge.to] = edge.to;
  }

  for (const k of ids) {
    for (const i of ids) {
      for (const j of ids) {
        const sum = dist[i][k] + dist[k][j];
        if (sum < dist[i][j]) {
          dist[i][j] = sum;
          next[i][j] = next[i][k];
        }
      }
    }
  }

  return { distances: dist, next };
}

export function getFloydPath(
  next: Record<string, Record<string, string | null>>,
  from: string,
  to: string
): string[] {
  if (next[from]?.[to] === null) return [];
  const path: string[] = [from];
  let current = from;
  while (current !== to) {
    current = next[current]?.[to] as string;
    if (!current) return [];
    path.push(current);
  }
  return path;
}
