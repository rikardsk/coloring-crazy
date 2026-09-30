import { ProcessingSettings, PageAspectRatio } from '../types/coloring';

export function getCanvasDimensionsForRatio(
  ratio: PageAspectRatio = '1:1',
  naturalWidth?: number,
  naturalHeight?: number
): { width: number; height: number } {
  if (ratio === '1:1') return { width: 800, height: 800 };
  if (ratio === '4:5') return { width: 800, height: 1000 };
  if (ratio === '5:4') return { width: 1000, height: 800 };
  if (ratio === '16:9') return { width: 1200, height: 675 };
  if (ratio === 'auto' && naturalWidth && naturalHeight) {
    const w = Math.min(naturalWidth, 1000);
    const h = Math.round(naturalHeight * (w / naturalWidth));
    return { width: w, height: h };
  }
  return { width: 800, height: 800 };
}

// Convert loaded HTMLImageElement to grayscale buffer
function getGrayscaleData(ctx: CanvasRenderingContext2D, width: number, height: number): Uint8ClampedArray {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const gray = new Uint8ClampedArray(width * height);
  
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

// 3x3 Box Blur smoothing for noise reduction
function blurGrayscale(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += gray[(y + dy) * width + (x + dx)];
        }
      }
      output[y * width + x] = sum / 9;
    }
  }
  return output;
}

// Calculate 2D Summed-Area Table (Integral Image) for fast O(1) local mean calculations
function computeIntegralImage(gray: Uint8ClampedArray, width: number, height: number): Float64Array {
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += gray[y * width + x];
      integral[(y + 1) * (width + 1) + (x + 1)] = integral[y * (width + 1) + (x + 1)] + rowSum;
    }
  }
  return integral;
}

// Box blur using integral image for arbitrary radius in O(1) per pixel
function variableBlurGrayscale(gray: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius <= 0) return gray;
  const output = new Uint8ClampedArray(width * height);
  const integral = computeIntegralImage(gray, width, height);
  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - radius), y2 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - radius), x2 = Math.min(width - 1, x + radius);
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum = integral[(y2 + 1) * (width + 1) + (x2 + 1)]
                - integral[y1 * (width + 1) + (x2 + 1)]
                - integral[(y2 + 1) * (width + 1) + x1]
                + integral[y1 * (width + 1) + x1];
      output[y * width + x] = sum / area;
    }
  }
  return output;
}

// Draw image with scaling, rotation, flip, and offset transformations
function drawTransformedImageToCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  settings: ProcessingSettings
): void {
  const scale = settings.scale ?? 1;
  const rotation = settings.rotation ?? 0;
  const flipH = settings.flipH ? -1 : 1;
  const flipV = settings.flipV ? -1 : 1;
  const offsetX = settings.offsetX ?? 0;
  const offsetY = settings.offsetY ?? 0;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale * flipH, scale * flipV);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// Perform Sobel edge detection pass to produce binary line art ImageData
function createSobelEdgeImageData(
  ctx: CanvasRenderingContext2D,
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  const outputImgData = ctx.createImageData(width, height);
  const outData = outputImgData.data;
  const threshold = Math.max(10, 80 - settings.contrast * 6);
  const thickness = settings.thickness;
  let detectedEdges = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = -gray[idx - width - 1] + gray[idx - width + 1]
               - (thickness * gray[idx - 1]) + (thickness * gray[idx + 1])
               - gray[idx + width - 1] + gray[idx + width + 1];
      const gy = -gray[idx - width - 1] - (thickness * gray[idx - width]) - gray[idx - width + 1]
               + gray[idx + width - 1] + (thickness * gray[idx + width]) + gray[idx + width + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const isEdge = settings.invert ? magnitude < threshold : magnitude > threshold;
      if (isEdge) detectedEdges++;

      const pixelVal = isEdge ? 0 : 255;
      const outIdx = idx * 4;
      outData[outIdx] = outData[outIdx + 1] = outData[outIdx + 2] = pixelVal;
      outData[outIdx + 3] = 255;
    }
  }

  if (detectedEdges < 20) throw new Error('Image conversion produced no visible line art edges.');
  return outputImgData;
}

