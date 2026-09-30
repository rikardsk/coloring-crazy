import { describe, it, expect } from 'vitest';
import { DEFAULT_GRID_OPTIONS, GridOptions } from '../../types/coloring';

describe('Grid Overlay Options Data Structure', () => {
  it('has correct default values', () => {
    expect(DEFAULT_GRID_OPTIONS).toEqual({
      type: 'none',
      size: 40,
      opacity: 0.35,
      color: '#000000',
      offsetX: 0,
      offsetY: 0
    });
  });

  it('supports line and dot grid configuration with offsets', () => {
    const lineGrid: GridOptions = {
      type: 'line',
      size: 30,
      opacity: 0.5,
      color: '#3B82F6',
      offsetX: 10,
      offsetY: 15
    };
    expect(lineGrid.type).toBe('line');
    expect(lineGrid.size).toBe(30);
    expect(lineGrid.offsetX).toBe(10);
    expect(lineGrid.offsetY).toBe(15);

    const dotGrid: GridOptions = {
      type: 'dot',
      size: 50,
      opacity: 0.2,
      color: '#8B5CF6',
      offsetX: 5,
      offsetY: 20
    };
    expect(dotGrid.type).toBe('dot');
    expect(dotGrid.opacity).toBe(0.2);
    expect(dotGrid.offsetX).toBe(5);
    expect(dotGrid.offsetY).toBe(20);
  });
});
