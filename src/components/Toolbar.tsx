import type { ToolMode, GraphNode, DijkstraResult, AlgorithmMethod } from '../types/graph';

const GRAPH_PRESETS = [
  'Guía original (7 nodos)',
  'Árbol (6 nodos)',
  'Completo (4 nodos)',
  'Red extendida (5 nodos)',
  'Dos componentes (6 nodos)',
  'Camino largo (8 nodos)',
  'Pesos altos (5 nodos)',
  'Pesos negativos (4 nodos)',
];

interface ToolbarProps {
  mode: ToolMode;
  setMode: (m: ToolMode) => void;
  nodes: GraphNode[];
  startNodeId: string | null;
  setStartNodeId: (id: string) => void;
  destinationId: string | null;
  setDestinationId: (id: string | null) => void;
  onRunDijkstra: () => void;
  onClear: () => void;
  onGenerateExample: (presetIdx?: number) => void;
  showMatrix: boolean;
  setShowMatrix: (v: boolean) => void;
  dijkstraResult: DijkstraResult | null;
  stepMode: boolean;
  setStepMode: (v: boolean) => void;
  onNextStep: () => void;
  canStep: boolean;
  isStepping: boolean;
  selectedPreset: number;
  method: AlgorithmMethod;
  onMethodChange: (m: AlgorithmMethod) => void;
  onCompare: () => void;
}

export default function Toolbar({
  mode, setMode, nodes, startNodeId, setStartNodeId,
  destinationId, setDestinationId,
  onRunDijkstra, onClear, onGenerateExample,
  showMatrix, setShowMatrix,
  dijkstraResult,
  stepMode, setStepMode, onNextStep, canStep, isStepping,
  selectedPreset, method, onMethodChange, onCompare,
}: ToolbarProps) {
  const modes: { key: ToolMode; label: string; icon: string }[] = [
    { key: 'node', label: 'Nodo', icon: '⬤' },
    { key: 'edge', label: 'Arco', icon: '→' },
    { key: 'select', label: 'Mover', icon: '✥' },
    { key: 'delete', label: 'Borrar', icon: '✕' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Herramientas</span>
        <div className="mode-buttons">
          {modes.map(m => (
            <button
              key={m.key}
              className={`mode-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => setMode(m.key)}
              title={m.label}
            >
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <span className="toolbar-label">Nodo Inicial / Destino</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            className="node-select"
            style={{ flex: 1 }}
            value={startNodeId ?? ''}
            onChange={e => setStartNodeId(e.target.value)}
          >
            <option value="" disabled>Inicio...</option>
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
          <select
            className="node-select"
            style={{ flex: 1 }}
            value={destinationId ?? ''}
            onChange={e => setDestinationId(e.target.value || null)}
          >
            <option value="">Destino...</option>
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar-section">
        <span className="toolbar-label">Algoritmo</span>
        <div className="method-buttons">
          <button
            className={`method-btn ${method === 'dijkstra' ? 'active' : ''}`}
            onClick={() => onMethodChange('dijkstra')}
          >
            Dijkstra
          </button>
          <button
            className={`method-btn ${method === 'floyd' ? 'active' : ''}`}
            onClick={() => onMethodChange('floyd')}
          >
            Floyd‑Warshall
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="run-buttons">
          <button
            className="btn btn-primary"
            onClick={onRunDijkstra}
            disabled={method === 'floyd' ? nodes.length === 0 : !startNodeId || nodes.length === 0}
          >
            ▶ {method === 'floyd' ? 'Floyd‑Warshall' : 'Dijkstra'}
          </button>
          <button
            className={`btn btn-secondary ${stepMode ? 'active' : ''}`}
            onClick={() => setStepMode(!stepMode)}
            disabled={!startNodeId || nodes.length === 0 || method === 'floyd'}
          >
            {stepMode ? '⏹ Normal' : '⏭ Paso a paso'}
          </button>
          {stepMode && (
            <button
              className="btn btn-accent"
              onClick={onNextStep}
              disabled={!canStep || isStepping}
            >
              ⏩ Siguiente
            </button>
          )}
        </div>
        <button
          className="btn btn-secondary"
          onClick={onCompare}
          disabled={!startNodeId || nodes.length === 0}
          style={{ width: '100%', marginTop: 4 }}
        >
          ⚖ Comparar ambos
        </button>
      </div>

      <div className="toolbar-section">
        <span className="toolbar-label">Grafo predefinido</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            className="node-select"
            style={{ flex: 1 }}
            value={selectedPreset}
            onChange={e => onGenerateExample(Number(e.target.value))}
          >
            {GRAPH_PRESETS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>
        <div className="run-buttons">
          <button className="btn btn-secondary" onClick={() => onGenerateExample()}>
            📐 Generar grafo
          </button>
          {nodes.length > 0 && (
            <button
              className={`btn btn-secondary ${showMatrix ? 'active' : ''}`}
              onClick={() => setShowMatrix(!showMatrix)}
            >
              {showMatrix ? '⊡ Ocultar matriz' : '⊡ Ver matriz'}
            </button>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <button className="btn btn-danger-outline" onClick={onClear}>
          🗑 Limpiar todo
        </button>
      </div>

      {dijkstraResult && startNodeId && (
        <div className="toolbar-section summary-bar">
          <span className="toolbar-label">Resultado desde nodo {nodes.find(n => n.id === startNodeId)?.label}</span>
        </div>
      )}
    </div>
  );
}
