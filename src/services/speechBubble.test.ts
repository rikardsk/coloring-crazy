import { describe, it, expect, vi } from 'vitest';
import { wrapBubbleText, drawSpeechBubble, getTailAttachment } from './speechBubble';
import { SpeechBubbleOptions } from '../types/coloring';

describe('Speech Bubble Service', () => {
  it('wraps long text into multiple lines', () => {
    const mockCtx = {
      measureText: (str: string) => ({ width: str.length * 10 })
    } as unknown as CanvasRenderingContext2D;

    const lines = wrapBubbleText(mockCtx, 'Hello World this is a long text', 80);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).toBe('Hello');
  });

  it('calculates tail attachment coordinates dynamically for different target angles', () => {
    // Target below bubble
    const attBottom = getTailAttachment(100, 100, 100, 50, 150, 200);
    expect(attBottom.side).toBe('bottom');
    expect(attBottom.tip).toEqual({ x: 150, y: 200 });

    // Target to the right of bubble
    const attRight = getTailAttachment(100, 100, 100, 50, 300, 125);
    expect(attRight.side).toBe('right');

    // Target above bubble
    const attTop = getTailAttachment(100, 100, 100, 50, 150, 10);
    expect(attTop.side).toBe('top');
  });

  it('draws a speech bubble without crashing', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: (str: string) => ({ width: str.length * 8 })
    } as unknown as CanvasRenderingContext2D;

    const options: SpeechBubbleOptions = {
      text: 'Hello!',
      shape: 'speech',
      fontSize: 18,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2
    };

    expect(() => drawSpeechBubble(mockCtx, 100, 100, options, 50, 180)).not.toThrow();
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it('draws thought, shout, box, sticky, label, and pointer shapes cleanly with interactive tail', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: (str: string) => ({ width: str.length * 8 })
    } as unknown as CanvasRenderingContext2D;

    const shapes: SpeechBubbleOptions['shape'][] = ['thought', 'shout', 'box', 'sticky', 'label', 'pointer'];
    for (const shape of shapes) {
      const options: SpeechBubbleOptions = {
        text: 'BOOM!',
        shape,
        fontSize: 20,
        textColor: '#a855f7',
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 2,
        tailX: 200,
        tailY: 250
      };
      expect(() => drawSpeechBubble(mockCtx, 100, 100, options, 200, 250)).not.toThrow();
    }
  });
});
