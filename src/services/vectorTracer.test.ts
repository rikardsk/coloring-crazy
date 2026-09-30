import { describe, it, expect } from 'vitest';
import { simplifyPoints, pointsToSvgPath, Point } from './vectorTracer';

describe('vectorTracer service', () => {
  it('simplifies close points', () => {
    const raw: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }, // very close
      { x: 2, y: 2 }, // very close
      { x: 50, y: 50 },
      { x: 100, y: 100 }
    ];

    const simplified = simplifyPoints(raw, 4);
    expect(simplified.length).toBeLessThan(raw.length);
  });

  it('converts points to standard SVG path string', () => {
    const points: Point[] = [
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 }
    ];

    const result = pointsToSvgPath(points, { closed: true, smooth: false });
    expect(result.svgPath).toContain('M');
    expect(result.svgPath).toContain('Z');
    expect(result.viewBox).toBe('0 0 200 200');
  });

  it('handles empty or single point arrays gracefully', () => {
    const result = pointsToSvgPath([]);
    expect(result.svgPath).toBe('');
  });
});
