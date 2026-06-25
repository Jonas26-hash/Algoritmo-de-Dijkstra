import type { GraphNode, DijkstraResult, AlgorithmMethod, FloydWarshallResult } from '../types/graph';
import type { SimplePath } from '../algorithm/paths';

interface ResultsPanelProps {
  nodes: GraphNode[];
  dijkstraResult: DijkstraResult | null;
  startNodeId: string | null;
  destinationId: string | null;
  destinationPaths: SimplePath[] | null;
  method: AlgorithmMethod;
  floydResult: FloydWarshallResult | null;
  comparison: {
    dijkstraResult: DijkstraResult;
    floydResult: FloydWarshallResult;
    startNodeId: string;
  } | null;
}

export default function ResultsPanel({ nodes, dijkstraResult, startNodeId, destinationId, destinationPaths, method, floydResult, comparison }: ResultsPanelProps) {
  if (!dijkstraResult || !startNodeId) {
    return (
      <div className="results-panel empty">
        <div className="results-placeholder">
          <span className="placeholder-icon">⊡</span>
          <p>Seleccioná un nodo inicial y ejecutá {method === 'floyd' ? 'Floyd‑Warshall' : 'Dijkstra'}</p>
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
          <span className="results-subtitle">Desde nodo {startLabel} {method === 'floyd' ? '(Floyd‑Warshall)' : ''}</span>
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
        <span className="results-subtitle">Desde nodo {startLabel} {method === 'floyd' ? '(Floyd‑Warshall)' : ''}</span>
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

      {method === 'floyd' && floydResult && (
        <div className="floyd-matrix">
          <div className="floyd-matrix-header">
            <h4>Matriz de distancias (Floyd‑Warshall)</h4>
            <span className="results-subtitle">Distancia mínima entre cualquier par</span>
          </div>
          <div className="matrix-scroll">
            <table className="matrix-table floyd-table">
              <thead>
                <tr>
                  <th className="matrix-corner"></th>
                  {nodes.map(n => (
                    <th key={n.id} className="matrix-header-cell">{n.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map(from => (
                  <tr key={from.id}>
                    <td className="matrix-row-label">{from.label}</td>
                    {nodes.map(to => {
                      const d = floydResult.distances[from.id]?.[to.id];
                      const isInf = d === undefined || d === Infinity;
                      const isDiagonal = from.id === to.id;
                      return (
                        <td
                          key={to.id}
                          className={`matrix-cell ${isDiagonal ? 'diagonal' : ''} ${isInf ? 'no-edge' : ''}`}
                        >
                          {isDiagonal ? '0' : isInf ? '∞' : d}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {comparison && (
        <div className="floyd-matrix">
          <div className="floyd-matrix-header">
            <h4>⚖ Comparación desde nodo {nodes.find(n => n.id === comparison.startNodeId)?.label ?? comparison.startNodeId}</h4>
            <span className="results-subtitle">Dijkstra vs Floyd‑Warshall — lado a lado</span>
          </div>
          <div className="matrix-scroll">
            <table className="matrix-table compare-table">
              <thead>
                <tr>
                  <th className="matrix-corner">Destino</th>
                  <th className="matrix-header-cell">Dijkstra</th>
                  <th className="matrix-header-cell">Floyd‑Warshall</th>
                  <th className="matrix-corner">Difiere</th>
                </tr>
              </thead>
              <tbody>
                {nodes.filter(n => n.id !== comparison.startNodeId).map(n => {
                  const dDist = comparison.dijkstraResult.distances[n.id];
                  const fDist = comparison.floydResult.distances[comparison.startNodeId]?.[n.id];
                  const dInf = dDist === undefined || dDist === Infinity;
                  const fInf = fDist === undefined || fDist === Infinity;
                  const diff = !dInf && !fInf && dDist !== fDist;
                  return (
                    <tr key={n.id}>
                      <td className="matrix-row-label">{n.label}</td>
                      <td className={`matrix-cell ${dInf ? 'no-edge' : ''}`}>{dInf ? '∞' : dDist}</td>
                      <td className={`matrix-cell ${fInf ? 'no-edge' : ''} ${diff ? 'low-weight' : ''}`}>{fInf ? '∞' : fDist}</td>
                      <td className={`matrix-cell ${diff ? 'no-edge' : ''}`}>{diff ? '⚠' : '✓'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nodes.filter(n => n.id !== comparison.startNodeId).some(n => {
            const dDist = comparison.dijkstraResult.distances[n.id];
            const fDist = comparison.floydResult.distances[comparison.startNodeId]?.[n.id];
            const dInf = dDist === undefined || dDist === Infinity;
            const fInf = fDist === undefined || fDist === Infinity;
            return !dInf && !fInf && dDist !== fDist;
          }) && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8, padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 8, border: '1px solid var(--danger-border)' }}>
              ⚠ Los resultados difieren. Floyd‑Warshall maneja aristas con peso negativo; Dijkstra no.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
