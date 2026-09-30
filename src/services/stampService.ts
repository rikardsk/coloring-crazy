import { StampDef } from '../types/coloring';

export const BUILTIN_STAMPS: StampDef[] = [
  {
    id: 'star',
    name: 'Star',
    category: 'Shapes',
    icon: '⭐',
    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  },
  {
    id: 'heart',
    name: 'Heart',
    category: 'Shapes',
    icon: '❤️',
    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
  },
  {
    id: 'crown',
    name: 'Crown',
    category: 'Magic',
    icon: '👑',
    svgPath: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    category: 'Nature',
    icon: '☁️',
    svgPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    category: 'Magic',
    icon: '✨',
    svgPath: 'M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z M19 16l1.25 3.75L24 21l-3.75 1.25L19 26l-1.25-3.75L14 21l3.75-1.25z'
  },
  {
    id: 'sun',
    name: 'Sun',
    category: 'Nature',
    icon: '☀️',
    svgPath: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z'
  },
  {
    id: 'moon',
    name: 'Crescent Moon',
    category: 'Nature',
    icon: '🌙',
    svgPath: 'M12.3 2a10 10 0 0 0 9.7 12.6 10 10 0 1 1-12.6-9.7c.9-.3 1.9-.3 2.9-2.9z'
  },
  {
    id: 'lightning',
    name: 'Lightning',
    category: 'Fun',
    icon: '⚡',
    svgPath: 'M7 2v11h3v9l7-12h-4l4-8z'
  },
  {
    id: 'gem',
    name: 'Gem Diamond',
    category: 'Magic',
    icon: '💎',
    svgPath: 'M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z'
  },
  {
    id: 'paw',
    name: 'Paw Print',
    category: 'Fun',
    icon: '🐾',
    svgPath: 'M12 11.5c-2.4 0-4.3 1.6-4.3 3.6 0 2 1.9 3.6 4.3 3.6s4.3-1.6 4.3-3.6c0-2-1.9-3.6-4.3-3.6z M6.8 9.5c.9 0 1.6-.9 1.6-2s-.7-2-1.6-2-1.6.9-1.6 2 .7 2 1.6 2z M10.2 7c.9 0 1.6-.9 1.6-2s-.7-2-1.6-2-1.6.9-1.6 2 .7 2 1.6 2z M13.8 7c.9 0 1.6-.9 1.6-2s-.7-2-1.6-2-1.6.9-1.6 2 .7 2 1.6 2z M17.2 9.5c.9 0 1.6-.9 1.6-2s-.7-2-1.6-2-1.6.9-1.6 2 .7 2 1.6 2z'
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'Nature',
    icon: '🦋',
    svgPath: 'M12 12c-2-3-7-6-9-3s0 7 3 7c2 0 4-2 6-4zm0 0c2-3 7-6 9-3s0 7-3 7c-2 0-4-2-6-4zm0 0c-2 3-5 7-3 8s5 0 6-3c0-2-2-4-3-5zm0 0c2 3 5 7 3 8s-5 0-6-3c0-2 2-4 3-5z'
  },
  {
    id: 'flower',
    name: 'Flower',
    category: 'Nature',
    icon: '🌸',
    svgPath: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0-7.5c-1.9 0-3.5 1.6-3.5 3.5 0 1.2.6 2.3 1.6 2.9-1.5-.4-3.1.1-4 1.4-1.2 1.5-.8 3.6.7 4.7.9.7 2.1.8 3.1.4-.8 1.4-.6 3.1.4 4 1.2 1.2 3.2 1.2 4.4 0 1-1 1.2-2.6.4-4 1 .4 2.2.3 3.1-.4 1.5-1.2 1.9-3.2.7-4.7-.9-1.3-2.5-1.8-4-1.4 1-.6 1.6-1.7 1.6-2.9 0-1.9-1.6-3.5-3.5-3.5z'
  }
];

export function getStampById(id: string): StampDef | undefined {
  return BUILTIN_STAMPS.find(s => s.id === id);
}

export function drawStampShape(
  ctx: CanvasRenderingContext2D,
  stamp: StampDef,
  cx: number,
  cy: number,
  size: number,
  rotation: number = 0,
  color: string,
  fillColor?: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (rotation) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Scale path from viewBox 24x24 centered around (0,0)
  const scale = size / 24;
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);

  const path = new Path2D(stamp.svgPath);

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill(path);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2 / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);

  ctx.restore();
}
