import type { GraphNode, GraphEdge } from '../types/graph';

interface AdjacencyMatrixProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function AdjacencyMatrix({ nodes, edges }: AdjacencyMatrixProps) {
  if (nodes.length === 0) return null;

  // Build matrix
  const matrix: string[][] = nodes.map(() => nodes.map(() => '-1'));

  for (const edge of edges) {
    const i = nodes.findIndex(n => n.id === edge.from);
    const j = nodes.findIndex(n => n.id === edge.to);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = String(edge.weight);
    }
  }

  // Diagonal = 0
  for (let i = 0; i < nodes.length; i++) {
    matrix[i][i] = '0';
  }

  // Check if matrix has any non-(-1) values besides diagonal
  const hasEdges = edges.length > 0;

  return (
    <div className="matrix-panel">
      <h4 className="matrix-title">Matriz de Adyacencia</h4>
      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-corner"></th>
              {nodes.map(n => (
                <th key={n.id} className="matrix-header-cell">{n.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={nodes[i].id}>
                <th className="matrix-row-label">{nodes[i].label}</th>
                {row.map((val, j) => {
                  const isEdge = val !== '-1' && val !== '0';
                  const isDiagonal = i === j;
                  return (
                    <td
                      key={`${i}-${j}`}
                      className={
                        `matrix-cell` +
                        (isDiagonal ? ' diagonal' : '') +
                        (isEdge ? ' has-edge' : ' no-edge') +
                        (hasEdges && isEdge && parseInt(val) <= 5 ? ' low-weight' : '')
                      }
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
