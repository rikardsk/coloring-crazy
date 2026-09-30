import { describe, it, expect } from 'vitest';
import { getCanvasDimensionsForRatio } from './imageProcessor';

describe('Page Dimensions Service', () => {
  it('returns standard 800x800 for 1:1 Square aspect ratio', () => {
    const dim = getCanvasDimensionsForRatio('1:1');
    expect(dim).toEqual({ width: 800, height: 800 });
  });

  it('returns 800x1000 for 4:5 Portrait / A4 aspect ratio', () => {
    const dim = getCanvasDimensionsForRatio('4:5');
    expect(dim).toEqual({ width: 800, height: 1000 });
  });

  it('returns 1000x800 for 5:4 Landscape aspect ratio', () => {
    const dim = getCanvasDimensionsForRatio('5:4');
    expect(dim).toEqual({ width: 1000, height: 800 });
  });

  it('returns 1200x675 for 16:9 Widescreen aspect ratio', () => {
    const dim = getCanvasDimensionsForRatio('16:9');
    expect(dim).toEqual({ width: 1200, height: 675 });
  });

  it('calculates proportional dimensions for Auto ratio', () => {
    const dim = getCanvasDimensionsForRatio('auto', 1600, 1200);
    expect(dim.width).toBe(1000);
    expect(dim.height).toBe(750);
  });
});
