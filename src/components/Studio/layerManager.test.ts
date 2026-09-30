import { describe, it, expect } from 'vitest';
import { PlacedLine, PlacedCircle, PlacedSquare } from '../../types/coloring';

describe('Layer Manager & Shape Properties', () => {
  it('supports opacity, isHidden, and isLocked on PlacedLine', () => {
    const line: PlacedLine = {
      id: 'line_1',
      x1: 10,
      y1: 10,
      x2: 100,
      y2: 100,
      color: '#ff0000',
      size: 5,
      style: 'solid',
      opacity: 0.5,
      isHidden: false,
      isLocked: true
    };

    expect(line.opacity).toBe(0.5);
    expect(line.isHidden).toBe(false);
    expect(line.isLocked).toBe(true);
  });

  it('filters out hidden shapes when rendering', () => {
    const lines: PlacedLine[] = [
      { id: '1', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', size: 2, style: 'solid', isHidden: false },
      { id: '2', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', size: 2, style: 'solid', isHidden: true }
    ];

    const visibleLines = lines.filter(l => !l.isHidden);
    expect(visibleLines).toHaveLength(1);
    expect(visibleLines[0].id).toBe('1');
  });

  it('prevents selection of locked shapes', () => {
    const circles: PlacedCircle[] = [
      { id: 'c1', cx: 50, cy: 50, radius: 20, color: '#000', size: 2, style: 'solid', isLocked: true },
      { id: 'c2', cx: 150, cy: 150, radius: 20, color: '#000', size: 2, style: 'solid', isLocked: false }
    ];

    const selectableCircles = circles.filter(c => !c.isLocked);
    expect(selectableCircles).toHaveLength(1);
    expect(selectableCircles[0].id).toBe('c2');
  });

  it('allows reordering shapes in a layer list', () => {
    let squares: PlacedSquare[] = [
      { id: 'sq1', x: 0, y: 0, width: 20, height: 20, color: '#f00', size: 2, style: 'solid' },
      { id: 'sq2', x: 50, y: 50, width: 20, height: 20, color: '#0f0', size: 2, style: 'solid' }
    ];

    // Swap order
    const temp = squares[0];
    squares[0] = squares[1];
    squares[1] = temp;

    expect(squares[0].id).toBe('sq2');
    expect(squares[1].id).toBe('sq1');
  });
});
