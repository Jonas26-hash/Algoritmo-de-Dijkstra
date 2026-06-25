export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface DijkstraResult {
  distances: Record<string, number>;
  paths: Record<string, string[]>;
}

export interface FloydWarshallResult {
  distances: Record<string, Record<string, number>>;
  next: Record<string, Record<string, string | null>>;
}

export interface DijkstraStep {
  current: string | null;
  distances: Record<string, number>;
  visited: Set<string>;
  previous: Record<string, string | null>;
  finished: boolean;
  message: string;
}

export type ToolMode = 'node' | 'edge' | 'select' | 'delete';
export type AlgorithmMethod = 'dijkstra' | 'floyd';
