import { describe, it, expect, beforeEach } from 'vitest';
import { getColorHistory, pushColorHistory, clearColorHistory } from './colorHistory';

describe('colorHistory service tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when history is empty', () => {
    expect(getColorHistory()).toEqual([]);
  });

  it('stores up to 3 unique recent colors', () => {
    pushColorHistory('#FF0000');
    expect(getColorHistory()).toEqual(['#FF0000']);

    pushColorHistory('#00FF00');
    expect(getColorHistory()).toEqual(['#00FF00', '#FF0000']);

    pushColorHistory('#0000FF');
    expect(getColorHistory()).toEqual(['#0000FF', '#00FF00', '#FF0000']);

    pushColorHistory('#FFFF00');
    expect(getColorHistory()).toEqual(['#FFFF00', '#0000FF', '#00FF00']);
  });

  it('deduplicates colors and moves most recent to front', () => {
    pushColorHistory('#FF0000');
    pushColorHistory('#00FF00');
    pushColorHistory('#FF0000');
    expect(getColorHistory()).toEqual(['#FF0000', '#00FF00']);
  });

  it('clears color history', () => {
    pushColorHistory('#FF0000');
    clearColorHistory();
    expect(getColorHistory()).toEqual([]);
  });
});
