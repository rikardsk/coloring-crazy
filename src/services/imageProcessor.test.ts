import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { processPhotoToLineArt, getCanvasDimensionsForRatio } from './imageProcessor';
import { ProcessingSettings } from '../types/coloring';

function setupCanvasMock() {
  const width = 800;
  const height = 800;
  const dummyGrayData = new Uint8ClampedArray(width * height * 4);
  
  // Fill with dummy pixels including contrast gradient so edges are detected
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const val = (x > 200 && x < 600 && y > 200 && y < 600) ? 0 : 255;
      dummyGrayData[idx] = val;
      dummyGrayData[idx + 1] = val;
      dummyGrayData[idx + 2] = val;
      dummyGrayData[idx + 3] = 255;
    }
  }

  const mockCtx = {
    fillStyle: '',
    fillRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: () => {},
    getImageData: () => ({
      data: dummyGrayData,
      width,
      height
    }),
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h
    }),
    putImageData: () => {}
  };

  HTMLCanvasElement.prototype.getContext = function () {
    return mockCtx as any;
  };
  HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/png;base64,mockdataurl';
  };
}

function createMockImage(): HTMLImageElement {
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: 800 });
  Object.defineProperty(img, 'naturalHeight', { value: 800 });
  return img;
}

describe('imageProcessor transformation tests', () => {
  let mockImg: HTMLImageElement;
  const baseSettings: ProcessingSettings = {
    contrast: 5,
    thickness: 2,
    invert: false,
    cleanNoise: false
  };

  beforeAll(() => {
    setupCanvasMock();
  });

  beforeEach(() => {
    mockImg = createMockImage();
  });

  it('calculates canvas dimensions for different aspect ratios', () => {
    expect(getCanvasDimensionsForRatio('1:1')).toEqual({ width: 800, height: 800 });
    expect(getCanvasDimensionsForRatio('4:5')).toEqual({ width: 800, height: 1000 });
    expect(getCanvasDimensionsForRatio('5:4')).toEqual({ width: 1000, height: 800 });
    expect(getCanvasDimensionsForRatio('16:9')).toEqual({ width: 1200, height: 675 });
  });

  it('processes image with scaling up and down', () => {
    const scaledUp = processPhotoToLineArt(mockImg, { ...baseSettings, scale: 1.5 });
    const scaledDown = processPhotoToLineArt(mockImg, { ...baseSettings, scale: 0.5 });
    expect(scaledUp).toContain('data:image/png');
    expect(scaledDown).toContain('data:image/png');
  });

  it('processes image with rotation degrees', () => {
    const rotated90 = processPhotoToLineArt(mockImg, { ...baseSettings, rotation: 90 });
    const rotated180 = processPhotoToLineArt(mockImg, { ...baseSettings, rotation: 180 });
    expect(rotated90).toContain('data:image/png');
    expect(rotated180).toContain('data:image/png');
  });

  it('processes image with horizontal and vertical flips', () => {
    const flippedH = processPhotoToLineArt(mockImg, { ...baseSettings, flipH: true });
    const flippedV = processPhotoToLineArt(mockImg, { ...baseSettings, flipV: true });
    expect(flippedH).toContain('data:image/png');
    expect(flippedV).toContain('data:image/png');
  });

  it('processes image with position offset X and Y', () => {
    const moved = processPhotoToLineArt(mockImg, {
      ...baseSettings,
      scale: 1.2,
      rotation: 45,
      flipH: true,
      offsetX: 20,
      offsetY: -30
    });
    expect(moved).toContain('data:image/png');
  });

  it('supports Sobel edge extraction method', () => {
    const res = processPhotoToLineArt(mockImg, { ...baseSettings, method: 'sobel' });
    expect(res).toContain('data:image/png');
  });

  it('supports ImageMagick Adaptive Threshold (-lat) extraction method', () => {
    const res = processPhotoToLineArt(mockImg, { ...baseSettings, method: 'imagemagick-lat' });
    expect(res).toContain('data:image/png');
  });

  it('supports ImageMagick Difference of Gaussians (DoG) extraction method', () => {
    const res = processPhotoToLineArt(mockImg, { ...baseSettings, method: 'imagemagick-dog' });
    expect(res).toContain('data:image/png');
  });
});
