import { useState, useCallback, useRef, useEffect } from 'react';
import type { GraphNode, GraphEdge, ToolMode, DijkstraResult, DijkstraStep, AlgorithmMethod, FloydWarshallResult } from './types/graph';
import { dijkstra, dijkstraStepByStep } from './algorithm/dijkstra';
import { floydWarshall, getFloydPath } from './algorithm/floydWarshall';
import { findAllSimplePaths } from './algorithm/paths';
import type { SimplePath } from './algorithm/paths';
import GraphCanvas from './components/GraphCanvas';
import Toolbar from './components/Toolbar';
import WeightDialog from './components/WeightDialog';
import ResultsPanel from './components/ResultsPanel';
import AdjacencyMatrix from './components/AdjacencyMatrix';
import './App.css';

let nodeCounter = 0;

const GRAPH_PRESETS: { name: string; nodes: GraphNode[]; edges: GraphEdge[]; startId: string }[] = [
  {
    name: 'Guía original (7 nodos)',
    nodes: [
      { id: '1', label: '1', x: 350, y: 50 },
      { id: '2', label: '2', x: 180, y: 150 },
      { id: '3', label: '3', x: 520, y: 150 },
      { id: '4', label: '4', x: 350, y: 250 },
      { id: '5', label: '5', x: 180, y: 350 },
      { id: '6', label: '6', x: 520, y: 350 },
      { id: '7', label: '7', x: 350, y: 450 },
    ],
    edges: [
      { from: '1', to: '2', weight: 10 },
      { from: '1', to: '3', weight: 18 },
      { from: '2', to: '3', weight: 6 },
      { from: '2', to: '5', weight: 3 },
      { from: '3', to: '4', weight: 3 },
      { from: '3', to: '6', weight: 20 },
      { from: '4', to: '3', weight: 2 },
      { from: '4', to: '7', weight: 2 },
      { from: '5', to: '4', weight: 8 },
      { from: '5', to: '7', weight: 10 },
      { from: '7', to: '6', weight: 5 },
    ],
    startId: '1',
  },
  {
    name: 'Árbol (6 nodos)',
    nodes: [
      { id: '1', label: '1', x: 350, y: 30 },
      { id: '2', label: '2', x: 200, y: 160 },
      { id: '3', label: '3', x: 500, y: 160 },
      { id: '4', label: '4', x: 100, y: 300 },
      { id: '5', label: '5', x: 300, y: 300 },
      { id: '6', label: '6', x: 500, y: 300 },
    ],
    edges: [
      { from: '1', to: '2', weight: 4 },
      { from: '1', to: '3', weight: 7 },
      { from: '2', to: '4', weight: 3 },
      { from: '2', to: '5', weight: 8 },
      { from: '3', to: '6', weight: 2 },
    ],
    startId: '1',
  },
  {
    name: 'Completo (4 nodos)',
    nodes: [
      { id: '1', label: 'A', x: 350, y: 80 },
      { id: '2', label: 'B', x: 200, y: 300 },
      { id: '3', label: 'C', x: 350, y: 440 },
      { id: '4', label: 'D', x: 500, y: 300 },
    ],
    edges: [
      { from: '1', to: '2', weight: 5 },
      { from: '1', to: '3', weight: 9 },
      { from: '1', to: '4', weight: 2 },
      { from: '2', to: '3', weight: 3 },
      { from: '2', to: '4', weight: 6 },
      { from: '3', to: '4', weight: 1 },
    ],
    startId: '1',
  },
  {
    name: 'Red extendida (5 nodos)',
    nodes: [
      { id: '1', label: '1', x: 350, y: 30 },
      { id: '2', label: '2', x: 550, y: 160 },
      { id: '3', label: '3', x: 450, y: 340 },
      { id: '4', label: '4', x: 200, y: 340 },
      { id: '5', label: '5', x: 150, y: 160 },
    ],
    edges: [
      { from: '1', to: '2', weight: 3 },
      { from: '1', to: '5', weight: 8 },
      { from: '2', to: '3', weight: 4 },
      { from: '2', to: '4', weight: 7 },
      { from: '3', to: '4', weight: 2 },
      { from: '3', to: '1', weight: 5 },
      { from: '4', to: '5', weight: 6 },
      { from: '5', to: '3', weight: 1 },
    ],
    startId: '1',
  },
  {
    name: 'Dos componentes (6 nodos)',
    nodes: [
      { id: '1', label: 'A', x: 150, y: 120 },
      { id: '2', label: 'B', x: 80, y: 280 },
      { id: '3', label: 'C', x: 220, y: 280 },
      { id: '4', label: 'D', x: 480, y: 100 },
      { id: '5', label: 'E', x: 420, y: 280 },
      { id: '6', label: 'F', x: 560, y: 280 },
    ],
    edges: [
      { from: '1', to: '2', weight: 5 },
      { from: '2', to: '3', weight: 2 },
      { from: '3', to: '1', weight: 4 },
      { from: '4', to: '5', weight: 6 },
      { from: '5', to: '6', weight: 3 },
      { from: '6', to: '4', weight: 7 },
    ],
    startId: '1',
  },
  {
    name: 'Camino largo (8 nodos)',
    nodes: [
      { id: '1', label: '1', x: 50, y: 250 },
      { id: '2', label: '2', x: 160, y: 200 },
      { id: '3', label: '3', x: 270, y: 150 },
      { id: '4', label: '4', x: 380, y: 200 },
      { id: '5', label: '5', x: 490, y: 150 },
      { id: '6', label: '6', x: 600, y: 200 },
      { id: '7', label: '7', x: 710, y: 150 },
      { id: '8', label: '8', x: 820, y: 200 },
    ],
    edges: [
      { from: '1', to: '2', weight: 3 },
      { from: '2', to: '3', weight: 5 },
      { from: '3', to: '4', weight: 2 },
      { from: '4', to: '5', weight: 4 },
      { from: '5', to: '6', weight: 6 },
      { from: '6', to: '7', weight: 1 },
      { from: '7', to: '8', weight: 7 },
    ],
    startId: '1',
  },
  {
    name: 'Pesos altos (5 nodos)',
    nodes: [
      { id: '1', label: '1', x: 350, y: 30 },
      { id: '2', label: '2', x: 150, y: 200 },
      { id: '3', label: '3', x: 550, y: 200 },
      { id: '4', label: '4', x: 100, y: 400 },
      { id: '5', label: '5', x: 600, y: 400 },
    ],
    edges: [
      { from: '1', to: '2', weight: 50 },
      { from: '1', to: '3', weight: 100 },
      { from: '2', to: '3', weight: 30 },
      { from: '2', to: '4', weight: 200 },
      { from: '3', to: '5', weight: 40 },
      { from: '4', to: '5', weight: 10 },
    ],
    startId: '1',
  },
  {
    name: 'Pesos negativos (4 nodos)',
    nodes: [
      { id: '1', label: 'A', x: 80, y: 200 },
      { id: '2', label: 'B', x: 250, y: 100 },
      { id: '3', label: 'C', x: 250, y: 340 },
      { id: '4', label: 'D', x: 450, y: 220 },
    ],
    edges: [
      { from: '1', to: '2', weight: 4 },
      { from: '1', to: '3', weight: 2 },
      { from: '2', to: '3', weight: -3 },
      { from: '2', to: '4', weight: 2 },
      { from: '3', to: '4', weight: 1 },
    ],
    startId: '1',
  },
];

