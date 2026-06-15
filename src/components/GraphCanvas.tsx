import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import type { GraphNode, GraphEdge, ToolMode, DijkstraResult } from '../types/graph';
import type { SimplePath } from '../algorithm/paths';

const NODE_RADIUS = 24;
const ARROW_SIZE = 12;
const NODE_COLOR = { fill: '#5c6bc0', stroke: '#7986cb', glow: 'rgba(92,107,192,0.3)' };
const START_COLOR = { fill: '#43a047', stroke: '#66bb6a', glow: 'rgba(67,160,71,0.4)' };
const PATH_COLORS = ['#00e676', '#ffb74d', '#64b5f6', '#ce93d8', '#ef5350', '#4dd0e1', '#fff176'];

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mode: ToolMode;
  startNodeId: string | null;
  dijkstraResult: DijkstraResult | null;
  selectedEdgeSource: string | null;
  destinationPaths: SimplePath[] | null;
  stepState: {
    current: string | null;
    visited: Set<string>;
    finished: boolean;
  } | null;
  onAddNode: (x: number, y: number) => void;
  onRequestEdge: (id: string) => void;
  onCompleteEdge: (id: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (from: string, to: string) => void;
}

export default function GraphCanvas({
  nodes, edges, mode, startNodeId, dijkstraResult,
  selectedEdgeSource, destinationPaths, stepState,
  onAddNode, onRequestEdge, onCompleteEdge,
  onMoveNode, onDeleteNode, onDeleteEdge,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const centeredRef = useRef(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ from: string; to: string } | null>(null);
  const animRef = useRef<number>(0);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetStartRef = useRef({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      setTime(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  // Centering: solo centra la primera vez que hay nodos.
  // Después de eso, el offset se congela para que todos los presets
  // subsecuentes aparezcan en la misma posición.
  useLayoutEffect(() => {
    if (centeredRef.current && nodes.length > 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (W === 0 || H === 0) return;

    if (nodes.length === 0) {
      centeredRef.current = false;
      return;
    }

    centeredRef.current = true;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    offsetRef.current = {
      x: W / 2 - (minX + maxX) / 2,
      y: H / 2 - (minY + maxY) / 2,
    };
  }, [nodes, time]);

  // Main drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;

    ctx.clearRect(0, 0, W, H);

    drawGrid(ctx, W, H, time);

    if (nodes.length === 0) {
      drawHelpText(ctx, W, H, mode);
      return;
    }

    const pathNodeSet = new Set<string>();
    const edgeColorMap = new Map<string, string>();

    if (destinationPaths && destinationPaths.length > 0) {
      const sharedEdges = new Set<string>();
      for (let pi = 0; pi < destinationPaths.length; pi++) {
        const color = PATH_COLORS[pi % PATH_COLORS.length];
        const p = destinationPaths[pi];
        for (const nid of p.path) pathNodeSet.add(nid);
        for (let i = 1; i < p.path.length; i++) {
          const key = `${p.path[i - 1]}->${p.path[i]}`;
          if (edgeColorMap.has(key)) {
            sharedEdges.add(key);
          } else {
            edgeColorMap.set(key, color);
          }
        }
      }
      for (const key of sharedEdges) {
        edgeColorMap.set(key, '#ffffff');
      }
    } else if (dijkstraResult && startNodeId) {
      for (const [, path] of Object.entries(dijkstraResult.paths)) {
        if (path.length > 0) {
          for (const nid of path) pathNodeSet.add(nid);
          for (let i = 1; i < path.length; i++) {
            edgeColorMap.set(`${path[i - 1]}->${path[i]}`, '#00e676');
          }
        }
      }
    }

    ctx.save();
    ctx.translate(ox, oy);

    for (const edge of edges) {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) continue;
      const pathColor = edgeColorMap.get(`${edge.from}->${edge.to}`);
      const isHovered = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to;
      const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
      drawArrow(ctx, fromNode, toNode, edge.weight, !!pathColor, isHovered, time, hasReverse, pathColor);
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isStart = node.id === startNodeId;
      const isPath = pathNodeSet.has(node.id);
      const isHovered = hoveredNode === node.id;
      const isSelectedSource = selectedEdgeSource === node.id;
      const isCurrent = stepState?.current === node.id;
      const isVisited = stepState?.visited.has(node.id) ?? false;

      drawNode(ctx, node, {
        isStart, isPath, isHovered, isSelectedSource,
        isCurrent, isVisited, time,
      });
    }

    ctx.restore();

  }, [nodes, edges, mode, startNodeId, dijkstraResult, selectedEdgeSource, destinationPaths, hoveredNode, hoveredEdge, stepState, time]);

  const getMousePos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - offsetRef.current.x,
      y: e.clientY - rect.top - offsetRef.current.y,
    };
  }, []);

  const hitTestNode = useCallback((x: number, y: number): string | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const dx = x - nodes[i].x;
      const dy = y - nodes[i].y;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) return nodes[i].id;
    }
    return null;
  }, [nodes]);

  const hitTestEdge = useCallback((x: number, y: number): { from: string; to: string } | null => {
    for (const edge of edges) {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (!from || !to) continue;

      const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
      let fromX = from.x;
      let fromY = from.y;
      let toX = to.x;
      let toY = to.y;

      if (hasReverse) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const nx = dx / len;
          const ny = dy / len;
          const px = -ny;
          const py = nx;
          fromX += px * 10;
          fromY += py * 10;
          toX += px * 10;
          toY += py * 10;
        }
      }

      const dist = distToSegment(x, y, fromX, fromY, toX, toY);
      if (dist < 8) return { from: edge.from, to: edge.to };
    }
    return null;
  }, [edges, nodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const nodeId = hitTestNode(pos.x, pos.y);
    if (mode === 'select') {
      if (nodeId) {
        setDragNode(nodeId);
        isPanningRef.current = false;
      } else {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        panOffsetStartRef.current = { ...offsetRef.current };
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grabbing';
      }
    }
  }, [getMousePos, hitTestNode, mode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      offsetRef.current.x = panOffsetStartRef.current.x + dx;
      offsetRef.current.y = panOffsetStartRef.current.y + dy;
      return;
    }
    const pos = getMousePos(e);
    if (dragNode) {
      onMoveNode(dragNode, pos.x, pos.y);
      return;
    }
    const nodeId = hitTestNode(pos.x, pos.y);
    setHoveredNode(nodeId ?? null);
    if (!nodeId) {
      setHoveredEdge(hitTestEdge(pos.x, pos.y));
    } else {
      setHoveredEdge(null);
    }
  }, [getMousePos, hitTestNode, hitTestEdge, dragNode, onMoveNode]);

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = 'grab';
      return;
    }
    setDragNode(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const nodeId = hitTestNode(pos.x, pos.y);

    switch (mode) {
      case 'node':
        if (!nodeId) onAddNode(pos.x, pos.y);
        break;
      case 'edge':
        if (nodeId) {
          if (!selectedEdgeSource) onRequestEdge(nodeId);
          else onCompleteEdge(nodeId);
        }
        break;
      case 'delete':
        if (nodeId) onDeleteNode(nodeId);
        else {
          const edgeHit = hitTestEdge(pos.x, pos.y);
          if (edgeHit) onDeleteEdge(edgeHit.from, edgeHit.to);
        }
        break;
      case 'select':
        break;
    }
  }, [getMousePos, hitTestNode, hitTestEdge, mode, selectedEdgeSource,
      onAddNode, onRequestEdge, onCompleteEdge, onDeleteNode, onDeleteEdge]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: mode === 'node' ? 'crosshair' :
                mode === 'delete' ? 'not-allowed' :
                mode === 'edge' ? 'pointer' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    />
  );
}

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, _time: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  const spacing = 40;
  for (let x = 0; x < W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawNode(ctx: CanvasRenderingContext2D, node: GraphNode, opts: {
  isStart: boolean;
  isPath: boolean;
  isHovered: boolean;
  isSelectedSource: boolean;
  isCurrent: boolean;
  isVisited: boolean;
  time: number;
}) {
  const { x, y } = node;
  const r = NODE_RADIUS;
  const c = opts.isStart ? START_COLOR : NODE_COLOR;

  if (opts.isCurrent) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r + 16);
    g.addColorStop(0, 'rgba(255,215,0,0.35)');
    g.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r + 16, 0, Math.PI * 2);
    ctx.fill();
  }

  if (opts.isVisited && !opts.isCurrent) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r + 10);
    g.addColorStop(0, c.glow);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r + 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const grad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, r);
  if (opts.isPath) {
    grad.addColorStop(0, '#4dd0e1');
    grad.addColorStop(1, '#00897b');
  } else {
    grad.addColorStop(0, c.fill);
    grad.addColorStop(1, '#37474f');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  let strokeColor = c.stroke;
  let lineWidth = 2;
  if (opts.isCurrent) { strokeColor = '#ffd700'; lineWidth = 3; }
  else if (opts.isStart) { strokeColor = '#66bb6a'; lineWidth = 3; }
  else if (opts.isSelectedSource) { strokeColor = '#ffd700'; lineWidth = 2.5; }
  else if (opts.isHovered) { strokeColor = '#ffffff'; lineWidth = 2.5; }
  else if (opts.isPath) { strokeColor = '#4dd0e1'; lineWidth = 2.5; }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  if (opts.isStart) {
    ctx.strokeStyle = 'rgba(102,187,106,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(x, y, r + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('INICIO', x, y + r + 10);
  }

  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y);
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: GraphNode, to: GraphNode, weight: number,
  isPath: boolean, isHovered: boolean, _time: number,
  hasReverse: boolean,
  pathColor?: string
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;

  let shiftAmount = 0;
  if (hasReverse) {
    shiftAmount = 10;
  }

  const px = -ny;
  const py = nx;

  const startX = from.x + nx * NODE_RADIUS + px * shiftAmount;
  const startY = from.y + ny * NODE_RADIUS + py * shiftAmount;
  const endX = to.x - nx * NODE_RADIUS + px * shiftAmount;
  const endY = to.y - ny * NODE_RADIUS + py * shiftAmount;

  let color = '#3a3a5a';
  let lineWidth = 2;
  if (pathColor) { color = pathColor; lineWidth = 3.5; }
  else if (isHovered) { color = '#5a5afe'; lineWidth = 3; }
  else if (isPath) { color = '#00e676'; lineWidth = 3.5; }

  if (pathColor || isPath) {
    ctx.shadowColor = pathColor ?? 'rgba(0,230,118,0.4)';
    ctx.shadowBlur = 8;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const angle = Math.atan2(dy, dx);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - ARROW_SIZE * Math.cos(angle - Math.PI / 7),
    endY - ARROW_SIZE * Math.sin(angle - Math.PI / 7)
  );
  ctx.lineTo(
    endX - ARROW_SIZE * Math.cos(angle + Math.PI / 7),
    endY - ARROW_SIZE * Math.sin(angle + Math.PI / 7)
  );
  ctx.closePath();
  ctx.fill();

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const offX = -ny * 16;
  const offY = nx * 16;

  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  const text = String(weight);
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = 20;

  ctx.fillStyle = 'rgba(10,10,26,0.85)';
  ctx.beginPath();
  ctx.roundRect(midX + offX - tw / 2 - 6, midY + offY - th / 2 - 2, tw + 12, th + 4, 4);
  ctx.fill();

  ctx.fillStyle = isPath ? '#00e676' : '#aaa';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, midX + offX, midY + offY);
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

function drawHelpText(ctx: CanvasRenderingContext2D, W: number, H: number, mode: ToolMode) {
  const lines: string[] = [];
  if (mode === 'node') {
    lines.push('Hacé clic aquí para agregar nodos');
    lines.push('Usá los botones de la izquierda para cambiar herramienta');
  } else if (mode === 'edge') {
    lines.push('Hacé clic en un nodo origen, luego en el destino');
  } else if (mode === 'delete') {
    lines.push('Hacé clic en un nodo o arco para borrarlo');
  } else {
    lines.push('Primero agregá nodos con la herramienta Nodo');
  }

  const lineHeight = 28;
  const totalHeight = lines.length * lineHeight;
  const startY = H / 2 - totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)';
    ctx.font = i === 0 ? 'bold 16px Inter, sans-serif' : '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
  }
}
