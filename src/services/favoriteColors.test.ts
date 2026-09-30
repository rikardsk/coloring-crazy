import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getFavoriteColors, 
  addFavoriteColor, 
  removeFavoriteColor, 
  DEFAULT_FAVORITES 
} from './favoriteColors';

describe('favoriteColors service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default favorites when storage is empty', () => {
    const colors = getFavoriteColors();
    expect(colors).toEqual(DEFAULT_FAVORITES);
    expect(colors).toContain('#000000');
    expect(colors).toContain('#FFFFFF');
  });

  it('adds a new favorite color to storage', () => {
    const updated = addFavoriteColor('#FF00FF');
    expect(updated).toContain('#FF00FF');
    expect(getFavoriteColors()).toContain('#FF00FF');
  });

  it('does not duplicate existing favorite color', () => {
    addFavoriteColor('#000000');
    const colors = getFavoriteColors();
    const count = colors.filter(c => c.toUpperCase() === '#000000').length;
    expect(count).toBe(1);
  });

  it('removes custom favorite color but protects essential black & white', () => {
    addFavoriteColor('#123456');
    const removedCustom = removeFavoriteColor('#123456');
    expect(removedCustom).not.toContain('#123456');

    const tryRemoveBlack = removeFavoriteColor('#000000');
    expect(tryRemoveBlack).toContain('#000000');
  });
});
