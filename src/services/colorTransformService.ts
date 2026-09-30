export interface ColorTransformOptions {
  targetColor: string;
  replacementColor?: string;
  colorTolerance: number; // 0 to 60
  scale: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  offsetX: number;
  offsetY: number;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function getHueAndSat(r: number, g: number, b: number): { h: number; s: number } {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const d = max - min;
  if (d === 0) return { h: 0, s: 0 };

  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max === rN) {
    h = (gN - bN) / d + (gN < bN ? 6 : 0);
  } else if (max === gN) {
    h = (bN - rN) / d + 2;
  } else {
    h = (rN - gN) / d + 4;
  }
  return { h: h * 60, s };
}

export function isMatchingColor(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  tolerance: number
): boolean {
  if (tolerance === 0) {
    return r1 === r2 && g1 === g2 && b1 === b2;
  }

  const dist = colorDistance(r1, g1, b1, r2, g2, b2);
  const threshold = (tolerance / 60) * 280;
  if (dist <= threshold) return true;

  const targetHs = getHueAndSat(r2, g2, b2);
  if (targetHs.s < 0.15) return false;

  const pixelHs = getHueAndSat(r1, g1, b1);
  if (pixelHs.s < 0.08) return false;

  const diff = Math.abs(pixelHs.h - targetHs.h);
  const hueDist = Math.min(diff, 360 - diff);
  const maxHueDist = 15 + (tolerance / 60) * 25;
  return hueDist <= maxHueDist;
}

function hasDeletedNeighbor(
  isDeleted: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      if (nx >= 0 && nx < width && isDeleted[ny * width + nx]) return true;
    }
  }
  return false;
}

function isFringeMatch(
  r: number,
  g: number,
  b: number,
  targetRgb: { r: number; g: number; b: number },
  fringeTol: number,
  targetHs: { h: number; s: number }
): boolean {
  if (isMatchingColor(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b, fringeTol)) {
    return true;
  }
  if (targetHs.s < 0.15) return false;

  const pHs = getHueAndSat(r, g, b);
  const diff = Math.abs(pHs.h - targetHs.h);
  return Math.min(diff, 360 - diff) <= 45;
}

function cleanAntiAliasFringes(
  outData: Uint8ClampedArray,
  isDeleted: Uint8Array,
  width: number,
  height: number,
  targetRgb: { r: number; g: number; b: number },
  tolerance: number
): void {
  const fringeTol = tolerance === 0 ? 0 : Math.min(60, tolerance + 25);
  const targetHs = getHueAndSat(targetRgb.r, targetRgb.g, targetRgb.b);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      if (isDeleted[pIdx]) continue;

      const i = pIdx * 4;
      if (outData[i + 3] === 0) continue;

      if (!hasDeletedNeighbor(isDeleted, x, y, width, height)) continue;

      const r = outData[i], g = outData[i + 1], b = outData[i + 2];
      if (isFringeMatch(r, g, b, targetRgb, fringeTol, targetHs)) {
        outData[i] = 0; outData[i + 1] = 0; outData[i + 2] = 0; outData[i + 3] = 0;
      }
    }
  }
}

export function deleteSingleColor(
  sourceImgData: ImageData,
  width: number,
  height: number,
  targetColor: string,
  tolerance: number
): ImageData {
  const targetRgb = hexToRgb(targetColor);
  if (!targetRgb) return sourceImgData;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceImgData;

  const outImgData = outCtx.createImageData(width, height);
  const srcData = sourceImgData.data;
  const outData = outImgData.data;
  const isDeleted = new Uint8Array(width * height);

  for (let i = 0; i < srcData.length; i += 4) {
    if (srcData[i + 3] === 0) continue;
    const r = srcData[i], g = srcData[i + 1], b = srcData[i + 2];
    if (isMatchingColor(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b, tolerance)) {
      isDeleted[i / 4] = 1;
      continue;
    }
    outData[i] = r; outData[i + 1] = g; outData[i + 2] = b; outData[i + 3] = srcData[i + 3];
  }

  cleanAntiAliasFringes(outData, isDeleted, width, height, targetRgb, tolerance);
  return outImgData;
}

function separateCanvasData(
  srcData: Uint8ClampedArray,
  bgData: Uint8ClampedArray,
  fgData: Uint8ClampedArray,
  targetRgb: { r: number; g: number; b: number },
  replaceRgb: { r: number; g: number; b: number } | null,
  options: ColorTransformOptions
): void {
  const len = srcData.length;
  for (let i = 0; i < len; i += 4) {
    const a = srcData[i + 3];
    if (a === 0) continue;

    const r = srcData[i], g = srcData[i + 1], b = srcData[i + 2];
    const isMatch = isMatchingColor(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b, options.colorTolerance);

    if (isMatch) {
      fgData[i] = replaceRgb ? replaceRgb.r : r;
      fgData[i + 1] = replaceRgb ? replaceRgb.g : g;
      fgData[i + 2] = replaceRgb ? replaceRgb.b : b;
      fgData[i + 3] = a;
    } else {
      bgData[i] = r; bgData[i + 1] = g; bgData[i + 2] = b; bgData[i + 3] = a;
    }
  }
}

function renderTransformedForeground(
  outCtx: CanvasRenderingContext2D,
  bgCanvas: HTMLCanvasElement,
  fgCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  options: ColorTransformOptions
): void {
  outCtx.drawImage(bgCanvas, 0, 0);

  const scale = options.scale ?? 1;
  const rotation = options.rotation ?? 0;
  const flipH = options.flipH ? -1 : 1;
  const flipV = options.flipV ? -1 : 1;
  const offsetX = options.offsetX ?? 0;
  const offsetY = options.offsetY ?? 0;

  outCtx.save();
  outCtx.translate(width / 2 + offsetX, height / 2 + offsetY);
  outCtx.rotate((rotation * Math.PI) / 180);
  outCtx.scale(scale * flipH, scale * flipV);
  outCtx.drawImage(fgCanvas, -width / 2, -height / 2);
  outCtx.restore();
}

export function transformSingleColor(
  sourceImgData: ImageData,
  width: number,
  height: number,
  options: ColorTransformOptions
): ImageData {
  const targetRgb = hexToRgb(options.targetColor);
  if (!targetRgb) return sourceImgData;

  const replaceRgb = options.replacementColor ? hexToRgb(options.replacementColor) : null;
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width; bgCanvas.height = height;
  const bgCtx = bgCanvas.getContext('2d');
  if (!bgCtx) return sourceImgData;

  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = width; fgCanvas.height = height;
  const fgCtx = fgCanvas.getContext('2d');
  if (!fgCtx) return sourceImgData;

  const bgImgData = bgCtx.createImageData(width, height);
  const fgImgData = fgCtx.createImageData(width, height);
  separateCanvasData(sourceImgData.data, bgImgData.data, fgImgData.data, targetRgb, replaceRgb, options);

  bgCtx.putImageData(bgImgData, 0, 0);
  fgCtx.putImageData(fgImgData, 0, 0);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width; outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceImgData;

  renderTransformedForeground(outCtx, bgCanvas, fgCanvas, width, height, options);
  return outCtx.getImageData(0, 0, width, height);
}
