import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  PRESET_STENCILS, 
  getStencilById, 
  getInitialStencilState, 
  applyStencilPathToCtx, 
  setupStencilClipMask,
  strokeStencilOutline 
} from './stencilService';

if (typeof (globalThis as any).Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    constructor(public d?: string) {}
    rect() {}
    addPath() {}
  };
}

if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    translate() { return this; }
    rotate() { return this; }
    scale() { return this; }
  };
}

describe('stencilService', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn()
    };
  });

  it('contains valid preset stencils', () => {
    expect(PRESET_STENCILS.length).toBeGreaterThan(0);
    const star = getStencilById('star-5');
    expect(star).toBeDefined();
    expect(star?.name).toBe('5-Point Star');
  });

  it('returns undefined for non-existent stencil ID', () => {
    const unknown = getStencilById('invalid-id');
    expect(unknown).toBeUndefined();
  });

  it('creates initial stencil state centered on canvas', () => {
    const state = getInitialStencilState('heart', 800, 600);
    expect(state).toEqual({
      stencilId: 'heart',
      x: 400,
      y: 300,
      scale: 1.0,
      rotation: 0,
      isInverted: false
    });
  });

  it('applies stencil path to context', () => {
    const state = getInitialStencilState('star-5', 400, 400);
    applyStencilPathToCtx(mockCtx, PRESET_STENCILS[0].svgPath, state);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('sets up stencil clip mask with nonzero clip for normal mode', () => {
    const state = getInitialStencilState('star-5', 400, 400);
    setupStencilClipMask(mockCtx, state, PRESET_STENCILS[0], 400, 400);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.clip).toHaveBeenCalledWith(expect.anything(), 'nonzero');
  });

  it('sets up stencil clip mask with evenodd clip for inverted mode', () => {
    const state = { ...getInitialStencilState('star-5', 400, 400), isInverted: true };
    setupStencilClipMask(mockCtx, state, PRESET_STENCILS[0], 400, 400);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.clip).toHaveBeenCalledWith(expect.anything(), 'evenodd');
  });

  it('strokes stencil outline with current brush color, size, and style', () => {
    const state = getInitialStencilState('star-5', 400, 400);
    strokeStencilOutline(mockCtx, state, PRESET_STENCILS[0], '#ff0000', 8, 'neon');
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
