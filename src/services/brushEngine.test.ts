import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getMidPoint, 
  drawSolidLine, 
  drawCrayonLine, 
  drawPencilLine, 
  drawMarkerLine, 
  drawNeonLine, 
  drawGlitterLine, 
  drawSprayLine,
  drawArchimedeanSpiral,
  renderBrushStroke 
} from './brushEngine';

describe('brushEngine', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowColor: '',
      shadowBlur: 0
    };
  });

  it('calculates mid point correctly', () => {
    const p1 = { x: 10, y: 20 };
    const p2 = { x: 30, y: 40 };
    const mid = getMidPoint(p1, p2);
    expect(mid).toEqual({ x: 20, y: 30 });
  });

  it('renders solid line correctly', () => {
    drawSolidLine(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#ff0000', 5);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('renders crayon line correctly', () => {
    drawCrayonLine(mockCtx, { x: 0, y: 0 }, { x: 20, y: 20 }, '#ff0000', 5);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('renders pencil line correctly', () => {
    drawPencilLine(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#0000ff', 3);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('renders marker line with multiply composite operation', () => {
    drawMarkerLine(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#ffff00', 10);
    expect(mockCtx.globalCompositeOperation).toBe('multiply');
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it('renders neon line with shadow blur', () => {
    drawNeonLine(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#00ff00', 8);
    expect(mockCtx.shadowColor).toBe('#00ff00');
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it('renders glitter line with sparkles', () => {
    drawGlitterLine(mockCtx, { x: 0, y: 0 }, { x: 20, y: 20 }, '#ff00ff', 6);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('renders spray line with particle splatter', () => {
    drawSprayLine(mockCtx, { x: 0, y: 0 }, { x: 20, y: 20 }, '#ff8800', 10);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('renders Archimedean spiral correctly', () => {
    drawArchimedeanSpiral(mockCtx, 50, 50, 20, 3, '#8800ff', 10, 'solid');
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('dispatches to correct stroke style in renderBrushStroke', () => {
    renderBrushStroke(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#123456', 4, 'crayon');
    expect(mockCtx.fill).toHaveBeenCalled();

    renderBrushStroke(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#123456', 4, 'spray');
    expect(mockCtx.fill).toHaveBeenCalled();

    renderBrushStroke(mockCtx, { x: 0, y: 0 }, { x: 10, y: 10 }, '#123456', 4, 'solid');
    expect(mockCtx.stroke).toHaveBeenCalled();
  });
});
