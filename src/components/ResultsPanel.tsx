import type { GraphNode, DijkstraResult } from '../types/graph';
import type { SimplePath } from '../algorithm/paths';

interface ResultsPanelProps {
  nodes: GraphNode[];
  dijkstraResult: DijkstraResult | null;
  startNodeId: string | null;
  destinationId: string | null;
  destinationPaths: SimplePath[] | null;
}

export default function ResultsPanel({ nodes, dijkstraResult, startNodeId, destinationId, destinationPaths }: ResultsPanelProps) {
  if (!dijkstraResult || !startNodeId) {
    return (
      <div className="results-panel empty">
        <div className="results-placeholder">
          <span className="placeholder-icon">⊡</span>
          <p>Seleccioná un nodo inicial y ejecutá Dijkstra</p>
        </div>
      </div>
    );
  }

  const startLabel = nodes.find(n => n.id === startNodeId)?.label ?? startNodeId;

  // When destination is set AND reachable, show ALL simple paths to that destination
  if (destinationPaths && destinationPaths.length > 0 && destinationId) {
    const destLabel = nodes.find(n => n.id === destinationId)?.label ?? destinationId;
    return (
      <div className="results-panel">
        <div className="results-header">
          <h3>Caminos a {destLabel}</h3>
          <span className="results-subtitle">Desde nodo {startLabel}</span>
        </div>
        <div className="results-list">
          {destinationPaths.map((p, idx) => (
            <div key={idx} className="result-item result-item-dest">
              <div className="result-target">
                <span className="path-label">#{idx + 1}</span>
                <span className="result-distance">{p.totalWeight}</span>
              </div>
              <div className="result-path">
                {p.path.map((pid, i) => {
                  const pLabel = nodes.find(n => n.id === pid)?.label ?? pid;
                  return (
                    <span key={pid} className="path-step">
                      {i > 0 && <span className="path-arrow"> → </span>}
                      <span className={`path-node ${pid === startNodeId ? 'start' : ''} ${pid === destinationId ? 'dest' : ''}`}>
                        {pLabel}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const entries = nodes
    .filter(n => n.id !== startNodeId)
    .map(n => ({
      id: n.id,
      label: n.label,
      distance: dijkstraResult.distances[n.id],
      path: dijkstraResult.paths[n.id] ?? [],
    }));

  const reachable = entries.filter(e => e.distance !== Infinity);
  const unreachable = entries.filter(e => e.distance === Infinity);

  return (
    <div className="results-panel">
      <div className="results-header">
        <h3>Resultados</h3>
        <span className="results-subtitle">Desde nodo {startLabel}</span>
      </div>

      {reachable.length > 0 && (
        <div className="results-list">
          {reachable.map(e => (
            <div key={e.id} className={`result-item${e.id === destinationId ? ' result-item-dest' : ''}`}>
              <div className="result-target">
                <span className="result-node-badge">{e.label}</span>
                <span className="result-distance">{e.distance}</span>
              </div>
              <div className="result-path">
                <span className="path-label">Camino: </span>
                {e.path.map((pid, i) => {
                  const pLabel = nodes.find(n => n.id === pid)?.label ?? pid;
                  return (
                    <span key={pid} className="path-step">
                      {i > 0 && <span className="path-arrow"> → </span>}
                      <span className={`path-node ${pid === startNodeId ? 'start' : ''}`}>
                        {pLabel}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {unreachable.length > 0 && (
        <div className="results-unreachable">
          <h4>Inalcanzables</h4>
          <div className="unreachable-list">
            {unreachable.map(e => (
              <span key={e.id} className="unreachable-badge">{e.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
