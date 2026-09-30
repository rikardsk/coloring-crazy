import { RGBA, hexToRgba } from './floodFill';
import { TextureStyle, GradientOptions } from '../types/coloring';

/**
 * Linearly interpolates between color1 and color2 at parameter t (0.0 to 1.0).
 */
export function interpolateColor(color1: RGBA, color2: RGBA, t: number): RGBA {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(color1.r + clampT * (color2.r - color1.r)),
    g: Math.round(color1.g + clampT * (color2.g - color1.g)),
    b: Math.round(color1.b + clampT * (color2.b - color1.b)),
    a: Math.round(color1.a + clampT * (color2.a - color1.a))
  };
}

/**
 * Calculates linear gradient fraction t (0..1) for pixel (x,y) within bounding box at angleDeg.
 */
export function computeLinearGradientFactor(
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  angleDeg: number
): number {
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const rad = (angleDeg * Math.PI) / 180;

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Normalized pixel offset from center
  const cx = minX + width / 2;
  const cy = minY + height / 2;

  const dx = x - cx;
  const dy = y - cy;

  const proj = dx * cos + dy * sin;
  const halfSpan = (Math.abs(width * cos) + Math.abs(height * sin)) / 2;

  if (halfSpan <= 0) return 0;
  return Math.max(0, Math.min(1, (proj + halfSpan) / (halfSpan * 2)));
}

/**
 * Calculates radial gradient fraction t (0..1) from center to outer edge of bounding box.
 */
export function computeRadialGradientFactor(
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): number {
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(1, (maxX - minX) / 2);
  const ry = Math.max(1, (maxY - minY) / 2);

  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;

  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, Math.min(1, dist));
}

/**
 * Calculates spiral gradient fraction t (0..1) from center outwards winding around angle.
 */
export function computeSpiralGradientFactor(
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  angleDeg: number = 0
): number {
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(1, (maxX - minX) / 2);
  const ry = Math.max(1, (maxY - minY) / 2);

  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const r = Math.sqrt(dx * dx + dy * dy);

  let angle = Math.atan2(dy, dx) - (angleDeg * Math.PI) / 180;
  angle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

  const turns = 3;
  const spiralVal = r * turns - angle / (2 * Math.PI);
  const normalized = (spiralVal % 1 + 1) % 1;
  return Math.abs(normalized * 2 - 1);
}

/**
 * Applies procedural texture effect onto a base pixel color.
 */
export function applyTextureEffect(
  x: number,
  y: number,
  baseColor: RGBA,
  style: TextureStyle,
  scale: number = 1.0,
  opacity: number = 0.5
): RGBA {
  const effScale = Math.max(0.2, scale);
  let factor = 1.0;

  if (style === 'noise') {
    // Pseudo-random deterministic noise hash
    const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const noiseVal = hash - Math.floor(hash); // 0..1
    factor = 1.0 + (noiseVal - 0.5) * 0.4 * opacity;
  } else if (style === 'halftone') {
    const gridX = (x * effScale) % 12;
    const gridY = (y * effScale) % 12;
    const distFromCellCenter = Math.sqrt((gridX - 6) ** 2 + (gridY - 6) ** 2);
    if (distFromCellCenter < 3.5) {
      factor = 1.0 - 0.45 * opacity;
    }
  } else if (style === 'hatch') {
    const lineVal = Math.abs((x + y) * effScale) % 12;
    if (lineVal < 2.5) {
      factor = 1.0 - 0.4 * opacity;
    }
  } else if (style === 'linen') {
    const lineX = Math.abs(x * effScale) % 8 < 1.5;
    const lineY = Math.abs(y * effScale) % 8 < 1.5;
    if (lineX || lineY) {
      factor = 1.0 - 0.3 * opacity;
    }
  } else if (style === 'glitter') {
    const hash = Math.abs(Math.sin(x * 37.1 + y * 91.7) * 10000) % 1;
    if (hash > 0.94) {
      // Bright sparkling dot
      return {
        r: Math.min(255, Math.round(baseColor.r + 120 * opacity)),
        g: Math.min(255, Math.round(baseColor.g + 120 * opacity)),
        b: Math.min(255, Math.round(baseColor.b + 120 * opacity)),
        a: baseColor.a
      };
    }
  }

  return {
    r: Math.max(0, Math.min(255, Math.round(baseColor.r * factor))),
    g: Math.max(0, Math.min(255, Math.round(baseColor.g * factor))),
    b: Math.max(0, Math.min(255, Math.round(baseColor.b * factor))),
    a: baseColor.a
  };
}

/**
 * Calculates final pixel color for flood fill given gradient & texture options.
 */
export function calculateFilledPixelColor(
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  color1Hex: string,
  options?: GradientOptions
): RGBA {
  const color1 = hexToRgba(color1Hex);

  if (!options || options.mode === 'solid') {
    return color1;
  }

  const color2 = hexToRgba(options.color2 || '#FFFFFF');
  let blendedColor = color1;

  if (options.mode === 'linear-gradient') {
    const t = computeLinearGradientFactor(x, y, minX, minY, maxX, maxY, options.angle || 0);
    blendedColor = interpolateColor(color1, color2, t);
  } else if (options.mode === 'radial-gradient') {
    const t = computeRadialGradientFactor(x, y, minX, minY, maxX, maxY);
    blendedColor = interpolateColor(color1, color2, t);
  } else if (options.mode === 'spiral-gradient') {
    const t = computeSpiralGradientFactor(x, y, minX, minY, maxX, maxY, options.angle || 0);
    blendedColor = interpolateColor(color1, color2, t);
  } else if (options.mode === 'texture') {
    blendedColor = applyTextureEffect(
      x,
      y,
      color1,
      options.textureStyle || 'noise',
      options.textureScale || 1.0,
      options.textureOpacity || 0.5
    );
  }

  return blendedColor;
}
