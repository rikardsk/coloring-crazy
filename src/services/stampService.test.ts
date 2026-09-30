import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUILTIN_STAMPS, getStampById, drawStampShape } from './stampService';

describe('stampService', () => {
  beforeEach(() => {
    // Mock Path2D if not available in Node environment
    if (typeof globalThis.Path2D === 'undefined') {
      (globalThis as unknown as { Path2D: unknown }).Path2D = vi.fn().mockImplementation(() => ({}));
    }
  });

  it('contains built-in stamps with categories', () => {
    expect(BUILTIN_STAMPS.length).toBeGreaterThanOrEqual(12);

    const ids = BUILTIN_STAMPS.map(s => s.id);
    expect(ids).toContain('star');
    expect(ids).toContain('heart');
    expect(ids).toContain('crown');
    expect(ids).toContain('cloud');
    expect(ids).toContain('sparkles');
    expect(ids).toContain('sun');
    expect(ids).toContain('moon');
    expect(ids).toContain('lightning');
    expect(ids).toContain('gem');
    expect(ids).toContain('paw');
    expect(ids).toContain('butterfly');
    expect(ids).toContain('flower');
  });

  it('retrieves stamp by id correctly', () => {
    const star = getStampById('star');
    expect(star).toBeDefined();
    expect(star?.name).toBe('Star');
    expect(star?.category).toBe('Shapes');

    const unknown = getStampById('non_existent_stamp');
    expect(unknown).toBeUndefined();
  });

  it('renders stamp shape using canvas 2d context', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fill: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const stampDef = getStampById('star');
    expect(stampDef).toBeDefined();

    if (stampDef) {
      drawStampShape(mockCtx, stampDef, 100, 100, 60, 0, '#FF0000', '#FFFF00');
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(100, 100);
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    }
  });
});
