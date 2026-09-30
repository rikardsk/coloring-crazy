import { BrushStyle } from '../types/coloring';

export interface Point {
  x: number;
  y: number;
}

export function getMidPoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

export function drawSolidLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

export function drawCrayonLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const steps = Math.max(1, Math.floor(dist / 2));
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = p1.x + (p2.x - p1.x) * t;
    const cy = p1.y + (p2.y - p1.y) * t;
    const dots = Math.max(4, Math.floor(size * 1.5));
    for (let d = 0; d < dots; d++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (size / 2);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const dotRadius = Math.random() * 1.2 + 0.5;
      ctx.globalAlpha = Math.random() * 0.4 + 0.3;
      ctx.beginPath();
      ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawPencilLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.6);
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Subtle graphite texture jitter line
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = Math.max(1, size * 0.3);
  ctx.beginPath();
  ctx.moveTo(p1.x + (Math.random() - 0.5), p1.y + (Math.random() - 0.5));
  ctx.lineTo(p2.x + (Math.random() - 0.5), p2.y + (Math.random() - 0.5));
  ctx.stroke();
  ctx.restore();
}

export function drawMarkerLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 1.2;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

export function drawNeonLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 1.8;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2, size * 0.4);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.8;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.restore();
}

export function drawGlitterLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  drawSolidLine(ctx, p1, p2, color, size * 0.5);

  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const sparkles = Math.max(1, Math.floor(dist / 8));
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < sparkles; i++) {
    const t = Math.random();
    const sx = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * size;
    const sy = p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * size;
    const sparkleSize = Math.random() * 3 + 2;
    ctx.beginPath();
    ctx.arc(sx, sy, sparkleSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSprayLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number
): void {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const steps = Math.max(1, Math.floor(dist / 3));
  const density = Math.max(12, Math.floor(size * 2.5));
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = p1.x + (p2.x - p1.x) * t;
    const cy = p1.y + (p2.y - p1.y) * t;
    for (let d = 0; d < density; d++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (size / 2);
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      ctx.globalAlpha = Math.random() * 0.35 + 0.1;
      const dotRadius = Math.random() * 1.2 + 0.4;
      ctx.beginPath();
      ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Paints a smooth Archimedean spiral centered at (cx, cy) using the active brush style and size.
 */
export function drawArchimedeanSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  turns: number = 3,
  color: string,
  brushSize: number,
  brushStyle: BrushStyle = 'solid'
): void {
  const totalAngle = turns * Math.PI * 2;
  const steps = Math.max(50, Math.floor(totalAngle * 15));
  let prevPoint: Point | null = null;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const currentAngle = t * totalAngle;
    const currentRadius = t * radius;

    const px = cx + Math.cos(currentAngle) * currentRadius;
    const py = cy + Math.sin(currentAngle) * currentRadius;
    const currentPoint = { x: px, y: py };

    if (prevPoint) {
      renderBrushStroke(ctx, prevPoint, currentPoint, color, brushSize, brushStyle);
    }
    prevPoint = currentPoint;
  }
}

export function drawCircleShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  brushSize: number,
  brushStyle: BrushStyle = 'solid',
  fillColor?: string
): void {
  if (fillColor && fillColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const steps = Math.max(36, Math.floor((Math.PI * 2 * radius) / 4));
  let prevPoint: Point | null = null;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const currentPoint = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    if (prevPoint) {
      renderBrushStroke(ctx, prevPoint, currentPoint, color, brushSize, brushStyle);
    }
    prevPoint = currentPoint;
  }
}

export function drawSquareShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  brushSize: number,
  brushStyle: BrushStyle = 'solid',
  fillColor?: string
): void {
  if (fillColor && fillColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }
  const corners: Point[] = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
    { x, y }
  ];
  for (let i = 0; i < 4; i++) {
    renderBrushStroke(ctx, corners[i], corners[i + 1], color, brushSize, brushStyle);
  }
}

export function renderBrushStroke(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  size: number,
  style: BrushStyle
): void {
  if (style === 'crayon') {
    drawCrayonLine(ctx, p1, p2, color, size);
    return;
  }
  if (style === 'pencil') {
    drawPencilLine(ctx, p1, p2, color, size);
    return;
  }
  if (style === 'marker') {
    drawMarkerLine(ctx, p1, p2, color, size);
    return;
  }
  if (style === 'neon') {
    drawNeonLine(ctx, p1, p2, color, size);
    return;
  }
  if (style === 'glitter') {
    drawGlitterLine(ctx, p1, p2, color, size);
    return;
  }
  if (style === 'spray') {
    drawSprayLine(ctx, p1, p2, color, size);
    return;
  }
  drawSolidLine(ctx, p1, p2, color, size);
}