function createNode(x: number, y: number): GraphNode {
  nodeCounter++;
  return { id: String(nodeCounter), label: String(nodeCounter), x, y };
}

export default function App() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [mode, setMode] = useState<ToolMode>('node');
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [selectedEdgeSource, setSelectedEdgeSource] = useState<string | null>(null);
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [weightDialog, setWeightDialog] = useState<{
    open: boolean;
    fromId: string;
    toId: string;
    fromLabel: string;
    toLabel: string;
  }>({ open: false, fromId: '', toId: '', fromLabel: '', toLabel: '' });

  const [stepMode, setStepMode] = useState(false);
  const [stepState, setStepState] = useState<DijkstraStep | null>(null);
  const stepIteratorRef = useRef<Generator<DijkstraStep> | null>(null);
  const [isStepping, setIsStepping] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [method, setMethod] = useState<AlgorithmMethod>('dijkstra');
  const [floydResult, setFloydResult] = useState<FloydWarshallResult | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [destinationWarning, setDestinationWarning] = useState<string | null>(null);
  const [destinationPaths, setDestinationPaths] = useState<SimplePath[] | null>(null);
  const warnTimeoutRef = useRef<number>(0);
  const [comparison, setComparison] = useState<{
    dijkstraResult: DijkstraResult;
    floydResult: FloydWarshallResult;
    startNodeId: string;
  } | null>(null);

  const floydComputedRef = useRef(false);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const getNodeLabel = useCallback((id: string) => {
    return nodes.find(n => n.id === id)?.label ?? id;
  }, [nodes]);

  const addNode = useCallback((x: number, y: number) => {
    const newNode = createNode(x, y);
    setNodes(prev => [...prev, newNode]);
    setDijkstraResult(null);
    setFloydResult(null);
    setStepState(null);
    stepIteratorRef.current = null;
  }, []);

  const requestEdge = useCallback((fromId: string) => {
    if (selectedEdgeSource === fromId) {
      setSelectedEdgeSource(null);
    } else {
      setSelectedEdgeSource(fromId);
    }
  }, [selectedEdgeSource]);

  const completeEdge = useCallback((toId: string) => {
    if (!selectedEdgeSource || selectedEdgeSource === toId) {
      setSelectedEdgeSource(null);
      return;
    }

    const exists = edges.some(e => e.from === selectedEdgeSource && e.to === toId);
    if (exists) {
      setSelectedEdgeSource(null);
      return;
    }

    setWeightDialog({
      open: true,
      fromId: selectedEdgeSource,
      toId,
      fromLabel: getNodeLabel(selectedEdgeSource),
      toLabel: getNodeLabel(toId),
    });
    setSelectedEdgeSource(null);
  }, [selectedEdgeSource, edges, getNodeLabel]);

  const confirmWeight = useCallback((weight: number) => {
    const { fromId, toId } = weightDialog;
    setEdges(prev => [...prev, { from: fromId, to: toId, weight }]);
    setWeightDialog(prev => ({ ...prev, open: false }));
    setDijkstraResult(null);
    setFloydResult(null);
    setStepState(null);
    stepIteratorRef.current = null;
  }, [weightDialog]);

  const cancelWeight = useCallback(() => {
    setWeightDialog(prev => ({ ...prev, open: false }));
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (startNodeId === id) setStartNodeId(null);
    if (destinationId === id) setDestinationId(null);
    setDijkstraResult(null);
    setFloydResult(null);
    setStepState(null);
    stepIteratorRef.current = null;
  }, [startNodeId]);

  const deleteEdge = useCallback((from: string, to: string) => {
    setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
    setDijkstraResult(null);
    setFloydResult(null);
    setStepState(null);
    stepIteratorRef.current = null;
  }, []);

  const generateExample = useCallback((presetIdx?: number) => {
    const idx = presetIdx ?? selectedPreset;
    const preset = GRAPH_PRESETS[idx];
    if (!preset) return;
    nodeCounter = preset.nodes.reduce((max, n) => Math.max(max, parseInt(n.id, 10) || 0), 0);
    setNodes([...preset.nodes]);
    setEdges([...preset.edges]);
    setStartNodeId(preset.startId);
    setSelectedPreset(idx);
    setDijkstraResult(null);
    setFloydResult(null);
    setStepState(null);
    stepIteratorRef.current = null;
    floydComputedRef.current = false;
    setMode('select');
    setShowMatrix(true);
    setDestinationId(null);
    setDestinationWarning(null);
    setDestinationPaths(null);
    setComparison(null);
  }, [selectedPreset]);

  const runDijkstra = useCallback(() => {
    if (nodes.length === 0) return;
    if (method !== 'floyd' && !startNodeId) return;

    if (method === 'floyd') {
      const effectiveStart = startNodeId || nodes[0].id;
      const fw = floydWarshall(nodes, edges);
      setFloydResult(fw);
      const distances = fw.distances[effectiveStart] ?? {};
      const paths: Record<string, string[]> = {};
      for (const id of nodes.map(n => n.id)) {
        const p = getFloydPath(fw.next, effectiveStart, id);
        paths[id] = p.length > 0 ? p : [effectiveStart, id];
      }
      const dijkResult: DijkstraResult = { distances, paths };
      setDijkstraResult(dijkResult);
      if (!startNodeId) setStartNodeId(effectiveStart);
      setStepState(null);
      stepIteratorRef.current = null;
      floydComputedRef.current = true;

      if (destinationId) {
        const d = dijkResult.distances[destinationId];
        if (d === undefined || d === Infinity) {
          const msg = `No hay camino de ${getNodeLabel(effectiveStart)} a ${getNodeLabel(destinationId)}`;
          setDestinationWarning(msg);
          clearTimeout(warnTimeoutRef.current);
          warnTimeoutRef.current = window.setTimeout(() => setDestinationWarning(null), 4000);
          setDestinationPaths(null);
        } else {
          const p = getFloydPath(fw.next, effectiveStart, destinationId);
          setDestinationPaths(p.length > 0 ? [{ path: p, totalWeight: d }] : []);
          setDestinationWarning(null);
        }
      } else {
        setDestinationPaths(null);
      }
      return;
    }

    if (stepMode) {
      const iterator = dijkstraStepByStep(nodes, edges, startNodeId!);
      stepIteratorRef.current = iterator;
      setIsStepping(true);
      const first = iterator.next();
      if (!first.done) {
        setStepState(first.value);
      }
      setIsStepping(false);
      setDijkstraResult(null);
      setFloydResult(null);
    } else {
      const result = dijkstra(nodes, edges, startNodeId!);
      setDijkstraResult(result);
      setFloydResult(null);
      setStepState(null);
      stepIteratorRef.current = null;

      if (destinationId) {
        if (result.distances[destinationId] === Infinity) {
          const msg = `No hay camino de ${getNodeLabel(startNodeId!)} a ${getNodeLabel(destinationId)}`;
          setDestinationWarning(msg);
          clearTimeout(warnTimeoutRef.current);
          warnTimeoutRef.current = window.setTimeout(() => setDestinationWarning(null), 4000);
          setDestinationPaths(null);
        } else {
          setDestinationPaths(findAllSimplePaths(nodes, edges, startNodeId!, destinationId));
          setDestinationWarning(null);
        }
      } else {
        setDestinationPaths(null);
      }
    }
  }, [startNodeId, nodes, edges, stepMode, destinationId, getNodeLabel, method]);

  const nextStep = useCallback(() => {
    if (!stepIteratorRef.current) return;
    setIsStepping(true);
    const next = stepIteratorRef.current.next();
    if (next.done) {
      stepIteratorRef.current = null;
      setIsStepping(false);
      if (startNodeId) {
        const result = dijkstra(nodes, edges, startNodeId);
        setDijkstraResult(result);
      }
      return;
    }
    setStepState(next.value);
    setIsStepping(false);
  }, [startNodeId, nodes, edges]);

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setStartNodeId(null);
    setDijkstraResult(null);
    setFloydResult(null);
    setSelectedEdgeSource(null);
    setStepState(null);
    stepIteratorRef.current = null;
    floydComputedRef.current = false;
    nodeCounter = 0;
    setShowMatrix(false);
    setDestinationId(null);
    setDestinationWarning(null);
    setDestinationPaths(null);
    setComparison(null);
  }, []);

  // Re-filter Floyd results when startNodeId changes (no recalculation)
  useEffect(() => {
    if (method !== 'floyd' || !floydResult || !startNodeId || nodes.length === 0) return;
    if (!floydComputedRef.current) return;
    const distances = floydResult.distances[startNodeId] ?? {};
    const paths: Record<string, string[]> = {};
    for (const id of nodes.map(n => n.id)) {
      const p = getFloydPath(floydResult.next, startNodeId, id);
      paths[id] = p.length > 0 ? p : [startNodeId, id];
    }
    setDijkstraResult({ distances, paths });

    if (destinationId) {
      const d = distances[destinationId];
      if (d === undefined || d === Infinity) {
        setDestinationPaths(null);
      } else {
        const p = getFloydPath(floydResult.next, startNodeId, destinationId);
        setDestinationPaths(p.length > 0 ? [{ path: p, totalWeight: d }] : []);
        setDestinationWarning(null);
      }
    }
  }, [method, floydResult, startNodeId, nodes, destinationId]);

  const onCompare = useCallback(() => {
    if (!startNodeId || nodes.length === 0) return;
    const dijk = dijkstra(nodes, edges, startNodeId);
    const fw = floydWarshall(nodes, edges);
    setFloydResult(fw);
    setComparison({ dijkstraResult: dijk, floydResult: fw, startNodeId });
    // Show Floyd results for this start node
    const distances = fw.distances[startNodeId] ?? {};
    const paths: Record<string, string[]> = {};
    for (const id of nodes.map(n => n.id)) {
      const p = getFloydPath(fw.next, startNodeId, id);
      paths[id] = p.length > 0 ? p : [startNodeId, id];
    }
    setDijkstraResult({ distances, paths });
    setMethod('floyd');
    setStepMode(false);
    stepIteratorRef.current = null;
    setStepState(null);
    floydComputedRef.current = true;
    if (destinationId) {
      const d = distances[destinationId];
      if (!d || d === Infinity) {
        setDestinationPaths(null);
      } else {
        const p = getFloydPath(fw.next, startNodeId, destinationId);
        setDestinationPaths(p.length > 0 ? [{ path: p, totalWeight: d }] : []);
        setDestinationWarning(null);
      }
    } else {
      setDestinationPaths(null);
    }
  }, [startNodeId, nodes, edges, destinationId, getNodeLabel]);

  const stepCanvasState = stepState ? {
    current: stepState.current,
    visited: stepState.visited,
    finished: stepState.finished,
  } : null;

  const canStep = stepIteratorRef.current !== null && !stepState?.finished;

  return (
    <div className="app" data-theme={darkMode ? 'dark' : 'light'}>
      <header className="app-header">
        <div className="header-left">
          <h1>Algoritmo de Dijkstra</h1>
          <p>Simulador interactivo de ruta más corta</p>
        </div>
        <button className="btn btn-theme" onClick={toggleTheme}>
          {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <Toolbar
            mode={mode}
            setMode={setMode}
            nodes={nodes}
            startNodeId={startNodeId}
            setStartNodeId={setStartNodeId}
            destinationId={destinationId}
            setDestinationId={setDestinationId}
            onRunDijkstra={runDijkstra}
            onClear={clearAll}
            onGenerateExample={generateExample}
            showMatrix={showMatrix}
            setShowMatrix={setShowMatrix}
            dijkstraResult={dijkstraResult}
            stepMode={stepMode}
            setStepMode={(v) => {
              setStepMode(v);
              if (!v) {
                stepIteratorRef.current = null;
                setStepState(null);
              }
            }}
            onNextStep={nextStep}
            canStep={canStep}
            isStepping={isStepping}
            selectedPreset={selectedPreset}
            method={method}
            onMethodChange={(m) => {
              setMethod(m);
              if (m === 'floyd') {
                setStepMode(false);
                stepIteratorRef.current = null;
                setStepState(null);
              }
            }}
            onCompare={onCompare}
          />

          {nodes.length === 0 && !showMatrix && (
            <div className="empty-hint">
              <span className="empty-hint-icon">1</span>
              <span>Modo <strong>Nodo</strong> → hacé clic en el canvas</span>
              <span className="empty-hint-icon">2</span>
              <span>Modo <strong>Arco</strong> → conectá nodos</span>
              <span className="empty-hint-icon">3</span>
              <span>Elegí <strong>nodo inicial</strong> → ejecutá Dijkstra</span>
              <span style={{ marginTop: 6, color: 'rgba(255,255,255,0.3)' }}>
                o usá <strong style={{color: '#ffb74d'}}>Generar grafo</strong>
              </span>
            </div>
          )}

          {stepState && !stepState.finished && (
            <div className="step-indicator">
              <div className="step-message">{stepState.message}</div>
              <div className="step-progress">
                <span>Visitados: {stepState.visited.size}/{nodes.length}</span>
              </div>
            </div>
          )}

          {stepMode && !stepState && nodes.length > 0 && startNodeId && (
            <div className="step-info">
              <strong>¿Cómo funciona?</strong>
              <ol>
                <li>Visitá el nodo no visitado con menor distancia acumulada</li>
                <li>Actualizá las distancias de sus vecinos</li>
                <li>Repetí hasta visitar todos los nodos</li>
              </ol>
              <p className="step-info-hint">Presioná <strong>▶ Dijkstra</strong> para empezar</p>
            </div>
          )}

          {showMatrix && <AdjacencyMatrix nodes={nodes} edges={edges} />}

          <ResultsPanel
            nodes={nodes}
            dijkstraResult={dijkstraResult}
            startNodeId={startNodeId}
            destinationId={destinationId}
            destinationPaths={destinationPaths}
            method={method}
            floydResult={floydResult}
            comparison={comparison}
          />
        </aside>

          {destinationWarning && (
            <div className="destination-overlay">
              <div className="destination-overlay-content">
                {destinationWarning}
              </div>
            </div>
          )}

          <WeightDialog
          open={weightDialog.open}
          fromLabel={weightDialog.fromLabel}
          toLabel={weightDialog.toLabel}
          onSubmit={confirmWeight}
          onCancel={cancelWeight}
        />

        <main className="canvas-container">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            mode={mode}
            startNodeId={startNodeId}
            dijkstraResult={dijkstraResult}
            selectedEdgeSource={selectedEdgeSource}
            destinationPaths={destinationPaths}
            stepState={stepCanvasState}
            onAddNode={addNode}
            onRequestEdge={requestEdge}
            onCompleteEdge={completeEdge}
            onMoveNode={moveNode}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
          />

          <div className="canvas-status">
            <span>{nodes.length} nodos</span>
            <span>{edges.length} arcos</span>
            {startNodeId && <span>Inicio: {getNodeLabel(startNodeId)}</span>}
            {stepState?.current && <span className="status-current">Actual: {getNodeLabel(stepState.current)}</span>}
          </div>
        </main>
      </div>
    </div>
  );
}
