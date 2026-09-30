import { ActiveStencilState, StencilDef, GradientOptions } from '../types/coloring';
import { setupStencilClipMask } from './stencilService';
import { calculateFilledPixelColor } from './gradientService';

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Convert Hex string (#RRGGBB) to RGBA object
export function hexToRgba(hex: string, alpha: number = 255): RGBA {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: alpha
  };
}

// Helper to check if a pixel is uncolored (either transparent or white paper background)
export function isUncoloredPixel(data: Uint8ClampedArray, idx: number): boolean {
  const alpha = data[idx + 3];
  if (alpha < 30) return true; // Transparent
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  return r >= 235 && g >= 235 && b >= 235; // White paper
}

// Color matching helper considering tolerance & uncolored background blending
export function colorsMatch(
  data: Uint8ClampedArray,
  idx: number,
  target: RGBA,
  tolerance: number
): boolean {
  const targetIsUncolored = target.a < 30 || (target.r >= 235 && target.g >= 235 && target.b >= 235);
  if (targetIsUncolored) {
    return isUncoloredPixel(data, idx);
  }

  const dr = Math.abs(data[idx] - target.r);
  const dg = Math.abs(data[idx + 1] - target.g);
  const db = Math.abs(data[idx + 2] - target.b);
  const da = Math.abs(data[idx + 3] - target.a);
  return dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance;
}

// Helper to identify if a pixel is a black/dark line art boundary wall
export function isBlackLineBoundary(data: Uint8ClampedArray, idx: number): boolean {
  const alpha = data[idx + 3];
  if (alpha < 30) return false;
  const luminance = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  return luminance < 140;
}

// Create stencil mask alpha map for flood fill clipping
export function createStencilMaskData(
  width: number,
  height: number,
  stencilState?: ActiveStencilState | null,
  stencilDef?: StencilDef
): Uint8ClampedArray | null {
  if (!stencilState || !stencilDef || typeof document === 'undefined') return null;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return null;

  setupStencilClipMask(maskCtx, stencilState, stencilDef, width, height);
  maskCtx.fillStyle = '#FFFFFF';
  maskCtx.fillRect(0, 0, width, height);
  maskCtx.restore();
  return maskCtx.getImageData(0, 0, width, height).data;
}

// BFS flood fill loop bounded by line art outlines and stencil mask
function runFillLoop(
  colorData: Uint8ClampedArray,
  lineData: Uint8ClampedArray | null,
  stencilMask: Uint8ClampedArray | null,
  width: number,
  height: number,
  startX: number,
  startY: number,
  targetColor: RGBA,
  fillColorHex: string,
  tolerance: number,
  gradientOptions?: GradientOptions,
  overlayData?: Uint8ClampedArray | null
): void {
  const pixelStack: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);
  const fillColor = hexToRgba(fillColorHex);

  const isGradientOrTexture = gradientOptions && gradientOptions.mode !== 'solid';
  const filledPixels: [number, number][] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  while (pixelStack.length > 0) {
    const pop = pixelStack.pop();
    if (!pop) break;
    const [x, y] = pop;
    const currentIdx = (y * width + x) * 4;
    const visitedIdx = y * width + x;

    if (visited[visitedIdx]) continue;
    visited[visitedIdx] = 1;

    if (stencilMask && stencilMask[currentIdx + 3] === 0) continue;
    if (lineData && isBlackLineBoundary(lineData, currentIdx)) continue;
    if (overlayData && overlayData[currentIdx + 3] >= 30) continue;
    if (!colorsMatch(colorData, currentIdx, targetColor, tolerance)) continue;

    if (isGradientOrTexture) {
      filledPixels.push([x, y]);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      colorData[currentIdx] = fillColor.r;
      colorData[currentIdx + 1] = fillColor.g;
      colorData[currentIdx + 2] = fillColor.b;
      colorData[currentIdx + 3] = fillColor.a;
    }

    if (x > 0) pixelStack.push([x - 1, y]);
    if (x < width - 1) pixelStack.push([x + 1, y]);
    if (y > 0) pixelStack.push([x, y - 1]);
    if (y < height - 1) pixelStack.push([x, y + 1]);
  }

  // Second pass for Gradient & Texture fill
  if (isGradientOrTexture && filledPixels.length > 0) {
    for (let i = 0; i < filledPixels.length; i++) {
      const [px, py] = filledPixels[i];
      const currentIdx = (py * width + px) * 4;
      const pxColor = calculateFilledPixelColor(px, py, minX, minY, maxX, maxY, fillColorHex, gradientOptions);
      colorData[currentIdx] = pxColor.r;
      colorData[currentIdx + 1] = pxColor.g;
      colorData[currentIdx + 2] = pxColor.b;
      colorData[currentIdx + 3] = pxColor.a;
    }
  }
}

// Stack-based BFS flood fill algorithm bounded by line art outlines, stencil masks & vector overlay shapes
export function performFloodFill(
  colorCtx: CanvasRenderingContext2D,
  lineCtx: CanvasRenderingContext2D | null,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 32,
  stencilState?: ActiveStencilState | null,
  stencilDef?: StencilDef,
  gradientOptions?: GradientOptions,
  overlayCtx?: CanvasRenderingContext2D | null
): void {
  const width = colorCtx.canvas.width;
  const height = colorCtx.canvas.height;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const colorImgData = colorCtx.getImageData(0, 0, width, height);
  const lineImgData = lineCtx ? lineCtx.getImageData(0, 0, width, height) : null;
  const overlayImgData = overlayCtx ? overlayCtx.getImageData(0, 0, width, height) : null;
  const stencilMask = createStencilMaskData(width, height, stencilState, stencilDef);

  const startIdx = (startY * width + startX) * 4;
  if (lineImgData && isBlackLineBoundary(lineImgData.data, startIdx)) return;
  if (overlayImgData && overlayImgData.data[startIdx + 3] >= 30) return;
  if (stencilMask && stencilMask[startIdx + 3] === 0) return;

  const targetColor: RGBA = {
    r: colorImgData.data[startIdx],
    g: colorImgData.data[startIdx + 1],
    b: colorImgData.data[startIdx + 2],
    a: colorImgData.data[startIdx + 3]
  };

  runFillLoop(
    colorImgData.data,
    lineImgData?.data || null,
    stencilMask,
    width,
    height,
    startX,
    startY,
    targetColor,
    fillColorHex,
    tolerance,
    gradientOptions,
    overlayImgData?.data || null
  );
  colorCtx.putImageData(colorImgData, 0, 0);
}