// ImageMagick Local Adaptive Thresholding (-lat) using Integral Image
function createAdaptiveThresholdImageData(
  ctx: CanvasRenderingContext2D,
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  const outputImgData = ctx.createImageData(width, height);
  const outData = outputImgData.data;
  const integral = computeIntegralImage(gray, width, height);
  const radius = Math.max(2, (settings.thickness || 1) * 3);
  const bias = Math.max(2, (11 - settings.contrast) * 2);
  let detectedEdges = 0;

  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - radius), y2 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - radius), x2 = Math.min(width - 1, x + radius);
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum = integral[(y2 + 1) * (width + 1) + (x2 + 1)]
                - integral[y1 * (width + 1) + (x2 + 1)]
                - integral[(y2 + 1) * (width + 1) + x1]
                + integral[y1 * (width + 1) + x1];
      const mean = sum / area;
      const val = gray[y * width + x];
      const isEdge = settings.invert ? val > (mean - bias) : val < (mean - bias);
      if (isEdge) detectedEdges++;
      const idx = (y * width + x) * 4;
      const pixelVal = isEdge ? 0 : 255;
      outData[idx] = outData[idx + 1] = outData[idx + 2] = pixelVal;
      outData[idx + 3] = 255;
    }
  }
  if (detectedEdges < 20) throw new Error('Adaptive thresholding produced no visible line art.');
  return outputImgData;
}

// ImageMagick Difference of Gaussians (DoG) for bold cartoon outlines
function createDoGImageData(
  ctx: CanvasRenderingContext2D,
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  const r1 = Math.max(1, settings.thickness);
  const r2 = r1 + 3;
  const g1 = variableBlurGrayscale(gray, width, height, r1);
  const g2 = variableBlurGrayscale(gray, width, height, r2);
  const outputImgData = ctx.createImageData(width, height);
  const outData = outputImgData.data;
  const threshold = Math.max(3, 15 - settings.contrast);
  let detectedEdges = 0;

  for (let i = 0; i < gray.length; i++) {
    const diff = g2[i] - g1[i];
    const isEdge = settings.invert ? diff < -threshold : diff > threshold;
    if (isEdge) detectedEdges++;
    const pixelVal = isEdge ? 0 : 255;
    const idx = i * 4;
    outData[idx] = outData[idx + 1] = outData[idx + 2] = pixelVal;
    outData[idx + 3] = 255;
  }
  if (detectedEdges < 20) throw new Error('Difference of Gaussians produced no visible line art.');
  return outputImgData;
}

// Main Photo to Line Art converter supporting Sobel, ImageMagick -lat, and ImageMagick DoG
export function processPhotoToLineArt(
  image: HTMLImageElement,
  settings: ProcessingSettings,
  targetRatio: PageAspectRatio = '1:1'
): string {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) {
    throw new Error('Image dimensions are invalid or image failed to load.');
  }

  const { width, height } = getCanvasDimensionsForRatio(targetRatio, naturalWidth, naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to acquire canvas rendering context.');
  
  drawTransformedImageToCanvas(ctx, image, width, height, settings);
  const rawGray = getGrayscaleData(ctx, width, height);
  const gray = settings.cleanNoise ? blurGrayscale(rawGray, width, height) : rawGray;
  
  let outputImgData: ImageData;
  if (settings.method === 'imagemagick-lat') {
    outputImgData = createAdaptiveThresholdImageData(ctx, gray, width, height, settings);
  } else if (settings.method === 'imagemagick-dog') {
    outputImgData = createDoGImageData(ctx, gray, width, height, settings);
  } else {
    outputImgData = createSobelEdgeImageData(ctx, gray, width, height, settings);
  }

  ctx.putImageData(outputImgData, 0, 0);
  return canvas.toDataURL('image/png');
}
