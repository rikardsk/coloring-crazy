import { describe, it, expect } from 'vitest';
import { 
  clampScale, 
  rotateDegrees, 
  buildPaperTransformCss, 
  buildDrawingTransformCss, 
  buildTransformCssString,
  getTransformedCanvasPoint,
  calculateLineAngleAndEnd,
  distanceToSegment,
  isPointInSpiral,
  isPointInCircle,
  isPointInSquare 
} from './transformUtils';

describe('transformUtils logic tests', () => {
  it('clamps scale within min and max boundaries', () => {
    expect(clampScale(0.2)).toBe(0.5);
    expect(clampScale(1.5)).toBe(1.5);
    expect(clampScale(5.0)).toBe(3.0);
  });

  it('rotates degrees circularly', () => {
    expect(rotateDegrees(0, 90)).toBe(90);
    expect(rotateDegrees(270, 90)).toBe(0);
    expect(rotateDegrees(0, -90)).toBe(270);
  });

  it('builds paper transform string with pan and zoom', () => {
    const paper = buildPaperTransformCss({ x: 20, y: -10 }, 1.5);
    expect(paper).toBe('translate(20px, -10px) scale(1.5)');
  });

  it('builds drawing transform string with scale, rotation, flips, and offsets', () => {
    const drawing = buildDrawingTransformCss({
      scale: 1.5,
      rotation: 90,
      flipH: true,
      flipV: false,
      offsetX: 10,
      offsetY: -5
    });
    expect(drawing).toContain('translate(10px, -5px)');
    expect(drawing).toContain('scale(-1.5, 1.5)');
    expect(drawing).toContain('rotate(90deg)');
  });

  it('builds combined transform CSS string', () => {
    const combined = buildTransformCssString({ x: 10, y: 10 }, 1, { scale: 1.5 });
    expect(combined).toContain('translate(10px, 10px)');
    expect(combined).toContain('scale(1.5, 1.5)');
  });

  it('maps viewport click point back to transformed canvas pixel coordinates', () => {
    const paperRect = { left: 100, top: 100, width: 800, height: 800 };
    const point = getTransformedCanvasPoint(
      500, // exact center of paper viewport
      500,
      paperRect,
      800,
      800,
      1,
      { scale: 1, rotation: 0, flipH: false, flipV: false, offsetX: 0, offsetY: 0 }
    );
    expect(point).toEqual({ x: 400, y: 400 });
  });

  it('maps click point correctly with translation offset', () => {
    const paperRect = { left: 100, top: 100, width: 800, height: 800 };
    const point = getTransformedCanvasPoint(
      550, // mouse moved 50px right
      500,
      paperRect,
      800,
      800,
      1,
      { scale: 1, rotation: 0, flipH: false, flipV: false, offsetX: 50, offsetY: 0 }
    );
    expect(point).toEqual({ x: 400, y: 400 });
  });

  it('calculates line angle, length, and snapped end point correctly', () => {
    const start = { x: 100, y: 100 };
    const rawEnd = { x: 200, y: 100 }; // Horizontal right: 0 deg
    const res1 = calculateLineAngleAndEnd(start, rawEnd, false);
    expect(res1.angle).toBe(0);
    expect(res1.length).toBe(100);
    expect(res1.end).toEqual({ x: 200, y: 100 });

    const rawEndDiagonal = { x: 200, y: 200 }; // 45 deg
    const res2 = calculateLineAngleAndEnd(start, rawEndDiagonal, false);
    expect(res2.angle).toBe(45);

    // Snap 12 deg raw angle to 15 deg
    const rawEndSlight = { x: 200, y: 120 };
    const res3 = calculateLineAngleAndEnd(start, rawEndSlight, true);
    expect(res3.angle % 15).toBe(0);
  });

  it('calculates point to segment distance correctly', () => {
    // Horizontal line from (0, 0) to (100, 0)
    expect(distanceToSegment(50, 10, 0, 0, 100, 0)).toBe(10);
    expect(distanceToSegment(150, 0, 0, 0, 100, 0)).toBe(50);
  });

  it('determines if point is inside spiral hit radius', () => {
    expect(isPointInSpiral(105, 105, 100, 100, 50)).toBe(true);
    expect(isPointInSpiral(300, 300, 100, 100, 50)).toBe(false);
  });

  it('determines if point is inside circle hit radius', () => {
    expect(isPointInCircle(105, 105, 100, 100, 50)).toBe(true);
    expect(isPointInCircle(300, 300, 100, 100, 50)).toBe(false);
  });

  it('determines if point is inside square bounds', () => {
    expect(isPointInSquare(50, 50, 0, 0, 100, 100)).toBe(true);
    expect(isPointInSquare(300, 300, 0, 0, 100, 100)).toBe(false);
  });
});
