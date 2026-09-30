import { describe, it, expect } from 'vitest';
import { hslToHex, hexToHsl } from './colorUtils';

describe('colorUtils conversion functions', () => {
  it('converts HSL to Hex correctly', () => {
    expect(hslToHex(0, 100, 50).toLowerCase()).toBe('#ff0000');
    expect(hslToHex(120, 100, 50).toLowerCase()).toBe('#00ff00');
    expect(hslToHex(240, 100, 50).toLowerCase()).toBe('#0000ff');
  });

  it('converts Hex to HSL correctly', () => {
    const redHsl = hexToHsl('#ff0000');
    expect(redHsl.h).toBe(0);
    expect(redHsl.s).toBe(100);
    expect(redHsl.l).toBe(50);
  });
});
