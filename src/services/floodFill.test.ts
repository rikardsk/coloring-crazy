import { describe, it, expect } from 'vitest';
import { hexToRgba, colorsMatch, isBlackLineBoundary, createStencilMaskData, performFloodFill } from './floodFill';

describe('floodFill helper utilities', () => {
  it('converts hex strings to RGBA correctly', () => {
    const rgba = hexToRgba('#ff0000');
    expect(rgba).toEqual({ r: 255, g: 0, b: 0, a: 255 });

    const shortHex = hexToRgba('#0f0');
    expect(shortHex).toEqual({ r: 0, g: 255, b: 0, a: 255 });
  });

  it('correctly matches colors within tolerance bounds', () => {
    const data = new Uint8ClampedArray([200, 200, 200, 255]);
    const target = { r: 210, g: 195, b: 205, a: 255 };

    expect(colorsMatch(data, 0, target, 15)).toBe(true);
    expect(colorsMatch(data, 0, target, 5)).toBe(false);
  });

  it('correctly detects black line boundary walls', () => {
    const blackLinePixel = new Uint8ClampedArray([10, 10, 10, 255]);
    const whiteBackgroundPixel = new Uint8ClampedArray([255, 255, 255, 255]);
    const transparentPixel = new Uint8ClampedArray([0, 0, 0, 0]);

    expect(isBlackLineBoundary(blackLinePixel, 0)).toBe(true);
    expect(isBlackLineBoundary(whiteBackgroundPixel, 0)).toBe(false);
    expect(isBlackLineBoundary(transparentPixel, 0)).toBe(false);
  });

  it('handles null or missing document gracefully in createStencilMaskData', () => {
    const mask = createStencilMaskData(100, 100, null, undefined);
    expect(mask).toBeNull();
  });

  it('fills in all 4 directions (down, up, left, right)', () => {
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    let resultData: Uint8ClampedArray | null = null;
    const mockCtx = {
      canvas: { width, height },
      getImageData: () => ({
        data,
        width,
        height
      }),
      putImageData: (imgData: ImageData) => {
        resultData = imgData.data;
      }
    } as unknown as CanvasRenderingContext2D;

    performFloodFill(mockCtx, null, 5, 2, '#ff0000');

    expect(resultData).not.toBeNull();
    if (resultData) {
      const topIdx = (0 * width + 5) * 4;
      expect(resultData[topIdx]).toBe(255);
      expect(resultData[topIdx + 1]).toBe(0);
      expect(resultData[topIdx + 2]).toBe(0);

      const bottomIdx = (8 * width + 5) * 4;
      expect(resultData[bottomIdx]).toBe(255);
      expect(resultData[bottomIdx + 1]).toBe(0);
      expect(resultData[bottomIdx + 2]).toBe(0);
    }
  });

  it('stops flood fill at overlay canvas boundary pixels', () => {
    const width = 10;
    const height = 10;
    const colorData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i] = 255;
      colorData[i + 1] = 255;
      colorData[i + 2] = 255;
      colorData[i + 3] = 255;
    }

    const overlayData = new Uint8ClampedArray(width * height * 4);
    for (let x = 0; x < width; x++) {
      const idx = (5 * width + x) * 4;
      overlayData[idx + 3] = 255;
    }

    let resultData: Uint8ClampedArray | null = null;
    const mockColorCtx = {
      canvas: { width, height },
      getImageData: () => ({ data: colorData, width, height }),
      putImageData: (imgData: ImageData) => { resultData = imgData.data; }
    } as unknown as CanvasRenderingContext2D;

    const mockOverlayCtx = {
      canvas: { width, height },
      getImageData: () => ({ data: overlayData, width, height })
    } as unknown as CanvasRenderingContext2D;

    performFloodFill(mockColorCtx, null, 5, 2, '#ff0000', 32, null, undefined, undefined, mockOverlayCtx);

    expect(resultData).not.toBeNull();
    if (resultData) {
      const filledIdx = (2 * width + 5) * 4;
      expect(resultData[filledIdx]).toBe(255);
      expect(resultData[filledIdx + 1]).toBe(0);

      const blockedIdx = (8 * width + 5) * 4;
      expect(resultData[blockedIdx]).toBe(255);
      expect(resultData[blockedIdx + 1]).toBe(255);
    }
  });

  it('allows re-filling an area multiple times with different colors', () => {
    const width = 10;
    const height = 10;
    const colorData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i] = 255;
      colorData[i + 1] = 255;
      colorData[i + 2] = 255;
      colorData[i + 3] = 255;
    }

    let resultData: Uint8ClampedArray = colorData;
    const mockColorCtx = {
      canvas: { width, height },
      getImageData: () => ({ data: resultData, width, height }),
      putImageData: (imgData: ImageData) => { resultData = imgData.data; }
    } as unknown as CanvasRenderingContext2D;

    const idx = (2 * width + 5) * 4;

    // 1st fill: Red (#ff0000)
    performFloodFill(mockColorCtx, null, 5, 2, '#ff0000');
    expect(resultData[idx]).toBe(255);
    expect(resultData[idx + 1]).toBe(0);
    expect(resultData[idx + 2]).toBe(0);

    // 2nd fill: Blue (#0000ff) over the Red area
    performFloodFill(mockColorCtx, null, 5, 2, '#0000ff');
    expect(resultData[idx]).toBe(0);
    expect(resultData[idx + 1]).toBe(0);
    expect(resultData[idx + 2]).toBe(255);

    // 3rd fill: Green (#00ff00) over the Blue area
    performFloodFill(mockColorCtx, null, 5, 2, '#00ff00');
    expect(resultData[idx]).toBe(0);
    expect(resultData[idx + 1]).toBe(255);
    expect(resultData[idx + 2]).toBe(0);
  });
});
