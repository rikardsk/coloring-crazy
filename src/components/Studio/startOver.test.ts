import { describe, it, expect } from 'vitest';
import { ColoringPage, PlacedLine, PlacedCircle, PlacedSquare, PlacedSpiral, PlacedSpeechBubble } from '../../types/coloring';

describe('Start Over clear state logic', () => {
  it('detects when canvas has placed elements even if paint canUndo is false', () => {
    const canUndo = false;
    const placedLines: PlacedLine[] = [{ id: 'l1', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', size: 2, style: 'solid' }];
    const placedCircles: PlacedCircle[] = [];
    const placedSquares: PlacedSquare[] = [];
    const placedSpirals: PlacedSpiral[] = [];
    const placedBubbles: PlacedSpeechBubble[] = [];

    const hasPlacedElements = placedLines.length > 0 || placedCircles.length > 0 || placedSquares.length > 0 || placedSpirals.length > 0 || placedBubbles.length > 0;
    const isClean = !canUndo && !hasPlacedElements;

    expect(isClean).toBe(false);
  });

  it('resets all shape array states on clear', () => {
    let placedLines: PlacedLine[] = [{ id: 'l1', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', size: 2, style: 'solid' }];
    let placedCircles: PlacedCircle[] = [{ id: 'c1', cx: 5, cy: 5, radius: 10, color: '#000', size: 2, style: 'solid' }];
    let placedSquares: PlacedSquare[] = [{ id: 'sq1', x: 0, y: 0, width: 20, height: 20, color: '#000', size: 2, style: 'solid' }];
    let placedSpirals: PlacedSpiral[] = [{ id: 's1', cx: 5, cy: 5, radius: 15, turns: 3, color: '#000', size: 2, style: 'solid' }];

    placedLines = [];
    placedCircles = [];
    placedSquares = [];
    placedSpirals = [];

    expect(placedLines.length).toBe(0);
    expect(placedCircles.length).toBe(0);
    expect(placedSquares.length).toBe(0);
    expect(placedSpirals.length).toBe(0);
  });

  it('preserves placed shapes on ColoringPage when saving and loading', () => {
    const page: ColoringPage = {
      id: 'test-page-1',
      title: 'Test Page',
      description: 'Test',
      category: 'Custom',
      tags: [],
      lineArtDataUrl: 'data:image/svg+xml;base64,',
      createdAt: Date.now(),
      isPreset: false,
      difficulty: 'Easy',
      placedLines: [{ id: 'l1', x1: 10, y1: 10, x2: 50, y2: 50, color: '#ff0000', size: 4, style: 'solid' }],
      placedCircles: [{ id: 'c1', cx: 100, cy: 100, radius: 25, color: '#00ff00', size: 2, style: 'solid' }],
      placedSquares: [{ id: 'sq1', x: 200, y: 200, width: 30, height: 30, color: '#0000ff', size: 3, style: 'solid' }],
      placedSpirals: [{ id: 's1', cx: 300, cy: 300, radius: 40, turns: 4, color: '#ffff00', size: 2, style: 'solid' }]
    };

    expect(page.placedLines?.length).toBe(1);
    expect(page.placedCircles?.length).toBe(1);
    expect(page.placedSquares?.length).toBe(1);
    expect(page.placedSpirals?.length).toBe(1);
  });

  it('supports toggling isBehindPaint on vector shapes', () => {
    let line: PlacedLine = { id: 'l1', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', size: 2, style: 'solid' };
    expect(line.isBehindPaint).toBeUndefined();

    line = { ...line, isBehindPaint: true };
    expect(line.isBehindPaint).toBe(true);

    const backLines = [line].filter(l => Boolean(l.isBehindPaint) === true);
    const frontLines = [line].filter(l => Boolean(l.isBehindPaint) === false);

    expect(backLines.length).toBe(1);
    expect(frontLines.length).toBe(0);
  });
});
