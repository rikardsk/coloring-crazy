import { CanvasTransform } from '../types/coloring';

export const DEFAULT_CANVAS_TRANSFORM: CanvasTransform = {
  scale: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
  offsetX: 0,
  offsetY: 0,
  targetMode: 'all',
  targetColor: '#ff0000',
  replacementColor: '',
  colorTolerance: 20
};

export function clampScale(scale: number, min = 0.5, max = 3.0): number {
  return Math.min(max, Math.max(min, Number(scale.toFixed(2))));
}

export function rotateDegrees(current: number, deltaDegrees: number): number {
  const next = (current + deltaDegrees) % 360;
  return next < 0 ? next + 360 : next;
}

export function buildPaperTransformCss(pan: { x: number; y: number }, zoom: number): string {
  return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}

export function buildDrawingTransformCss(transform?: Partial<CanvasTransform>): string {
  if (transform?.targetMode === 'color') {
    return 'translate(0px, 0px) scale(1, 1) rotate(0deg)';
  }
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const flipH = transform?.flipH ? -1 : 1;
  const flipV = transform?.flipV ? -1 : 1;
  const offsetX = transform?.offsetX ?? 0;
  const offsetY = transform?.offsetY ?? 0;

  const scaleX = Number((scale * flipH).toFixed(4));
  const scaleY = Number((scale * flipV).toFixed(4));

  return `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
}

export function buildTransformCssString(
  pan: { x: number; y: number },
  zoom: number,
  transform?: Partial<CanvasTransform>
): string {
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const flipH = transform?.flipH ? -1 : 1;
  const flipV = transform?.flipV ? -1 : 1;
  const offsetX = transform?.offsetX ?? 0;
  const offsetY = transform?.offsetY ?? 0;

  const totalX = pan.x + offsetX;
  const totalY = pan.y + offsetY;
  const scaleX = Number((zoom * scale * flipH).toFixed(4));
  const scaleY = Number((zoom * scale * flipV).toFixed(4));

  return `translate(${totalX}px, ${totalY}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
}

export function getTransformedCanvasPoint(
  clientX: number,
  clientY: number,
  paperRect: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  transform?: Partial<CanvasTransform>
): { x: number; y: number } {
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const flipH = transform?.flipH ? -1 : 1;
  const flipV = transform?.flipV ? -1 : 1;
  const offsetX = transform?.offsetX ?? 0;
  const offsetY = transform?.offsetY ?? 0;

  const paperCenterX = paperRect.left + paperRect.width / 2;
  const paperCenterY = paperRect.top + paperRect.height / 2;

  let dx = (clientX - paperCenterX) / (zoom || 1);
  let dy = (clientY - paperCenterY) / (zoom || 1);

  dx -= offsetX;
  dy -= offsetY;

  const rad = (-rotation * Math.PI) / 180;
  const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const unscaleX = unrotX / (scale * flipH);
  const unscaleY = unrotY / (scale * flipV);

  return {
    x: Math.round(unscaleX + canvasWidth / 2),
    y: Math.round(unscaleY + canvasHeight / 2)
  };
}

export interface LinePoint {
  x: number;
  y: number;
}

export interface LineAngleResult {
  angle: number;
  length: number;
  end: LinePoint;
}

export function calculateLineAngleAndEnd(
  start: LinePoint,
  rawEnd: LinePoint,
  snap15: boolean = false
): LineAngleResult {
  const dx = rawEnd.x - start.x;
  const dy = rawEnd.y - start.y;
  const length = Math.round(Math.hypot(dx, dy));
  let angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

  if (snap15) {
    angle = (Math.round(angle / 15) * 15) % 360;
    const rad = (angle * Math.PI) / 180;
    return {
      angle: Math.round(angle),
      length,
      end: {
        x: Math.round(start.x + length * Math.cos(rad)),
        y: Math.round(start.y + length * Math.sin(rad))
      }
    };
  }

  return {
    angle: Math.round(angle),
    length,
    end: { x: Math.round(rawEnd.x), y: Math.round(rawEnd.y) }
  };
}

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

export function isPointInSpiral(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  const dist = Math.hypot(px - cx, py - cy);
  return dist <= Math.max(14, radius + 8);
}

export function isPointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  const dist = Math.hypot(px - cx, py - cy);
  return dist <= Math.max(14, radius + 8);
}

export function isPointInSquare(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  const minX = Math.min(x, x + width) - 8;
  const maxX = Math.max(x, x + width) + 8;
  const minY = Math.min(y, y + height) - 8;
  const maxY = Math.max(y, y + height) + 8;
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}
