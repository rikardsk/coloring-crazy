import { describe, it, expect, vi } from 'vitest';
import { hexToRgb, colorDistance, isMatchingColor, transformSingleColor, deleteSingleColor } from './colorTransformService';

describe('colorTransformService tests', () => {
  it('parses hex to RGB correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#123')).toEqual({ r: 17, g: 34, b: 51 });
    expect(hexToRgb('invalid')).toBeNull();
  });

  it('calculates color distance correctly', () => {
    const dist = colorDistance(0, 0, 0, 255, 0, 0);
    expect(dist).toBe(255);
  });

  it('determines matching color within tolerance and hue tint matching', () => {
    expect(isMatchingColor(255, 0, 0, 255, 0, 0, 0)).toBe(true);
    expect(isMatchingColor(255, 0, 0, 250, 0, 0, 5)).toBe(true);
    expect(isMatchingColor(255, 0, 0, 0, 255, 0, 10)).toBe(false);
    // Light pinkish red (255, 120, 120) matches Red target (255, 0, 0)
    expect(isMatchingColor(255, 120, 120, 255, 0, 0, 20)).toBe(true);
  });

  it('transforms single color in ImageData', () => {
    const data = new Uint8ClampedArray(8);
    data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255;
    data[4] = 0; data[5] = 0; data[6] = 255; data[7] = 255;

    const imgData = { width: 2, height: 1, data } as ImageData;
    const mockCtx: any = {
      createImageData: (w: number, h: number) => ({
        width: w, height: h, data: new Uint8ClampedArray(w * h * 4)
      }),
      putImageData: vi.fn(), drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(), getImageData: () => imgData
    };

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return { width: 2, height: 1, getContext: () => mockCtx } as any;
      }
      return origCreateElement(tagName);
    });

    const result = transformSingleColor(imgData, 2, 1, {
      targetColor: '#ff0000', replacementColor: '#00ff00', colorTolerance: 10,
      scale: 1, rotation: 0, flipH: false, flipV: false, offsetX: 0, offsetY: 0
    });

    expect(result).toBeDefined();
    vi.restoreAllMocks();
  });

  it('deletes single color and removes anti-aliased edge traces', () => {
    // 3x1 ImageData: Pixel 0 is Red (#ff0000), Pixel 1 is adjacent light pink fringe (255, 180, 180), Pixel 2 is Blue (#0000ff)
    const data = new Uint8ClampedArray(12);
    // Pixel 0: Red
    data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255;
    // Pixel 1: Light pink fringe adjacent to red
    data[4] = 255; data[5] = 180; data[6] = 180; data[7] = 255;
    // Pixel 2: Blue
    data[8] = 0; data[9] = 0; data[10] = 255; data[11] = 255;

    const imgData = { width: 3, height: 1, data } as ImageData;
    const mockCtx: any = {
      createImageData: (w: number, h: number) => ({
        width: w, height: h, data: new Uint8ClampedArray(w * h * 4)
      })
    };

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return { width: 3, height: 1, getContext: () => mockCtx } as any;
      }
      return origCreateElement(tagName);
    });

    const result = deleteSingleColor(imgData, 3, 1, '#ff0000', 20);
    // Red pixel (pixel 0) alpha erased
    expect(result.data[3]).toBe(0);
    // Adjacent light pink fringe (pixel 1) alpha erased
    expect(result.data[7]).toBe(0);
    // Blue pixel (pixel 2) alpha remains 255
    expect(result.data[11]).toBe(255);

    vi.restoreAllMocks();
  });
});
