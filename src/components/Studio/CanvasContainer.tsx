import React, { useEffect, useRef, useState } from 'react';
import { StudioTool, SpeechBubbleOptions, PlacedSpeechBubble, PlacedLine, PlacedSpiral, PlacedCircle, PlacedSquare, PlacedStamp, PageAspectRatio, CanvasTransform, BrushStyle, ActiveStencilState, StencilDef, GradientOptions, GridOptions } from '../../types/coloring';
import { renderBrushStroke, drawArchimedeanSpiral, drawCircleShape, drawSquareShape } from '../../services/brushEngine';
import { performFloodFill } from '../../services/floodFill';
import { getToolCursorStyle } from '../../services/cursors';
import { drawSpeechBubble, getSpeechBubbleBounds, isPointInBubble } from '../../services/speechBubble';
import { getCanvasDimensionsForRatio } from '../../services/imageProcessor';
import { buildPaperTransformCss, buildDrawingTransformCss, getTransformedCanvasPoint, calculateLineAngleAndEnd, distanceToSegment, isPointInSpiral, isPointInCircle, isPointInSquare } from '../../services/transformUtils';
import { setupStencilClipMask, strokeStencilOutline, getStencilById } from '../../services/stencilService';
import { transformSingleColor } from '../../services/colorTransformService';
import { drawStampShape, getStampById } from '../../services/stampService';
import { StencilOverlay } from './StencilOverlay';
import { Layers } from 'lucide-react';

