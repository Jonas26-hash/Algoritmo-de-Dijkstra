import type { GraphNode, GraphEdge, DijkstraResult, DijkstraStep } from '../types/graph';

export function dijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string
): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }
  distances[startId] = 0;

  const adj = buildAdjacency(nodes, edges);

  while (unvisited.size > 0) {
    const current = findMinDistNode(unvisited, distances);
    if (current === null || distances[current] === Infinity) break;
    unvisited.delete(current);

    for (const neighbor of adj[current]) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }

  const paths = buildPaths(nodes, previous);
  return { distances, paths };
}

export function* dijkstraStepByStep(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string
): Generator<DijkstraStep> {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }
  distances[startId] = 0;

  const adj = buildAdjacency(nodes, edges);

  yield {
    current: startId,
    distances: { ...distances },
    visited: new Set(visited),
    previous: { ...previous },
    finished: false,
    message: `Inicio: nodo ${getLabel(nodes, startId)} con distancia 0`
  };

  while (unvisited.size > 0) {
    const current = findMinDistNode(unvisited, distances);
    if (current === null || distances[current] === Infinity) {
      yield {
        current: null,
        distances: { ...distances },
        visited: new Set(visited),
        previous: { ...previous },
        finished: true,
        message: 'Nodos restantes inalcanzables'
      };
      break;
    }

    unvisited.delete(current);
    visited.add(current);

    yield {
      current,
      distances: { ...distances },
      visited: new Set(visited),
      previous: { ...previous },
      finished: false,
      message: `Visitando nodo ${getLabel(nodes, current)} (distancia: ${distances[current]})`
    };

    for (const neighbor of adj[current]) {
      if (visited.has(neighbor.to)) continue;
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }

  yield {
    current: null,
    distances: { ...distances },
    visited: new Set(visited),
    previous: { ...previous },
    finished: true,
    message: 'Algoritmo completado'
  };
}

function buildAdjacency(nodes: GraphNode[], edges: GraphEdge[]): Record<string, { to: string; weight: number }[]> {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  for (const node of nodes) adj[node.id] = [];
  for (const edge of edges) {
    adj[edge.from].push({ to: edge.to, weight: edge.weight });
  }
  return adj;
}

function findMinDistNode(unvisited: Set<string>, distances: Record<string, number>): string | null {
  let minNode: string | null = null;
  let minDist = Infinity;
  for (const id of unvisited) {
    if (distances[id] < minDist) {
      minDist = distances[id];
      minNode = id;
    }
  }
  return minNode;
}

function buildPaths(nodes: GraphNode[], previous: Record<string, string | null>): Record<string, string[]> {
  const paths: Record<string, string[]> = {};
  for (const node of nodes) {
    const path: string[] = [];
    let cur: string | null = node.id;
    while (cur !== null) {
      path.unshift(cur);
      cur = previous[cur];
    }
    paths[node.id] = path.length > 1 || node.id === Object.keys(previous).find(k => previous[k] === null) ? path : [];
  }
  return paths;
}

function getLabel(nodes: GraphNode[], id: string): string {
  return nodes.find(n => n.id === id)?.label ?? id;
}
