import { describe, it, expect } from 'vitest';
import { getToolCursorStyle } from './cursors';

describe('getToolCursorStyle utility', () => {
  it('returns custom encoded SVG cursor data for bucket tool', () => {
    const style = getToolCursorStyle('bucket', false);
    expect(style).toContain('data:image/svg+xml');
    expect(style).toContain('crosshair');
  });

  it('returns grab or grabbing for pan tool', () => {
    expect(getToolCursorStyle('pan', false)).toBe('grab');
    expect(getToolCursorStyle('pan', true)).toBe('grabbing');
  });

  it('returns custom SVG cursor data for brush, eraser, and picker tools', () => {
    expect(getToolCursorStyle('brush', false)).toContain('crosshair');
    expect(getToolCursorStyle('eraser', false)).toContain('crosshair');
    expect(getToolCursorStyle('picker', false)).toContain('crosshair');
  });
});