interface CanvasContainerProps {
  lineArtDataUrl: string;
  initialColorDataUrl?: string;
  thumbnailDataUrl?: string;
  targetRatio?: PageAspectRatio;
  activeTool: StudioTool;
  activeColor: string;
  setActiveColor: (color: string) => void;
  brushSize: number;
  tolerance: number;
  onStateChange: (canUndo: boolean, canRedo: boolean) => void;
  colorCanvasRef: React.RefObject<HTMLCanvasElement>;
  lineCanvasRef?: React.RefObject<HTMLCanvasElement>;
  zoom: number;
  setZoom?: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  transform?: CanvasTransform;
  setTransform?: React.Dispatch<React.SetStateAction<CanvasTransform>>;
  showBrushPreview?: boolean;
  bubbleOptions?: SpeechBubbleOptions;
  setBubbleOptions?: React.Dispatch<React.SetStateAction<SpeechBubbleOptions>>;
  placedBubbles?: PlacedSpeechBubble[];
  setPlacedBubbles?: React.Dispatch<React.SetStateAction<PlacedSpeechBubble[]>>;
  selectedBubbleId?: string | null;
  setSelectedBubbleId?: (id: string | null) => void;
  placedLines?: PlacedLine[];
  setPlacedLines?: React.Dispatch<React.SetStateAction<PlacedLine[]>>;
  selectedLineId?: string | null;
  setSelectedLineId?: (id: string | null) => void;
  placedSpirals?: PlacedSpiral[];
  setPlacedSpirals?: React.Dispatch<React.SetStateAction<PlacedSpiral[]>>;
  selectedSpiralId?: string | null;
  setSelectedSpiralId?: (id: string | null) => void;
  placedCircles?: PlacedCircle[];
  setPlacedCircles?: React.Dispatch<React.SetStateAction<PlacedCircle[]>>;
  selectedCircleId?: string | null;
  setSelectedCircleId?: (id: string | null) => void;
  placedSquares?: PlacedSquare[];
  setPlacedSquares?: React.Dispatch<React.SetStateAction<PlacedSquare[]>>;
  selectedSquareId?: string | null;
  setSelectedSquareId?: (id: string | null) => void;
  placedStamps?: PlacedStamp[];
  setPlacedStamps?: React.Dispatch<React.SetStateAction<PlacedStamp[]>>;
  selectedStampId?: string | null;
  setSelectedStampId?: (id: string | null) => void;
  activeStampId?: string;
  setActiveTool?: (tool: StudioTool) => void;
  brushStyle?: BrushStyle;
  activeStencil?: ActiveStencilState | null;
  stencilDef?: StencilDef;
  gradientOptions?: GradientOptions;
  gridOptions?: GridOptions;
  setStencilState?: React.Dispatch<React.SetStateAction<ActiveStencilState | null>>;
  isDisabled?: boolean;
  isPickingColor?: boolean;
  setIsPickingColor?: (picking: boolean) => void;
  showShapeSelectPanel?: boolean;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  lineArtDataUrl,
  initialColorDataUrl,
  thumbnailDataUrl,
  targetRatio,
  activeTool,
  activeColor,
  setActiveColor,
  brushSize,
  tolerance,
  onStateChange,
  colorCanvasRef,
  lineCanvasRef: externalLineRef,
  zoom,
  setZoom,
  pan,
  setPan,
  transform,
  setTransform,
  showBrushPreview = true,
  bubbleOptions,
  setBubbleOptions,
  placedBubbles = [],
  setPlacedBubbles,
  selectedBubbleId = null,
  setSelectedBubbleId,
  placedLines = [],
  setPlacedLines,
  selectedLineId = null,
  setSelectedLineId,
  placedSpirals = [],
  setPlacedSpirals,
  selectedSpiralId = null,
  setSelectedSpiralId,
  placedCircles = [],
  setPlacedCircles,
  selectedCircleId = null,
  setSelectedCircleId,
  placedSquares = [],
  setPlacedSquares,
  selectedSquareId = null,
  setSelectedSquareId,
  placedStamps = [],
  setPlacedStamps,
  selectedStampId = null,
  setSelectedStampId,
  activeStampId = 'star',
  brushStyle = 'solid',
  activeStencil = null,
  stencilDef,
  gradientOptions,
  gridOptions,
  setStencilState,
  isDisabled = false,
  isPickingColor = false,
  setIsPickingColor,
  showShapeSelectPanel = true
}) => {
  const internalLineRef = useRef<HTMLCanvasElement>(null);
  const lineCanvasRef = externalLineRef || internalLineRef;
  const bubbleCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isDrawingSpiral, setIsDrawingSpiral] = useState(false);
  const [spiralCenter, setSpiralCenter] = useState<{ x: number; y: number } | null>(null);
  const [spiralRadius, setSpiralRadius] = useState<number>(0);

  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [circleCenter, setCircleCenter] = useState<{ x: number; y: number } | null>(null);
  const [circleRadius, setCircleRadius] = useState<number>(0);

  const [isDrawingSquare, setIsDrawingSquare] = useState(false);
  const [squareStart, setSquareStart] = useState<{ x: number; y: number } | null>(null);
  const [squareEnd, setSquareEnd] = useState<{ x: number; y: number } | null>(null);

  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [lineEnd, setLineEnd] = useState<{ x: number; y: number } | null>(null);
  const [lineAngle, setLineAngle] = useState<number>(0);
  const [lineLength, setLineLength] = useState<number>(0);

  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const [dragLineHandle, setDragLineHandle] = useState<'body' | 'start' | 'end' | null>(null);
  const [dragLineOffset, setDragLineOffset] = useState({ x: 0, y: 0 });

  const [isDraggingSpiral, setIsDraggingSpiral] = useState(false);
  const [dragSpiralHandle, setDragSpiralHandle] = useState<'center' | 'radius' | null>(null);
  const [dragSpiralOffset, setDragSpiralOffset] = useState({ x: 0, y: 0 });

  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [dragCircleHandle, setDragCircleHandle] = useState<'center' | 'radius' | null>(null);
  const [dragCircleOffset, setDragCircleOffset] = useState({ x: 0, y: 0 });

  const [isDraggingSquare, setIsDraggingSquare] = useState(false);
  const [dragSquareHandle, setDragSquareHandle] = useState<'body' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [dragSquareOffset, setDragSquareOffset] = useState({ x: 0, y: 0 });

  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [dragStampHandle, setDragStampHandle] = useState<'center' | 'radius' | null>(null);
  const [dragStampOffset, setDragStampOffset] = useState({ x: 0, y: 0 });

  const [dragBubbleHandle, setDragBubbleHandle] = useState<'body' | 'tail' | null>(null);

  function findBubbleHit(bubbles: PlacedSpeechBubble[], x: number, y: number, ctx: CanvasRenderingContext2D | null): { bubble: PlacedSpeechBubble; handle: 'body' | 'tail' } | null {
    if (!ctx) return null;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (b.isHidden || b.isLocked) continue;
      const bounds = getSpeechBubbleBounds(ctx, b.x, b.y, b.options);
      const tx = b.tailX !== undefined ? b.tailX : (b.options.tailX !== undefined ? b.options.tailX : b.x - 25);
      const ty = b.tailY !== undefined ? b.tailY : (b.options.tailY !== undefined ? b.options.tailY : b.y + bounds.height / 2 + 25);

      if (Math.hypot(x - tx, y - ty) <= 18) {
        return { bubble: b, handle: 'tail' };
      }
      if (isPointInBubble(ctx, x, y, b.x, b.y, b.options)) {
        return { bubble: b, handle: 'body' };
      }
    }
    return null;
  }

  function findStampHit(stamps: PlacedStamp[], x: number, y: number): { stamp: PlacedStamp; handle: 'center' | 'radius' } | null {
    for (let i = stamps.length - 1; i >= 0; i--) {
      const st = stamps[i];
      if (st.isHidden || st.isLocked) continue;
      const half = st.size / 2;
      const hitRadius = 24;
      if (
        Math.hypot(x - (st.cx + half), y - (st.cy + half)) <= hitRadius ||
        Math.hypot(x - (st.cx - half), y - (st.cy - half)) <= hitRadius ||
        Math.hypot(x - (st.cx + half), y - (st.cy - half)) <= hitRadius ||
        Math.hypot(x - (st.cx - half), y - (st.cy + half)) <= hitRadius
      ) {
        return { stamp: st, handle: 'radius' };
      }
      if (Math.hypot(x - st.cx, y - st.cy) <= Math.max(20, half + 6)) return { stamp: st, handle: 'center' };
    }
    return null;
  }

  function findLineHit(lines: PlacedLine[], x: number, y: number): { line: PlacedLine; handle: 'body' | 'start' | 'end' } | null {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.isHidden || line.isLocked) continue;
      if (Math.hypot(x - line.x1, y - line.y1) <= 16) return { line, handle: 'start' };
      if (Math.hypot(x - line.x2, y - line.y2) <= 16) return { line, handle: 'end' };
      const dist = distanceToSegment(x, y, line.x1, line.y1, line.x2, line.y2);
      if (dist <= Math.max(14, line.size / 2 + 6)) return { line, handle: 'body' };
    }
    return null;
  }

  function findSpiralHit(spirals: PlacedSpiral[], x: number, y: number): { spiral: PlacedSpiral; handle: 'center' | 'radius' } | null {
    for (let i = spirals.length - 1; i >= 0; i--) {
      const s = spirals[i];
      if (s.isHidden || s.isLocked) continue;
      if (Math.hypot(x - (s.cx + s.radius), y - s.cy) <= 16) return { spiral: s, handle: 'radius' };
      if (isPointInSpiral(x, y, s.cx, s.cy, s.radius)) return { spiral: s, handle: 'center' };
    }
    return null;
  }

  function findCircleHit(circles: PlacedCircle[], x: number, y: number): { circle: PlacedCircle; handle: 'center' | 'radius' } | null {
    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      if (c.isHidden || c.isLocked) continue;
      if (Math.hypot(x - (c.cx + c.radius), y - c.cy) <= 16) return { circle: c, handle: 'radius' };
      if (isPointInCircle(x, y, c.cx, c.cy, c.radius)) return { circle: c, handle: 'center' };
    }
    return null;
  }

  function findSquareHit(squares: PlacedSquare[], x: number, y: number): { square: PlacedSquare; handle: 'body' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' } | null {
    for (let i = squares.length - 1; i >= 0; i--) {
      const sq = squares[i];
      if (sq.isHidden || sq.isLocked) continue;
      const { x: sx, y: sy, width: sw, height: sh } = sq;
      if (Math.hypot(x - sx, y - sy) <= 16) return { square: sq, handle: 'top-left' };
      if (Math.hypot(x - (sx + sw), y - sy) <= 16) return { square: sq, handle: 'top-right' };
      if (Math.hypot(x - sx, y - (sy + sh)) <= 16) return { square: sq, handle: 'bottom-left' };
      if (Math.hypot(x - (sx + sw), y - (sy + sh)) <= 16) return { square: sq, handle: 'bottom-right' };
      if (isPointInSquare(x, y, sx, sy, sw, sh)) return { square: sq, handle: 'body' };
    }
    return null;
  }

  function makeWhiteTransparent(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let modified = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0 && data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
        data[i + 3] = 0;
        modified = true;
      }
    }
    if (modified) {
      ctx.putImageData(imgData, 0, 0);
    }
  }

  // Undo/Redo Stacks
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const colorSnapshotRef = useRef<ImageData | null>(null);

  // Sync back canvas, bubble canvas & grid canvas dimensions with color canvas
  useEffect(() => {
    const colorCanvas = colorCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    const bubbleCanvas = bubbleCanvasRef.current;
    const gridCanvas = gridCanvasRef.current;
    if (!colorCanvas) return;

    if (backCanvas && (backCanvas.width !== colorCanvas.width || backCanvas.height !== colorCanvas.height)) {
      backCanvas.width = colorCanvas.width;
      backCanvas.height = colorCanvas.height;
    }
    if (bubbleCanvas && (bubbleCanvas.width !== colorCanvas.width || bubbleCanvas.height !== colorCanvas.height)) {
      bubbleCanvas.width = colorCanvas.width;
      bubbleCanvas.height = colorCanvas.height;
    }
    if (gridCanvas && (gridCanvas.width !== colorCanvas.width || gridCanvas.height !== colorCanvas.height)) {
      gridCanvas.width = colorCanvas.width;
      gridCanvas.height = colorCanvas.height;
    }
  }, [colorCanvasRef.current?.width, colorCanvasRef.current?.height]);

  // Render Grid Overlay (Line Grid / Dot Grid)
  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!gridCanvas || !colorCanvas) return;

    if (gridCanvas.width !== colorCanvas.width || gridCanvas.height !== colorCanvas.height) {
      gridCanvas.width = colorCanvas.width;
      gridCanvas.height = colorCanvas.height;
    }

    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!gridOptions || gridOptions.type === 'none') return;

    const { type, size, opacity, color, offsetX = 0, offsetY = 0 } = gridOptions;
    const width = gridCanvas.width;
    const height = gridCanvas.height;

    // Calculate starting offsets clamped to 0..size interval
    const startX = Math.max(0, Math.min(size, offsetX));
    const startY = Math.max(0, Math.min(size, offsetY));

    ctx.save();
    ctx.globalAlpha = opacity;

    if (type === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Vertical lines
      for (let x = startX; x <= width; x += size) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      // Horizontal lines
      for (let y = startY; y <= height; y += size) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
    } else if (type === 'dot') {
      ctx.fillStyle = color;
      const dotRadius = Math.max(1.2, Math.min(3, size / 20));
      for (let x = startX; x <= width; x += size) {
        for (let y = startY; y <= height; y += size) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, [gridOptions, colorCanvasRef.current?.width, colorCanvasRef.current?.height]);

  const drawVectorShapes = (ctx: CanvasRenderingContext2D, targetBehind: boolean) => {
    for (const b of placedBubbles) {
      if (!b.isHidden && Boolean(b.isBehindPaint) === targetBehind) {
        ctx.save();
        if (b.opacity !== undefined) ctx.globalAlpha = b.opacity;
        drawSpeechBubble(ctx, b.x, b.y, b.options, b.tailX !== undefined ? b.tailX : b.options.tailX, b.tailY !== undefined ? b.tailY : b.options.tailY);
        ctx.restore();
      }
    }
    for (const line of placedLines) {
      if (!line.isHidden && Boolean(line.isBehindPaint) === targetBehind) {
        ctx.save();
        if (line.opacity !== undefined) ctx.globalAlpha = line.opacity;
        renderBrushStroke(ctx, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }, line.color, line.size, line.style);
        ctx.restore();
      }
    }
    for (const s of placedSpirals) {
      if (!s.isHidden && Boolean(s.isBehindPaint) === targetBehind) {
        ctx.save();
        if (s.opacity !== undefined) ctx.globalAlpha = s.opacity;
        drawArchimedeanSpiral(ctx, s.cx, s.cy, s.radius, s.turns ?? 3, s.color, s.size, s.style);
        ctx.restore();
      }
    }
    for (const c of placedCircles) {
      if (!c.isHidden && Boolean(c.isBehindPaint) === targetBehind) {
        ctx.save();
        if (c.opacity !== undefined) ctx.globalAlpha = c.opacity;
        drawCircleShape(ctx, c.cx, c.cy, c.radius, c.color, c.size, c.style, c.fillColor);
        ctx.restore();
      }
    }
    for (const sq of placedSquares) {
      if (!sq.isHidden && Boolean(sq.isBehindPaint) === targetBehind) {
        ctx.save();
        if (sq.opacity !== undefined) ctx.globalAlpha = sq.opacity;
        drawSquareShape(ctx, sq.x, sq.y, sq.width, sq.height, sq.color, sq.size, sq.style, sq.fillColor);
        ctx.restore();
      }
    }
    for (const st of placedStamps) {
      if (!st.isHidden && Boolean(st.isBehindPaint) === targetBehind) {
        const def = getStampById(st.stampId);
        if (def) {
          ctx.save();
          if (st.opacity !== undefined) ctx.globalAlpha = st.opacity;
          drawStampShape(ctx, def, st.cx, st.cy, st.size, st.rotation ?? 0, st.color, st.fillColor);
          ctx.restore();
        }
      }
    }
  };

  const drawBubbleSelection = (ctx: CanvasRenderingContext2D) => {
    if (!selectedBubbleId || (activeTool !== 'select' && activeTool !== 'bubble')) return;
    const selected = placedBubbles.find(b => b.id === selectedBubbleId);
    if (!selected) return;

    const bounds = getSpeechBubbleBounds(ctx, selected.x, selected.y, selected.options);
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    const pad = 6;
    ctx.strokeRect(bounds.bx - pad, bounds.by - pad, bounds.width + pad * 2, bounds.height + pad * 2);

    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    const handles = [
      { x: bounds.bx - pad, y: bounds.by - pad },
      { x: bounds.bx + bounds.width + pad, y: bounds.by - pad },
      { x: bounds.bx - pad, y: bounds.by + bounds.height + pad },
      { x: bounds.bx + bounds.width + pad, y: bounds.by + bounds.height + pad }
    ];
    for (const h of handles) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  const renderPlacedShapes = () => {
    const colorCanvas = colorCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (backCanvas && colorCanvas) {
      if (backCanvas.width !== colorCanvas.width || backCanvas.height !== colorCanvas.height) {
        backCanvas.width = colorCanvas.width;
        backCanvas.height = colorCanvas.height;
      }
      const bCtx = backCanvas.getContext('2d');
      if (bCtx) {
        bCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
        drawVectorShapes(bCtx, true);
      }
    }

    const bubbleCanvas = bubbleCanvasRef.current;
    if (bubbleCanvas && colorCanvas) {
      if (bubbleCanvas.width !== colorCanvas.width || bubbleCanvas.height !== colorCanvas.height) {
        bubbleCanvas.width = colorCanvas.width;
        bubbleCanvas.height = colorCanvas.height;
      }
      const ctx = bubbleCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
        drawVectorShapes(ctx, false);
        drawBubbleSelection(ctx);
      }
    }
  };

  // Render placed bubbles and selection box on bubbleCanvas
  useEffect(() => {
    renderPlacedShapes();
  }, [placedBubbles, placedLines, placedSpirals, placedCircles, placedSquares, placedStamps, selectedBubbleId, selectedStampId, activeTool]);

  // Handle live single color spatial transformation and recoloring
  useEffect(() => {
    if (activeTool !== 'transform' || transform?.targetMode !== 'color') {
      if (colorSnapshotRef.current) {
        saveState();
        colorSnapshotRef.current = null;
      }
      return;
    }

    const canvas = colorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!colorSnapshotRef.current) {
      colorSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    const snapshot = colorSnapshotRef.current;
    if (!snapshot) return;

    const transformedImgData = transformSingleColor(snapshot, canvas.width, canvas.height, {
      targetColor: transform.targetColor || activeColor,
      replacementColor: transform.replacementColor,
      colorTolerance: transform.colorTolerance ?? 20,
      scale: transform.scale ?? 1,
      rotation: transform.rotation ?? 0,
      flipH: transform.flipH ?? false,
      flipV: transform.flipV ?? false,
      offsetX: transform.offsetX ?? 0,
      offsetY: transform.offsetY ?? 0
    });

    ctx.putImageData(transformedImgData, 0, 0);
  }, [
    activeTool,
    transform?.targetMode,
    transform?.targetColor,
    transform?.replacementColor,
    transform?.colorTolerance,
    transform?.scale,
    transform?.rotation,
    transform?.flipH,
    transform?.flipV,
    transform?.offsetX,
    transform?.offsetY
  ]);

  // Load line art image onto line canvas
  useEffect(() => {
    const lineCanvas = lineCanvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!lineCanvas || !colorCanvas) return;

    const renderLineArt = (img: HTMLImageElement) => {
      let w: number;
      let h: number;

      if (targetRatio) {
        const dims = getCanvasDimensionsForRatio(targetRatio, img.naturalWidth, img.naturalHeight);
        w = dims.width;
        h = dims.height;
      } else {
        w = img.naturalWidth || img.width || 800;
        h = img.naturalHeight || img.height || 800;
        if (w > 1200 || h > 1200) {
          const scale = 1200 / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
      }

      lineCanvas.width = w;
      lineCanvas.height = h;
      colorCanvas.width = w;
      colorCanvas.height = h;

      const backCanvas = backCanvasRef.current;
      if (backCanvas) {
        backCanvas.width = w;
        backCanvas.height = h;
      }
      const bubbleCanvas = bubbleCanvasRef.current;
      if (bubbleCanvas) {
        bubbleCanvas.width = w;
        bubbleCanvas.height = h;
      }
      renderPlacedShapes();

      const lCtx = lineCanvas.getContext('2d');
      const cCtx = colorCanvas.getContext('2d');
      if (!lCtx || !cCtx) return;

      lCtx.clearRect(0, 0, w, h);
      lCtx.drawImage(img, 0, 0, w, h);

      // Initialize color canvas transparent so back shapes show through unpainted areas
      cCtx.clearRect(0, 0, w, h);

      const hasVectorShapes = (placedLines && placedLines.length > 0) ||
                              (placedCircles && placedCircles.length > 0) ||
                              (placedSquares && placedSquares.length > 0) ||
                              (placedSpirals && placedSpirals.length > 0) ||
                              (placedBubbles && placedBubbles.length > 0);

      const colorSource = hasVectorShapes ? initialColorDataUrl : (initialColorDataUrl || thumbnailDataUrl);

      if (colorSource) {
        const colorImg = new Image();
        colorImg.crossOrigin = 'anonymous';
        colorImg.onload = () => {
          cCtx.drawImage(colorImg, 0, 0, w, h);
          makeWhiteTransparent(cCtx, w, h);
          renderPlacedShapes();
          saveState();
        };
        colorImg.onerror = () => {
          const fallbackColorImg = new Image();
          fallbackColorImg.onload = () => {
            cCtx.drawImage(fallbackColorImg, 0, 0, w, h);
            makeWhiteTransparent(cCtx, w, h);
            renderPlacedShapes();
            saveState();
          };
          fallbackColorImg.src = colorSource;
        };
        colorImg.src = colorSource;
      } else {
        renderPlacedShapes();
        saveState();
      }
    };

    const img = new Image();
    if (lineArtDataUrl.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => renderLineArt(img);
    img.onerror = () => {
      // Retry loading without crossOrigin restriction if CORS header is missing
      const fallbackImg = new Image();
      fallbackImg.onload = () => renderLineArt(fallbackImg);
      fallbackImg.src = lineArtDataUrl;
    };
    img.src = lineArtDataUrl;
  }, [lineArtDataUrl, initialColorDataUrl, thumbnailDataUrl, targetRatio]);

  // Save state snapshot for undo
  const saveState = () => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;
    const ctx = colorCanvas.getContext('2d');
    if (!ctx) return;

    if (undoStack.current.length > 20) undoStack.current.shift();
    undoStack.current.push(ctx.getImageData(0, 0, colorCanvas.width, colorCanvas.height));
    redoStack.current = [];
    onStateChange(undoStack.current.length > 1, false);
  };

  // Handle undo/redo triggers from window event or prop
  useEffect(() => {
    const handleTrigger = (e: CustomEvent) => {
      const colorCanvas = colorCanvasRef.current;
      const ctx = colorCanvas?.getContext('2d');
      if (!ctx || !colorCanvas) return;

      if (e.detail === 'undo' && undoStack.current.length > 1) {
        const current = undoStack.current.pop()!;
        redoStack.current.push(current);
        const prev = undoStack.current[undoStack.current.length - 1];
        ctx.putImageData(prev, 0, 0);
      } else if (e.detail === 'redo' && redoStack.current.length > 0) {
        const next = redoStack.current.pop()!;
        undoStack.current.push(next);
        ctx.putImageData(next, 0, 0);
      } else if (e.detail === 'clear') {
        ctx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
        saveState();
        return;
      }
      onStateChange(undoStack.current.length > 1, redoStack.current.length > 0);
    };

    window.addEventListener('canvas-history' as any, handleTrigger);
    return () => window.removeEventListener('canvas-history' as any, handleTrigger);
  }, []);

  // Handle stencil outline trigger from window event
  useEffect(() => {
    const handleOutline = () => {
      const colorCanvas = colorCanvasRef.current;
      const ctx = colorCanvas?.getContext('2d');
      if (!ctx || !colorCanvas || !activeStencil) return;
      const def = stencilDef || getStencilById(activeStencil.stencilId);
      if (!def) return;
      strokeStencilOutline(ctx, activeStencil, def, activeColor, brushSize, brushStyle);
      saveState();
    };

    window.addEventListener('canvas-outline-stencil' as any, handleOutline);
    return () => window.removeEventListener('canvas-outline-stencil' as any, handleOutline);
  }, [activeStencil, stencilDef, activeColor, brushSize, brushStyle]);

  const paperRef = useRef<HTMLDivElement>(null);

  // Map mouse/touch coordinates to canvas pixel space
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = colorCanvasRef.current;
    const paper = paperRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (paper && transform) {
      const paperRect = paper.getBoundingClientRect();
      return getTransformedCanvasPoint(
        clientX,
        clientY,
        paperRect,
        canvas.width,
        canvas.height,
        zoom,
        transform
      );
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((clientY - rect.top) * (canvas.height / rect.height));
    return { x, y };
  };

  // Eyedropper color picker
  const pickColorAt = (x: number, y: number) => {
    const ctx = colorCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    setActiveColor(hex);
  };

  // Start interaction
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const targetEl = e.target as HTMLElement | null;
    if (targetEl && targetEl.closest('button, input, textarea, a, [data-ui]')) return;

    if (activeTool === 'pan' || ('button' in e && e.button === 1)) {
      setIsPanning(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: clientX - pan.x, y: clientY - pan.y });
      return;
    }

    if (activeTool === 'transform') {
      if (isPickingColor && setTransform && setIsPickingColor) {
        const { x, y } = getCanvasCoords(e);
        const canvas = colorCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const srcData = colorSnapshotRef.current || ctx.getImageData(0, 0, canvas.width, canvas.height);
            const idx = (y * canvas.width + x) * 4;
            const r = srcData.data[idx];
            const g = srcData.data[idx + 1];
            const b = srcData.data[idx + 2];
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            setTransform(prev => ({ ...prev, targetColor: hex }));
            setIsPickingColor(false);
            return;
          }
        }
      }
      setIsPanning(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const curOffX = transform?.offsetX ?? 0;
      const curOffY = transform?.offsetY ?? 0;
      setPanStart({ x: clientX - curOffX, y: clientY - curOffY });
      return;
    }

    const { x, y } = getCanvasCoords(e);
    setCursorPos({ x, y });

    if (activeTool === 'picker') {
      pickColorAt(x, y);
      return;
    }

    if (activeTool === 'select' || activeTool === 'line') {
      if (selectedLineId && placedLines.length > 0) {
        const selLine = placedLines.find(l => l.id === selectedLineId);
        if (selLine) {
          if (Math.hypot(x - selLine.x1, y - selLine.y1) <= 16) {
            setIsDraggingLine(true);
            setDragLineHandle('start');
            return;
          }
          if (Math.hypot(x - selLine.x2, y - selLine.y2) <= 16) {
            setIsDraggingLine(true);
            setDragLineHandle('end');
            return;
          }
        }
      }

      const lineHit = findLineHit(placedLines, x, y);
      if (lineHit) {
        if (setSelectedLineId) setSelectedLineId(lineHit.line.id);
        if (setSelectedBubbleId) setSelectedBubbleId(null);
        if (setSelectedSpiralId) setSelectedSpiralId(null);
        if (setSelectedCircleId) setSelectedCircleId(null);
        if (setSelectedSquareId) setSelectedSquareId(null);
        setActiveColor(lineHit.line.color);
        setIsDraggingLine(true);
        setDragLineHandle(lineHit.handle);
        setDragLineOffset({ x: x - lineHit.line.x1, y: y - lineHit.line.y1 });
        return;
      }
    }

    if (activeTool === 'select' || activeTool === 'spiral') {
      if (selectedSpiralId && placedSpirals.length > 0) {
        const selSpiral = placedSpirals.find(s => s.id === selectedSpiralId);
        if (selSpiral && Math.hypot(x - (selSpiral.cx + selSpiral.radius), y - selSpiral.cy) <= 16) {
          setIsDraggingSpiral(true);
          setDragSpiralHandle('radius');
          return;
        }
      }

      const spiralHit = findSpiralHit(placedSpirals, x, y);
      if (spiralHit) {
        if (setSelectedSpiralId) setSelectedSpiralId(spiralHit.spiral.id);
        if (setSelectedLineId) setSelectedLineId(null);
        if (setSelectedBubbleId) setSelectedBubbleId(null);
        if (setSelectedCircleId) setSelectedCircleId(null);
        if (setSelectedSquareId) setSelectedSquareId(null);
        setActiveColor(spiralHit.spiral.color);
        setIsDraggingSpiral(true);
        setDragSpiralHandle(spiralHit.handle);
        setDragSpiralOffset({ x: x - spiralHit.spiral.cx, y: y - spiralHit.spiral.cy });
        return;
      }
    }

    if (activeTool === 'select' || activeTool === 'circle') {
      if (selectedCircleId && placedCircles.length > 0) {
        const selCircle = placedCircles.find(c => c.id === selectedCircleId);
        if (selCircle && Math.hypot(x - (selCircle.cx + selCircle.radius), y - selCircle.cy) <= 16) {
          setIsDraggingCircle(true);
          setDragCircleHandle('radius');
          return;
        }
      }

      const circleHit = findCircleHit(placedCircles, x, y);
      if (circleHit) {
        if (setSelectedCircleId) setSelectedCircleId(circleHit.circle.id);
        if (setSelectedSpiralId) setSelectedSpiralId(null);
        if (setSelectedLineId) setSelectedLineId(null);
        if (setSelectedBubbleId) setSelectedBubbleId(null);
        if (setSelectedSquareId) setSelectedSquareId(null);
        setActiveColor(circleHit.circle.color);
        setIsDraggingCircle(true);
        setDragCircleHandle(circleHit.handle);
        setDragCircleOffset({ x: x - circleHit.circle.cx, y: y - circleHit.circle.cy });
        return;
      }
    }

    if (activeTool === 'select' || activeTool === 'square') {
      if (selectedSquareId && placedSquares.length > 0) {
        const selSquare = placedSquares.find(sq => sq.id === selectedSquareId);
        if (selSquare) {
          const { x: sx, y: sy, width: sw, height: sh } = selSquare;
          if (Math.hypot(x - sx, y - sy) <= 16) {
            setIsDraggingSquare(true);
            setDragSquareHandle('top-left');
            return;
          }
          if (Math.hypot(x - (sx + sw), y - sy) <= 16) {
            setIsDraggingSquare(true);
            setDragSquareHandle('top-right');
            return;
          }
          if (Math.hypot(x - sx, y - (sy + sh)) <= 16) {
            setIsDraggingSquare(true);
            setDragSquareHandle('bottom-left');
            return;
          }
          if (Math.hypot(x - (sx + sw), y - (sy + sh)) <= 16) {
            setIsDraggingSquare(true);
            setDragSquareHandle('bottom-right');
            return;
          }
        }
      }

      const squareHit = findSquareHit(placedSquares, x, y);
      if (squareHit) {
        if (setSelectedSquareId) setSelectedSquareId(squareHit.square.id);
        if (setSelectedCircleId) setSelectedCircleId(null);
        if (setSelectedSpiralId) setSelectedSpiralId(null);
        if (setSelectedLineId) setSelectedLineId(null);
        if (setSelectedBubbleId) setSelectedBubbleId(null);
        if (setSelectedStampId) setSelectedStampId(null);
        setActiveColor(squareHit.square.color);
        setIsDraggingSquare(true);
        setDragSquareHandle(squareHit.handle);
        setDragSquareOffset({ x: x - squareHit.square.x, y: y - squareHit.square.y });
        return;
      }
    }

    if (activeTool === 'select' || activeTool === 'stamp') {
      if (selectedStampId && placedStamps.length > 0) {
        const selStamp = placedStamps.find(st => st.id === selectedStampId);
        if (selStamp) {
          const half = selStamp.size / 2;
          const hitRadius = 24;
          if (
            Math.hypot(x - (selStamp.cx + half), y - (selStamp.cy + half)) <= hitRadius ||
            Math.hypot(x - (selStamp.cx - half), y - (selStamp.cy - half)) <= hitRadius ||
            Math.hypot(x - (selStamp.cx + half), y - (selStamp.cy - half)) <= hitRadius ||
            Math.hypot(x - (selStamp.cx - half), y - (selStamp.cy + half)) <= hitRadius
          ) {
            setIsDraggingStamp(true);
            setDragStampHandle('radius');
            return;
          }
        }
      }

      const stampHit = findStampHit(placedStamps, x, y);
      if (stampHit) {
        if (setSelectedStampId) setSelectedStampId(stampHit.stamp.id);
        if (setSelectedSquareId) setSelectedSquareId(null);
        if (setSelectedCircleId) setSelectedCircleId(null);
        if (setSelectedSpiralId) setSelectedSpiralId(null);
        if (setSelectedLineId) setSelectedLineId(null);
        if (setSelectedBubbleId) setSelectedBubbleId(null);
        setActiveColor(stampHit.stamp.color);
        setIsDraggingStamp(true);
        setDragStampHandle(stampHit.handle);
        setDragStampOffset({ x: x - stampHit.stamp.cx, y: y - stampHit.stamp.cy });
        return;
      }
    }

    if (activeTool === 'stamp') {
      if (setPlacedStamps && activeStampId) {
        const newStamp: PlacedStamp = {
          id: `stamp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          stampId: activeStampId,
          cx: x,
          cy: y,
          size: Math.max(30, brushSize * 4),
          color: activeColor,
          fillColor: activeColor
        };
        setPlacedStamps(prev => [...prev, newStamp]);
        if (setSelectedStampId) setSelectedStampId(newStamp.id);
        saveState();
      }
      return;
    }

    if (activeTool === 'select') {
      const bubbleCanvas = bubbleCanvasRef.current;
      const ctx = bubbleCanvas?.getContext('2d');
      const bHit = findBubbleHit(placedBubbles, x, y, ctx || null);
      if (bHit) {
        if (setSelectedBubbleId) setSelectedBubbleId(bHit.bubble.id);
        if (setSelectedLineId) setSelectedLineId(null);
        if (setSelectedSpiralId) setSelectedSpiralId(null);
        if (setSelectedCircleId) setSelectedCircleId(null);
        if (setSelectedSquareId) setSelectedSquareId(null);
        if (setSelectedStampId) setSelectedStampId(null);
        if (setBubbleOptions) setBubbleOptions(bHit.bubble.options);
        setIsDraggingBubble(true);
        setDragBubbleHandle(bHit.handle);

        const bounds = ctx ? getSpeechBubbleBounds(ctx, bHit.bubble.x, bHit.bubble.y, bHit.bubble.options) : { bx: bHit.bubble.x - 60, by: bHit.bubble.y - 30, width: 120, height: 60 };
        const tx = bHit.bubble.tailX !== undefined ? bHit.bubble.tailX : (bHit.bubble.options.tailX !== undefined ? bHit.bubble.options.tailX : bHit.bubble.x - 25);
        const ty = bHit.bubble.tailY !== undefined ? bHit.bubble.tailY : (bHit.bubble.options.tailY !== undefined ? bHit.bubble.options.tailY : bHit.bubble.y + bounds.height / 2 + 25);

        if (bHit.handle === 'tail') {
          setDragOffset({ x: x - tx, y: y - ty });
        } else {
          setDragOffset({ x: x - bHit.bubble.x, y: y - bHit.bubble.y });
        }
        return;
      }
      if (setSelectedBubbleId) setSelectedBubbleId(null);
      if (setSelectedLineId) setSelectedLineId(null);
      if (setSelectedSpiralId) setSelectedSpiralId(null);
      if (setSelectedCircleId) setSelectedCircleId(null);
      if (setSelectedSquareId) setSelectedSquareId(null);
      if (setSelectedStampId) setSelectedStampId(null);
      return;
    }

    if (activeTool === 'bubble' && bubbleOptions && setPlacedBubbles) {
      const newBubble: PlacedSpeechBubble = {
        id: `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        x,
        y,
        options: { ...bubbleOptions }
      };
      setPlacedBubbles(prev => [...prev, newBubble]);
      if (setSelectedBubbleId) setSelectedBubbleId(newBubble.id);
      setIsDraggingBubble(true);
      setDragOffset({ x: 0, y: 0 });
      saveState();
      return;
    }

    if (activeTool === 'bucket') {
      const stampHit = findStampHit(placedStamps, x, y);
      if (stampHit && setPlacedStamps) {
        setPlacedStamps(prev => prev.map(st => st.id === stampHit.stamp.id ? { ...st, color: activeColor, fillColor: activeColor } : st));
        saveState();
        return;
      }

      const squareHit = findSquareHit(placedSquares, x, y);
      if (squareHit && setPlacedSquares) {
        setPlacedSquares(prev => prev.map(sq => sq.id === squareHit.square.id ? { ...sq, fillColor: activeColor } : sq));
        saveState();
        return;
      }

      const circleHit = findCircleHit(placedCircles, x, y);
      if (circleHit && setPlacedCircles) {
        setPlacedCircles(prev => prev.map(c => c.id === circleHit.circle.id ? { ...c, fillColor: activeColor } : c));
        saveState();
        return;
      }

      const spiralHit = findSpiralHit(placedSpirals, x, y);
      if (spiralHit && setPlacedSpirals) {
        setPlacedSpirals(prev => prev.map(s => s.id === spiralHit.spiral.id ? { ...s, fillColor: activeColor } : s));
        saveState();
        return;
      }

      const colorCtx = colorCanvasRef.current?.getContext('2d');
      const lineCtx = lineCanvasRef.current?.getContext('2d');
      const bubbleCtx = bubbleCanvasRef.current?.getContext('2d');
      if (colorCtx) {
        performFloodFill(colorCtx, lineCtx || null, x, y, activeColor, tolerance, activeStencil, stencilDef, gradientOptions, bubbleCtx || null);
        saveState();
      }
      return;
    }

    if (activeTool === 'spiral') {
      setIsDrawingSpiral(true);
      setSpiralCenter({ x, y });
      setSpiralRadius(10);
      return;
    }

    if (activeTool === 'circle') {
      setIsDrawingCircle(true);
      setCircleCenter({ x, y });
      setCircleRadius(10);
      return;
    }

    if (activeTool === 'square') {
      setIsDrawingSquare(true);
      setSquareStart({ x, y });
      setSquareEnd({ x, y });
      return;
    }

    if (activeTool === 'line') {
      setIsDrawingLine(true);
      setLineStart({ x, y });
      setLineEnd({ x, y });
      setLineAngle(0);
      setLineLength(0);
      return;
    }

    if (activeTool === 'stencil') {
      return;
    }

    setIsDrawing(true);
    setLastPos({ x, y });
    drawStroke(x, y);
  };

  // Stroke drawing
  const drawStroke = (x: number, y: number) => {
    const colorCanvas = colorCanvasRef.current;
    const ctx = colorCanvas?.getContext('2d');
    if (!ctx || !colorCanvas) return;

    const p1 = lastPos || { x, y };
    const p2 = { x, y };

    if (activeStencil && stencilDef) {
      setupStencilClipMask(ctx, activeStencil, stencilDef, colorCanvas.width, colorCanvas.height);
    }

    if (activeTool === 'eraser') {
      ctx.save();
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    } else {
      renderBrushStroke(ctx, p1, p2, activeColor, brushSize, brushStyle);
    }

    if (activeStencil && stencilDef) {
      ctx.restore();
    }

    setLastPos({ x, y });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCanvasCoords(e);
    setCursorPos({ x, y });

    if (isDraggingLine && selectedLineId && setPlacedLines && placedLines) {
      const isShift = 'shiftKey' in e ? e.shiftKey : false;
      const target = placedLines.find(l => l.id === selectedLineId);
      if (target) {
        if (dragLineHandle === 'body') {
          const dx = (x - dragLineOffset.x) - target.x1;
          const dy = (y - dragLineOffset.y) - target.y1;
          setPlacedLines(prev => prev.map(l => l.id === selectedLineId ? {
            ...l, x1: l.x1 + dx, y1: l.y1 + dy, x2: l.x2 + dx, y2: l.y2 + dy
          } : l));
        } else if (dragLineHandle === 'start') {
          const res = calculateLineAngleAndEnd({ x: target.x2, y: target.y2 }, { x, y }, isShift);
          setPlacedLines(prev => prev.map(l => l.id === selectedLineId ? { ...l, x1: res.end.x, y1: res.end.y } : l));
        } else if (dragLineHandle === 'end') {
          const res = calculateLineAngleAndEnd({ x: target.x1, y: target.y1 }, { x, y }, isShift);
          setPlacedLines(prev => prev.map(l => l.id === selectedLineId ? { ...l, x2: res.end.x, y2: res.end.y } : l));
        }
      }
      return;
    }

    if (isDraggingSpiral && selectedSpiralId && setPlacedSpirals && placedSpirals) {
      const target = placedSpirals.find(s => s.id === selectedSpiralId);
      if (target) {
        if (dragSpiralHandle === 'center') {
          const dx = x - dragSpiralOffset.x;
          const dy = y - dragSpiralOffset.y;
          setPlacedSpirals(prev => prev.map(s => s.id === selectedSpiralId ? { ...s, cx: dx, cy: dy } : s));
        } else if (dragSpiralHandle === 'radius') {
          const r = Math.max(10, Math.round(Math.hypot(x - target.cx, y - target.cy)));
          setPlacedSpirals(prev => prev.map(s => s.id === selectedSpiralId ? { ...s, radius: r } : s));
        }
      }
      return;
    }

    if (isDraggingCircle && selectedCircleId && setPlacedCircles && placedCircles) {
      const target = placedCircles.find(c => c.id === selectedCircleId);
      if (target) {
        if (dragCircleHandle === 'center') {
          const dx = x - dragCircleOffset.x;
          const dy = y - dragCircleOffset.y;
          setPlacedCircles(prev => prev.map(c => c.id === selectedCircleId ? { ...c, cx: dx, cy: dy } : c));
        } else if (dragCircleHandle === 'radius') {
          const r = Math.max(10, Math.round(Math.hypot(x - target.cx, y - target.cy)));
          setPlacedCircles(prev => prev.map(c => c.id === selectedCircleId ? { ...c, radius: r } : c));
        }
      }
      return;
    }

    if (isDraggingSquare && selectedSquareId && setPlacedSquares && placedSquares) {
      const target = placedSquares.find(sq => sq.id === selectedSquareId);
      if (target) {
        if (dragSquareHandle === 'body') {
          const dx = x - dragSquareOffset.x;
          const dy = y - dragSquareOffset.y;
          setPlacedSquares(prev => prev.map(sq => sq.id === selectedSquareId ? { ...sq, x: dx, y: dy } : sq));
        } else if (dragSquareHandle) {
          const right = target.x + target.width;
          const bottom = target.y + target.height;
          let newX = target.x;
          let newY = target.y;
          let newW = target.width;
          let newH = target.height;

          if (dragSquareHandle === 'top-left') {
            newX = Math.min(x, right - 10);
            newY = Math.min(y, bottom - 10);
            newW = right - newX;
            newH = bottom - newY;
          } else if (dragSquareHandle === 'top-right') {
            newY = Math.min(y, bottom - 10);
            newW = Math.max(10, x - target.x);
            newH = bottom - newY;
          } else if (dragSquareHandle === 'bottom-left') {
            newX = Math.min(x, right - 10);
            newW = right - newX;
            newH = Math.max(10, y - target.y);
          } else if (dragSquareHandle === 'bottom-right') {
            newW = Math.max(10, x - target.x);
            newH = Math.max(10, y - target.y);
          }

          setPlacedSquares(prev => prev.map(sq => sq.id === selectedSquareId ? {
            ...sq, x: newX, y: newY, width: newW, height: newH
          } : sq));
        }
      }
      return;
    }

    if (isDraggingStamp && selectedStampId && setPlacedStamps && placedStamps) {
      const target = placedStamps.find(st => st.id === selectedStampId);
      if (target) {
        if (dragStampHandle === 'center') {
          const dx = x - dragStampOffset.x;
          const dy = y - dragStampOffset.y;
          setPlacedStamps(prev => prev.map(st => st.id === selectedStampId ? { ...st, cx: dx, cy: dy } : st));
        } else if (dragStampHandle === 'radius') {
          const newSize = Math.max(20, Math.round(Math.max(Math.abs(x - target.cx), Math.abs(y - target.cy)) * 2));
          setPlacedStamps(prev => prev.map(st => st.id === selectedStampId ? { ...st, size: newSize } : st));
        }
      }
      return;
    }

    if (isDrawingLine && lineStart) {
      const isShift = 'shiftKey' in e ? e.shiftKey : false;
      const res = calculateLineAngleAndEnd(lineStart, { x, y }, isShift);
      setLineEnd(res.end);
      setLineAngle(res.angle);
      setLineLength(res.length);
      return;
    }

    if (isDrawingSpiral && spiralCenter) {
      const radius = Math.max(10, Math.round(Math.hypot(x - spiralCenter.x, y - spiralCenter.y)));
      setSpiralRadius(radius);
      return;
    }

    if (isDrawingCircle && circleCenter) {
      const radius = Math.max(10, Math.round(Math.hypot(x - circleCenter.x, y - circleCenter.y)));
      setCircleRadius(radius);
      return;
    }

    if (isDrawingSquare && squareStart) {
      const isShift = 'shiftKey' in e ? e.shiftKey : false;
      let currX = x;
      let currY = y;
      if (isShift) {
        const side = Math.max(Math.abs(x - squareStart.x), Math.abs(y - squareStart.y));
        currX = squareStart.x + (x >= squareStart.x ? side : -side);
        currY = squareStart.y + (y >= squareStart.y ? side : -side);
      }
      setSquareEnd({ x: currX, y: currY });
      return;
    }

    if (isPanning && activeTool === 'transform' && setTransform) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setTransform(prev => ({
        ...prev,
        offsetX: Math.round(clientX - panStart.x),
        offsetY: Math.round(clientY - panStart.y)
      }));
      return;
    }

    if (isPanning) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPan({ x: clientX - panStart.x, y: clientY - panStart.y });
      return;
    }

    if (isDraggingBubble && selectedBubbleId && setPlacedBubbles) {
      const bubbleCanvas = bubbleCanvasRef.current;
      const ctx = bubbleCanvas?.getContext('2d');

      setPlacedBubbles(prev => prev.map(b => {
        if (b.id !== selectedBubbleId) return b;
        if (dragBubbleHandle === 'tail') {
          const newTailX = Math.round(x - dragOffset.x);
          const newTailY = Math.round(y - dragOffset.y);
          return {
            ...b,
            tailX: newTailX,
            tailY: newTailY,
            options: { ...b.options, tailX: newTailX, tailY: newTailY }
          };
        } else {
          const newX = Math.round(x - dragOffset.x);
          const newY = Math.round(y - dragOffset.y);
          const dx = newX - b.x;
          const dy = newY - b.y;
          const bounds = ctx ? getSpeechBubbleBounds(ctx, b.x, b.y, b.options) : { height: 50 };
          const currentTailX = b.tailX !== undefined ? b.tailX : (b.options.tailX !== undefined ? b.options.tailX : b.x - 25);
          const currentTailY = b.tailY !== undefined ? b.tailY : (b.options.tailY !== undefined ? b.options.tailY : b.y + bounds.height / 2 + 25);
          const newTailX = currentTailX + dx;
          const newTailY = currentTailY + dy;
          return {
            ...b,
            x: newX,
            y: newY,
            tailX: newTailX,
            tailY: newTailY,
            options: { ...b.options, tailX: newTailX, tailY: newTailY }
          };
        }
      }));
      return;
    }

    if (!isDrawing) return;
    drawStroke(x, y);
  };

  const handlePointerUp = () => {
    if (isDraggingBubble) {
      setIsDraggingBubble(false);
      setDragBubbleHandle(null);
      saveState();
    }
    if (isDraggingLine) {
      setIsDraggingLine(false);
      setDragLineHandle(null);
      saveState();
    }
    if (isDraggingSpiral) {
      setIsDraggingSpiral(false);
      setDragSpiralHandle(null);
      saveState();
    }
    if (isDraggingCircle) {
      setIsDraggingCircle(false);
      setDragCircleHandle(null);
      saveState();
    }
    if (isDraggingSquare) {
      setIsDraggingSquare(false);
      setDragSquareHandle(null);
      saveState();
    }
    if (isDraggingStamp) {
      setIsDraggingStamp(false);
      setDragStampHandle(null);
      saveState();
    }
    if (isDrawingLine && lineStart && lineEnd) {
      setIsDrawingLine(false);
      if (lineLength >= 3 && setPlacedLines) {
        const newLine: PlacedLine = {
          id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x1: lineStart.x,
          y1: lineStart.y,
          x2: lineEnd.x,
          y2: lineEnd.y,
          color: activeColor,
          size: brushSize,
          style: brushStyle
        };
        setPlacedLines(prev => [...prev, newLine]);
        if (setSelectedLineId) setSelectedLineId(newLine.id);
        saveState();
      }
      setLineStart(null);
      setLineEnd(null);
      setLineAngle(0);
      setLineLength(0);
    }
    if (isDrawingSpiral && spiralCenter) {
      setIsDrawingSpiral(false);
      if (spiralRadius >= 10 && setPlacedSpirals) {
        const newSpiral: PlacedSpiral = {
          id: `spiral_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          cx: spiralCenter.x,
          cy: spiralCenter.y,
          radius: spiralRadius,
          turns: 3,
          color: activeColor,
          size: brushSize,
          style: brushStyle
        };
        setPlacedSpirals(prev => [...prev, newSpiral]);
        if (setSelectedSpiralId) setSelectedSpiralId(newSpiral.id);
        saveState();
      }
      setSpiralCenter(null);
      setSpiralRadius(0);
    }
    if (isDrawingCircle && circleCenter) {
      setIsDrawingCircle(false);
      if (circleRadius >= 10 && setPlacedCircles) {
        const newCircle: PlacedCircle = {
          id: `circle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          cx: circleCenter.x,
          cy: circleCenter.y,
          radius: circleRadius,
          color: activeColor,
          size: brushSize,
          style: brushStyle
        };
        setPlacedCircles(prev => [...prev, newCircle]);
        if (setSelectedCircleId) setSelectedCircleId(newCircle.id);
        saveState();
      }
      setCircleCenter(null);
      setCircleRadius(0);
    }
    if (isDrawingSquare && squareStart && squareEnd) {
      setIsDrawingSquare(false);
      const x = Math.min(squareStart.x, squareEnd.x);
      const y = Math.min(squareStart.y, squareEnd.y);
      const width = Math.abs(squareEnd.x - squareStart.x);
      const height = Math.abs(squareEnd.y - squareStart.y);

      if ((width >= 5 || height >= 5) && setPlacedSquares) {
        const newSquare: PlacedSquare = {
          id: `square_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x,
          y,
          width,
          height,
          color: activeColor,
          size: brushSize,
          style: brushStyle
        };
        setPlacedSquares(prev => [...prev, newSquare]);
        if (setSelectedSquareId) setSelectedSquareId(newSquare.id);
        saveState();
      }
      setSquareStart(null);
      setSquareEnd(null);
    }
    if (isDraggingBubble) {
      setIsDraggingBubble(false);
      saveState();
    }
    if (isDrawing) {
      setIsDrawing(false);
      setLastPos(null);
      saveState();
    }
    setIsPanning(false);
  };

  const handlePointerLeave = () => {
    setCursorPos(null);
    if (isDraggingLine) {
      setIsDraggingLine(false);
      setDragLineHandle(null);
    }
    if (isDraggingSpiral) {
      setIsDraggingSpiral(false);
      setDragSpiralHandle(null);
    }
    if (isDraggingCircle) {
      setIsDraggingCircle(false);
      setDragCircleHandle(null);
    }
    if (isDraggingSquare) {
      setIsDraggingSquare(false);
      setDragSquareHandle(null);
    }
    if (isDrawingLine) {
      setIsDrawingLine(false);
      setLineStart(null);
      setLineEnd(null);
      setLineAngle(0);
      setLineLength(0);
    }
    if (isDrawingSpiral) {
      setIsDrawingSpiral(false);
      setSpiralCenter(null);
      setSpiralRadius(0);
    }
    if (isDrawingCircle) {
      setIsDrawingCircle(false);
      setCircleCenter(null);
      setCircleRadius(0);
    }
    if (isDrawingSquare) {
      setIsDrawingSquare(false);
      setSquareStart(null);
      setSquareEnd(null);
    }
    if (isDraggingBubble) {
      setIsDraggingBubble(false);
      saveState();
    }
    if (isDrawing) {
      setIsDrawing(false);
      setLastPos(null);
      saveState();
    }
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!setZoom) return;
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(z => Math.min(4, Math.max(0.4, Number((z + delta).toFixed(2)))));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerLeave}
      onWheel={handleWheel}
      style={{ cursor: getToolCursorStyle(activeTool, isPanning, isPickingColor) }}
      className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none"
    >
      {/* Paper Sheet Frame (Zoomed and panned, white background, shadow, clipped edges) */}
      <div
        ref={paperRef}
        style={{
          transform: buildPaperTransformCss(pan, zoom),
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
        className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-slate-700"
      >
        {/* Drawing Content Inner Wrapper (Transforms drawing inside fixed paper bounds) */}
        <div
          style={{
            transform: buildDrawingTransformCss(transform),
            transformOrigin: 'center center',
            transition: isPanning && activeTool === 'transform' ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative w-full h-full"
        >
          {/* Layer 0.5: Back Canvas (Vector shapes drawn behind hand-drawn paint) */}
          <canvas ref={backCanvasRef} className="absolute top-0 left-0 pointer-events-none z-0" />

          {/* Layer 1: Color Canvas */}
          <canvas ref={colorCanvasRef} className="relative block z-10" />

          {/* Layer 2: Speech Bubble Canvas Overlay */}
          <canvas ref={bubbleCanvasRef} className="absolute top-0 left-0 pointer-events-none z-20" />

          {/* Layer 3: Line Art Overlay (Multiply blend mode) */}
          <canvas
            ref={lineCanvasRef}
            style={{ mixBlendMode: 'multiply' }}
            className="absolute top-0 left-0 pointer-events-none z-30"
          />

          {/* Layer 3.5: Line & Dot Grid Overlay */}
          <canvas
            ref={gridCanvasRef}
            className="absolute top-0 left-0 pointer-events-none z-40"
          />

          {/* Layer 4: Interactive Stencil Mask Overlay */}
          {activeStencil && stencilDef && setStencilState && colorCanvasRef.current ? (
            <StencilOverlay
              stencilState={activeStencil}
              setStencilState={setStencilState}
              stencilDef={stencilDef}
              canvasWidth={colorCanvasRef.current.width}
              canvasHeight={colorCanvasRef.current.height}
              isDraggingAllowed={activeTool === 'stencil' || activeTool === 'select'}
            />
          ) : null}

          {/* Layer 5: Live Brush Size Ring Overlay */}
          {showBrushPreview && cursorPos && colorCanvasRef.current && (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'line') && (
            <div
              style={{
                position: 'absolute',
                left: `${(cursorPos.x / colorCanvasRef.current.width) * 100}%`,
                top: `${(cursorPos.y / colorCanvasRef.current.height) * 100}%`,
                width: `${(brushSize / colorCanvasRef.current.width) * 100}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '1.5px solid rgba(0, 0, 0, 0.8)',
                boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.9)',
                backgroundColor: activeTool === 'eraser' ? '#FFFFFF' : activeColor,
                opacity: 0.35,
                pointerEvents: 'none',
                zIndex: 25
              }}
            />
          )}

          {/* Layer 5.5: Live Spiral Tool Guide Overlay */}
          {isDrawingSpiral && spiralCenter && colorCanvasRef.current && (
            <div
              style={{
                position: 'absolute',
                left: `${(spiralCenter.x / colorCanvasRef.current.width) * 100}%`,
                top: `${(spiralCenter.y / colorCanvasRef.current.height) * 100}%`,
                width: `${((spiralRadius * 2) / colorCanvasRef.current.width) * 100}%`,
                height: `${((spiralRadius * 2) / colorCanvasRef.current.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '2px dashed #a855f7',
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
                pointerEvents: 'none',
                zIndex: 25
              }}
            />
          )}

          {/* Layer 5.5.1: Live Circle Tool Guide Overlay */}
          {isDrawingCircle && circleCenter && colorCanvasRef.current && (
            <div
              style={{
                position: 'absolute',
                left: `${(circleCenter.x / colorCanvasRef.current.width) * 100}%`,
                top: `${(circleCenter.y / colorCanvasRef.current.height) * 100}%`,
                width: `${((circleRadius * 2) / colorCanvasRef.current.width) * 100}%`,
                height: `${((circleRadius * 2) / colorCanvasRef.current.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '2px dashed #a855f7',
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
                pointerEvents: 'none',
                zIndex: 25
              }}
            />
          )}

          {/* Layer 5.5.2: Live Square Tool Guide Overlay */}
          {isDrawingSquare && squareStart && squareEnd && colorCanvasRef.current && (() => {
            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;
            const x = Math.min(squareStart.x, squareEnd.x);
            const y = Math.min(squareStart.y, squareEnd.y);
            const w = Math.abs(squareEnd.x - squareStart.x);
            const h = Math.abs(squareEnd.y - squareStart.y);
            return (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: `${(x / cW) * 100}%`,
                    top: `${(y / cH) * 100}%`,
                    width: `${(w / cW) * 100}%`,
                    height: `${(h / cH) * 100}%`,
                    border: '2px dashed #a855f7',
                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 25
                  }}
                />
                <div
                  className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-2.5 py-1 rounded-full bg-slate-950/90 border border-purple-500/60 text-xs font-bold text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-sm"
                  style={{
                    left: `${((x + w / 2) / cW) * 100}%`,
                    top: `${(y / cH) * 100}%`
                  }}
                >
                  <span className="text-purple-300 font-mono">{w} × {h} px</span>
                </div>
              </>
            );
          })()}

          {/* Layer 5.6: Live Line Tool Guide Overlay */}
          {isDrawingLine && lineStart && lineEnd && colorCanvasRef.current && (
            <>
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
                <line
                  x1={`${(lineStart.x / colorCanvasRef.current.width) * 100}%`}
                  y1={`${(lineStart.y / colorCanvasRef.current.height) * 100}%`}
                  x2={`${(lineEnd.x / colorCanvasRef.current.width) * 100}%`}
                  y2={`${(lineEnd.y / colorCanvasRef.current.height) * 100}%`}
                  stroke="#c084fc"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <circle
                  cx={`${(lineStart.x / colorCanvasRef.current.width) * 100}%`}
                  cy={`${(lineStart.y / colorCanvasRef.current.height) * 100}%`}
                  r="5"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={`${(lineEnd.x / colorCanvasRef.current.width) * 100}%`}
                  cy={`${(lineEnd.y / colorCanvasRef.current.height) * 100}%`}
                  r="6"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-2.5 py-1 rounded-full bg-slate-950/90 border border-purple-500/60 text-xs font-bold text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-sm"
                style={{
                  left: `${(lineEnd.x / colorCanvasRef.current.width) * 100}%`,
                  top: `${(lineEnd.y / colorCanvasRef.current.height) * 100}%`
                }}
              >
                <span className="text-purple-300 font-mono">{lineAngle}°</span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-300 font-mono">{lineLength} px</span>
              </div>
            </>
          )}

          {/* Layer 5.7: Selected Placed Line Overlay */}
          {(() => {
            if (!showShapeSelectPanel || !selectedLineId || (activeTool !== 'select' && activeTool !== 'line') || !colorCanvasRef.current) return null;
            const selLine = placedLines.find(l => l.id === selectedLineId);
            if (!selLine) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;
            const midX = (selLine.x1 + selLine.x2) / 2;
            const midY = (selLine.y1 + selLine.y2) / 2;
            const angle = Math.round((Math.atan2(selLine.y2 - selLine.y1, selLine.x2 - selLine.x1) * 180 / Math.PI + 360) % 360);
            const length = Math.round(Math.hypot(selLine.x2 - selLine.x1, selLine.y2 - selLine.y1));

            return (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1 rounded-full bg-slate-950/95 border border-purple-500/70 text-xs font-bold text-white shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto"
                style={{
                  left: `${(midX / cW) * 100}%`,
                  top: `${(midY / cH) * 100}%`
                }}
              >
                <span className="text-purple-300 font-mono">{angle}°</span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-300 font-mono">{length} px</span>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (setPlacedLines) {
                      setPlacedLines(prev => prev.map(l => l.id === selLine.id ? { ...l, isBehindPaint: !l.isBehindPaint } : l));
                    }
                  }}
                  className={`ml-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                    selLine.isBehindPaint
                      ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={selLine.isBehindPaint ? 'Bring to Front (Draw in front of hand-drawn paint)' : 'Send to Back (Draw behind hand-drawn paint)'}
                >
                  <Layers className="w-3 h-3 shrink-0" />
                  <span>{selLine.isBehindPaint ? 'Front' : 'Back'}</span>
                </button>
                <div className="flex items-center space-x-1 border-l border-slate-700/80 pl-1.5 ml-1">
                  <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={selLine.opacity ?? 1}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const op = parseFloat(e.target.value);
                      if (setPlacedLines) setPlacedLines(prev => prev.map(l => l.id === selLine.id ? { ...l, opacity: op } : l));
                    }}
                    className="w-12 h-1 accent-purple-500 cursor-pointer"
                    title={`Opacity: ${Math.round((selLine.opacity ?? 1) * 100)}%`}
                  />
                  <span className="text-[10px] text-purple-300 font-mono w-6 text-right">
                    {Math.round((selLine.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const copiedLine: PlacedLine = {
                      ...selLine,
                      id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                      x1: selLine.x1 + 20,
                      y1: selLine.y1 + 20,
                      x2: selLine.x2 + 20,
                      y2: selLine.y2 + 20
                    };
                    if (setPlacedLines) setPlacedLines(prev => [...prev, copiedLine]);
                    if (setSelectedLineId) setSelectedLineId(copiedLine.id);
                  }}
                  className="ml-1 p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                  title="Copy Line (Duplicate selected line)"
                >
                  📋
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (setPlacedLines) setPlacedLines(prev => prev.filter(l => l.id !== selLine.id));
                    if (setSelectedLineId) setSelectedLineId(null);
                  }}
                  className="p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
                  title="Delete Selected Line (Delete / Backspace)"
                >
                  🗑️
                </button>
              </div>
            );
          })()}

          {/* Layer 5.8: Selected Placed Spiral Overlay */}
          {(() => {
            if (!showShapeSelectPanel || !selectedSpiralId || (activeTool !== 'select' && activeTool !== 'spiral') || !colorCanvasRef.current) return null;
            const selSpiral = placedSpirals.find(s => s.id === selectedSpiralId);
            if (!selSpiral) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;

            return (
              <>
                <svg
                  viewBox={`0 0 ${cW} ${cH}`}
                  className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible"
                >
                  <circle
                    cx={selSpiral.cx}
                    cy={selSpiral.cy}
                    r={selSpiral.radius}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    opacity="0.8"
                  />
                  <circle
                    cx={selSpiral.cx + selSpiral.radius}
                    cy={selSpiral.cy}
                    r="6"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-ew-resize pointer-events-auto"
                  />
                </svg>

                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1 rounded-full bg-slate-950/95 border border-purple-500/70 text-xs font-bold text-white shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto"
                  style={{
                    left: `${(selSpiral.cx / cW) * 100}%`,
                    top: `${((selSpiral.cy - selSpiral.radius) / cH) * 100}%`
                  }}
                >
                  <span className="text-purple-300 font-mono">🌀 {selSpiral.radius} px</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedSpirals) {
                        setPlacedSpirals(prev => prev.map(s => s.id === selSpiral.id ? { ...s, isBehindPaint: !s.isBehindPaint } : s));
                      }
                    }}
                    className={`ml-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                      selSpiral.isBehindPaint
                        ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={selSpiral.isBehindPaint ? 'Bring to Front (Draw in front of hand-drawn paint)' : 'Send to Back (Draw behind hand-drawn paint)'}
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{selSpiral.isBehindPaint ? 'Front' : 'Back'}</span>
                  </button>
                  <div className="flex items-center space-x-1 border-l border-slate-700/80 pl-1.5 ml-1">
                    <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={selSpiral.opacity ?? 1}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const op = parseFloat(e.target.value);
                        if (setPlacedSpirals) setPlacedSpirals(prev => prev.map(s => s.id === selSpiral.id ? { ...s, opacity: op } : s));
                      }}
                      className="w-12 h-1 accent-purple-500 cursor-pointer"
                      title={`Opacity: ${Math.round((selSpiral.opacity ?? 1) * 100)}%`}
                    />
                    <span className="text-[10px] text-purple-300 font-mono w-6 text-right">
                      {Math.round((selSpiral.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const copiedSpiral: PlacedSpiral = {
                        ...selSpiral,
                        id: `spiral_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        cx: selSpiral.cx + 20,
                        cy: selSpiral.cy + 20
                      };
                      if (setPlacedSpirals) setPlacedSpirals(prev => [...prev, copiedSpiral]);
                      if (setSelectedSpiralId) setSelectedSpiralId(copiedSpiral.id);
                    }}
                    className="p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title="Copy Spiral (Duplicate selected spiral)"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedSpirals) setPlacedSpirals(prev => prev.filter(s => s.id !== selSpiral.id));
                      if (setSelectedSpiralId) setSelectedSpiralId(null);
                    }}
                    className="p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
                    title="Delete Selected Spiral (Delete / Backspace)"
                  >
                    🗑️
                  </button>
                </div>
              </>
            );
          })()}

          {/* Layer 5.8.1: Selected Placed Circle Overlay */}
          {(() => {
            if (!showShapeSelectPanel || !selectedCircleId || (activeTool !== 'select' && activeTool !== 'circle') || !colorCanvasRef.current) return null;
            const selCircle = placedCircles.find(c => c.id === selectedCircleId);
            if (!selCircle) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;

            return (
              <>
                <svg
                  viewBox={`0 0 ${cW} ${cH}`}
                  className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible"
                >
                  <circle
                    cx={selCircle.cx}
                    cy={selCircle.cy}
                    r={selCircle.radius}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    opacity="0.8"
                  />
                  <circle
                    cx={selCircle.cx + selCircle.radius}
                    cy={selCircle.cy}
                    r="6"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-ew-resize pointer-events-auto"
                  />
                </svg>

                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1 rounded-full bg-slate-950/95 border border-purple-500/70 text-xs font-bold text-white shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto"
                  style={{
                    left: `${(selCircle.cx / cW) * 100}%`,
                    top: `${((selCircle.cy - selCircle.radius) / cH) * 100}%`
                  }}
                >
                  <span className="text-purple-300 font-mono">⭕ {selCircle.radius} px</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedCircles) {
                        setPlacedCircles(prev => prev.map(c => c.id === selCircle.id ? {
                          ...c, fillColor: c.fillColor === activeColor ? undefined : activeColor
                        } : c));
                        saveState();
                      }
                    }}
                    className="ml-1 p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title={selCircle.fillColor ? "Toggle/Clear Fill Color" : "Fill Circle with Active Color"}
                  >
                    {selCircle.fillColor ? '🎨' : '🪣'}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedCircles) {
                        setPlacedCircles(prev => prev.map(c => c.id === selCircle.id ? { ...c, isBehindPaint: !c.isBehindPaint } : c));
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                      selCircle.isBehindPaint
                        ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={selCircle.isBehindPaint ? 'Bring to Front (Draw in front of hand-drawn paint)' : 'Send to Back (Draw behind hand-drawn paint)'}
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{selCircle.isBehindPaint ? 'Front' : 'Back'}</span>
                  </button>
                  <div className="flex items-center space-x-1 border-l border-slate-700/80 pl-1.5 ml-1">
                    <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={selCircle.opacity ?? 1}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const op = parseFloat(e.target.value);
                        if (setPlacedCircles) setPlacedCircles(prev => prev.map(c => c.id === selCircle.id ? { ...c, opacity: op } : c));
                      }}
                      className="w-12 h-1 accent-purple-500 cursor-pointer"
                      title={`Opacity: ${Math.round((selCircle.opacity ?? 1) * 100)}%`}
                    />
                    <span className="text-[10px] text-purple-300 font-mono w-6 text-right">
                      {Math.round((selCircle.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const copiedCircle: PlacedCircle = {
                        ...selCircle,
                        id: `circle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        cx: selCircle.cx + 20,
                        cy: selCircle.cy + 20
                      };
                      if (setPlacedCircles) setPlacedCircles(prev => [...prev, copiedCircle]);
                      if (setSelectedCircleId) setSelectedCircleId(copiedCircle.id);
                    }}
                    className="p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title="Copy Circle (Duplicate selected circle)"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedCircles) setPlacedCircles(prev => prev.filter(c => c.id !== selCircle.id));
                      if (setSelectedCircleId) setSelectedCircleId(null);
                    }}
                    className="p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
                    title="Delete Selected Circle (Delete / Backspace)"
                  >
                    🗑️
                  </button>
                </div>
              </>
            );
          })()}

          {/* Layer 5.8.2: Selected Placed Square Overlay */}
          {(() => {
            if (!showShapeSelectPanel || !selectedSquareId || (activeTool !== 'select' && activeTool !== 'square') || !colorCanvasRef.current) return null;
            const selSquare = placedSquares.find(sq => sq.id === selectedSquareId);
            if (!selSquare) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;
            const { x, y, width: w, height: h } = selSquare;

            return (
              <>
                <svg
                  viewBox={`0 0 ${cW} ${cH}`}
                  className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible"
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    opacity="0.8"
                  />
                  <circle cx={x} cy={y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nwse-resize pointer-events-auto" />
                  <circle cx={x + w} cy={y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nesw-resize pointer-events-auto" />
                  <circle cx={x} cy={y + h} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nesw-resize pointer-events-auto" />
                  <circle cx={x + w} cy={y + h} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nwse-resize pointer-events-auto" />
                </svg>

                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1 rounded-full bg-slate-950/95 border border-purple-500/70 text-xs font-bold text-white shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto"
                  style={{
                    left: `${((x + w / 2) / cW) * 100}%`,
                    top: `${(y / cH) * 100}%`
                  }}
                >
                  <span className="text-purple-300 font-mono">⬜ {w} × {h} px</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedSquares) {
                        setPlacedSquares(prev => prev.map(sq => sq.id === selSquare.id ? {
                          ...sq, fillColor: sq.fillColor === activeColor ? undefined : activeColor
                        } : sq));
                        saveState();
                      }
                    }}
                    className="ml-1 p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title={selSquare.fillColor ? "Toggle/Clear Fill Color" : "Fill Square with Active Color"}
                  >
                    {selSquare.fillColor ? '🎨' : '🪣'}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedSquares) {
                        setPlacedSquares(prev => prev.map(sq => sq.id === selSquare.id ? { ...sq, isBehindPaint: !sq.isBehindPaint } : sq));
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                      selSquare.isBehindPaint
                        ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={selSquare.isBehindPaint ? 'Bring to Front (Draw in front of hand-drawn paint)' : 'Send to Back (Draw behind hand-drawn paint)'}
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{selSquare.isBehindPaint ? 'Front' : 'Back'}</span>
                  </button>
                  <div className="flex items-center space-x-1 border-l border-slate-700/80 pl-1.5 ml-1">
                    <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={selSquare.opacity ?? 1}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const op = parseFloat(e.target.value);
                        if (setPlacedSquares) setPlacedSquares(prev => prev.map(sq => sq.id === selSquare.id ? { ...sq, opacity: op } : sq));
                      }}
                      className="w-12 h-1 accent-purple-500 cursor-pointer"
                      title={`Opacity: ${Math.round((selSquare.opacity ?? 1) * 100)}%`}
                    />
                    <span className="text-[10px] text-purple-300 font-mono w-6 text-right">
                      {Math.round((selSquare.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const copiedSquare: PlacedSquare = {
                        ...selSquare,
                        id: `square_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        x: selSquare.x + 20,
                        y: selSquare.y + 20
                      };
                      if (setPlacedSquares) setPlacedSquares(prev => [...prev, copiedSquare]);
                      if (setSelectedSquareId) setSelectedSquareId(copiedSquare.id);
                    }}
                    className="p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title="Copy Square (Duplicate selected square)"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedSquares) setPlacedSquares(prev => prev.filter(sq => sq.id !== selSquare.id));
                      if (setSelectedSquareId) setSelectedSquareId(null);
                    }}
                    className="p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
                    title="Delete Selected Square (Delete / Backspace)"
                  >
                    🗑️
                  </button>
                </div>
              </>
            );
          })()}

          {/* Layer 5.8.3: Selected Placed Stamp Overlay */}
          {(() => {
            if (!showShapeSelectPanel || !selectedStampId || (activeTool !== 'select' && activeTool !== 'stamp') || !colorCanvasRef.current) return null;
            const selStamp = placedStamps.find(st => st.id === selectedStampId);
            if (!selStamp) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;
            const { cx, cy, size } = selStamp;
            const half = size / 2;
            const x = cx - half;
            const y = cy - half;
            const def = getStampById(selStamp.stampId);
            const stampName = def ? `${def.icon} ${def.name}` : 'Stamp';

            return (
              <>
                <svg
                  viewBox={`0 0 ${cW} ${cH}`}
                  className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible"
                >
                  <rect
                    x={x}
                    y={y}
                    width={size}
                    height={size}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    opacity="0.8"
                  />
                  <circle cx={cx + half} cy={cy + half} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nwse-resize pointer-events-auto" />
                  <circle cx={cx - half} cy={cy - half} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nwse-resize pointer-events-auto" />
                  <circle cx={cx + half} cy={cy - half} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nesw-resize pointer-events-auto" />
                  <circle cx={cx - half} cy={cy + half} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="cursor-nesw-resize pointer-events-auto" />
                </svg>

                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1 rounded-full bg-slate-950/95 border border-purple-500/70 text-xs font-bold text-white shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto"
                  style={{
                    left: `${(cx / cW) * 100}%`,
                    top: `${(y / cH) * 100}%`
                  }}
                >
                  <span className="text-purple-300 font-mono">{stampName} ({size}px)</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedStamps) {
                        setPlacedStamps(prev => prev.map(st => st.id === selStamp.id ? { ...st, color: activeColor, fillColor: activeColor } : st));
                        saveState();
                      }
                    }}
                    className="ml-1 p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title="Recolor Stamp with Active Color"
                  >
                    🎨
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedStamps) {
                        setPlacedStamps(prev => prev.map(st => st.id === selStamp.id ? { ...st, isBehindPaint: !st.isBehindPaint } : st));
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                      selStamp.isBehindPaint
                        ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={selStamp.isBehindPaint ? 'Bring to Front (Draw in front of hand-drawn paint)' : 'Send to Back (Draw behind hand-drawn paint)'}
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{selStamp.isBehindPaint ? 'Front' : 'Back'}</span>
                  </button>
                  <div className="flex items-center space-x-1 border-l border-slate-700/80 pl-1.5 ml-1">
                    <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={selStamp.opacity ?? 1}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const op = parseFloat(e.target.value);
                        if (setPlacedStamps) setPlacedStamps(prev => prev.map(st => st.id === selStamp.id ? { ...st, opacity: op } : st));
                      }}
                      className="w-12 h-1 accent-purple-500 cursor-pointer"
                      title={`Opacity: ${Math.round((selStamp.opacity ?? 1) * 100)}%`}
                    />
                    <span className="text-[10px] text-purple-300 font-mono w-6 text-right">
                      {Math.round((selStamp.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const copiedStamp: PlacedStamp = {
                        ...selStamp,
                        id: `stamp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        cx: selStamp.cx + 20,
                        cy: selStamp.cy + 20
                      };
                      if (setPlacedStamps) setPlacedStamps(prev => [...prev, copiedStamp]);
                      if (setSelectedStampId) setSelectedStampId(copiedStamp.id);
                    }}
                    className="p-0.5 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded transition cursor-pointer"
                    title="Copy Stamp (Duplicate selected stamp)"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (setPlacedStamps) setPlacedStamps(prev => prev.filter(st => st.id !== selStamp.id));
                      if (setSelectedStampId) setSelectedStampId(null);
                    }}
                    className="p-0.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
                    title="Delete Selected Stamp (Delete / Backspace)"
                  >
                    🗑️
                  </button>
                </div>
              </>
            );
          })()}

          {/* Layer 5.8.4: Selected Placed Speech Bubble Interactive Tail Target */}
          {(() => {
            if (!selectedBubbleId || (activeTool !== 'select' && activeTool !== 'bubble') || !colorCanvasRef.current) return null;
            const selBubble = placedBubbles.find(b => b.id === selectedBubbleId);
            if (!selBubble) return null;

            const cW = colorCanvasRef.current.width;
            const cH = colorCanvasRef.current.height;
            const ctx = bubbleCanvasRef.current?.getContext('2d');
            const bounds = ctx ? getSpeechBubbleBounds(ctx, selBubble.x, selBubble.y, selBubble.options) : { bx: selBubble.x - 60, by: selBubble.y - 30, width: 120, height: 60 };

            const tx = selBubble.tailX !== undefined ? selBubble.tailX : (selBubble.options.tailX !== undefined ? selBubble.options.tailX : selBubble.x - 25);
            const ty = selBubble.tailY !== undefined ? selBubble.tailY : (selBubble.options.tailY !== undefined ? selBubble.options.tailY : selBubble.y + bounds.height / 2 + 25);

            return (
              <svg
                viewBox={`0 0 ${cW} ${cH}`}
                className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible"
              >
                <rect
                  x={bounds.bx}
                  y={bounds.by}
                  width={bounds.width}
                  height={bounds.height}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  opacity="0.8"
                />
                <line
                  x1={selBubble.x}
                  y1={selBubble.y}
                  x2={tx}
                  y2={ty}
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
                <circle
                  cx={tx}
                  cy={ty}
                  r="8"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-crosshair pointer-events-auto shadow-xl"
                />
                <circle
                  cx={tx}
                  cy={ty}
                  r="14"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  opacity="0.5"
                  className="animate-ping"
                />
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Deleted Canvas Overlay Notification */}
      {isDisabled ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center space-y-3 animate-fade-in pointer-events-auto">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center space-y-3 max-w-sm">
            <div className="p-3 bg-purple-950/60 border border-purple-800/50 rounded-2xl text-purple-300">
              <span className="text-3xl leading-none">🎨</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">Canvas Deleted</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This page has been deleted. Click <strong className="text-purple-300">Blank Canvas</strong> in the sidebar to start a new page, or click <strong className="text-slate-300">Back</strong> to return to your library.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
