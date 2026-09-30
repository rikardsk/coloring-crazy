import { StencilDef, ActiveStencilState, BrushStyle } from '../types/coloring';
import { getCustomStencils } from './customStencils';

export const PRESET_STENCILS: StencilDef[] = [
  {
    id: 'star-5',
    name: '5-Point Star',
    category: 'Shapes',
    icon: '⭐',
    svgPath: 'M 100 10 L 126 63 L 185 72 L 142 113 L 152 172 L 100 144 L 48 172 L 58 113 L 15 72 L 74 63 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'heart',
    name: 'Love Heart',
    category: 'Shapes',
    icon: '❤️',
    svgPath: 'M 100 170 C 20 100 20 40 70 30 C 95 25 100 50 100 50 C 100 50 105 25 130 30 C 180 40 180 100 100 170 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'flower-petal',
    name: 'Bloom Flower',
    category: 'Nature',
    icon: '🌸',
    svgPath: 'M 100 60 C 90 20 110 20 100 60 C 140 50 140 70 100 60 C 110 100 90 100 100 60 C 60 70 60 50 100 60 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'Nature',
    icon: '🦋',
    svgPath: 'M 100 100 C 70 40 20 50 40 90 C 10 120 70 150 100 110 C 130 150 190 120 160 90 C 180 50 130 40 100 100 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'shield',
    name: 'Hero Shield',
    category: 'Fun',
    icon: '🛡️',
    svgPath: 'M 100 20 L 160 40 V 100 C 160 140 100 180 100 180 C 100 180 40 140 40 100 V 40 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'cloud',
    name: 'Fluffy Cloud',
    category: 'Nature',
    icon: '☁️',
    svgPath: 'M 40 140 C 20 140 20 110 40 100 C 30 70 70 60 90 80 C 110 50 160 60 160 90 C 180 90 180 140 150 140 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'diamond',
    name: 'Sparkle Diamond',
    category: 'Shapes',
    icon: '💎',
    svgPath: 'M 100 20 L 160 70 L 100 180 L 40 70 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'mandala-sun',
    name: 'Mandala Sunburst',
    category: 'Mandalas',
    icon: '☀️',
    svgPath: 'M 100 40 L 110 70 L 140 60 L 130 90 L 160 100 L 130 110 L 140 140 L 110 130 L 100 160 L 90 130 L 60 140 L 70 110 L 40 100 L 70 90 L 60 60 L 90 70 Z',
    viewBox: '0 0 200 200'
  },
  {
    id: 'spiral-swirl',
    name: 'Cosmic Spiral',
    category: 'Mandalas',
    icon: '🌀',
    svgPath: 'M 100 100 C 105 95 110 100 105 105 C 95 115 85 95 95 85 C 115 65 135 115 115 135 C 75 175 55 75 85 55 C 145 15 175 145 125 165 C 45 195 15 45 75 25 Z',
    viewBox: '0 0 200 200'
  }
];

export function getAllStencils(): StencilDef[] {
  return [...PRESET_STENCILS, ...getCustomStencils()];
}

export function getStencilById(id: string): StencilDef | undefined {
  return getAllStencils().find((s) => s.id === id);
}

export function getInitialStencilState(
  stencilId: string,
  canvasWidth: number,
  canvasHeight: number
): ActiveStencilState {
  return {
    stencilId,
    x: Math.round(canvasWidth / 2),
    y: Math.round(canvasHeight / 2),
    scale: 1.0,
    rotation: 0,
    isInverted: false
  };
}

export function createTransformedStencilPath(
  stencilDef: StencilDef,
  state: ActiveStencilState,
  canvasWidth?: number,
  canvasHeight?: number
): Path2D | null {
  if (typeof Path2D === 'undefined') return null;
  const combined = new Path2D();

  if (state.isInverted && canvasWidth && canvasHeight) {
    combined.rect(0, 0, canvasWidth, canvasHeight);
  }

  const stencilPath = new Path2D(stencilDef.svgPath);
  if (typeof DOMMatrix !== 'undefined') {
    const matrix = new DOMMatrix()
      .translate(state.x, state.y)
      .rotate(state.rotation)
      .scale(state.scale, state.scale)
      .translate(-100, -100);
    combined.addPath(stencilPath, matrix);
  } else {
    combined.addPath(stencilPath);
  }

  return combined;
}

export function applyStencilPathToCtx(
  ctx: CanvasRenderingContext2D,
  pathData: string,
  state: ActiveStencilState
): void {
  if (typeof Path2D === 'undefined') return;
  const dummyDef: StencilDef = { id: '', name: '', category: 'Shapes', icon: '', svgPath: pathData };
  const path = createTransformedStencilPath(dummyDef, state);
  if (!path) return;
  ctx.save();
  ctx.stroke(path);
  ctx.restore();
}

export function setupStencilClipMask(
  ctx: CanvasRenderingContext2D,
  state: ActiveStencilState,
  stencilDef: StencilDef,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!state || !stencilDef || typeof Path2D === 'undefined') return;
  const path = createTransformedStencilPath(stencilDef, state, canvasWidth, canvasHeight);
  if (!path) return;

  ctx.save();
  ctx.clip(path, state.isInverted ? 'evenodd' : 'nonzero');
}

export function strokeStencilOutline(
  ctx: CanvasRenderingContext2D,
  state: ActiveStencilState,
  stencilDef: StencilDef,
  color: string,
  lineWidth: number,
  brushStyle: BrushStyle = 'solid'
): void {
  if (typeof Path2D === 'undefined' || !state || !stencilDef) return;
  const path = new Path2D(stencilDef.svgPath);
  ctx.save();

  const transformed = new Path2D();
  if (typeof DOMMatrix !== 'undefined') {
    const matrix = new DOMMatrix()
      .translate(state.x, state.y)
      .rotate(state.rotation)
      .scale(state.scale, state.scale)
      .translate(-100, -100);
    transformed.addPath(path, matrix);
  } else {
    transformed.addPath(path);
  }

  if (brushStyle === 'neon') {
    ctx.shadowColor = color;
    ctx.shadowBlur = lineWidth * 1.8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(2, lineWidth * 0.4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(transformed);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth * 0.8;
    ctx.globalAlpha = 0.5;
    ctx.stroke(transformed);
  } else if (brushStyle === 'marker') {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth * 1.2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.7;
    ctx.stroke(transformed);
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(transformed);
  }

  ctx.restore();
}
