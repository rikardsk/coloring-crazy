const FAVORITES_STORAGE_KEY = 'coloring_crazy_favorite_colors';
export const ESSENTIAL_COLORS = ['#000000', '#FFFFFF'];
export const DEFAULT_FAVORITES = ['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

export function getFavoriteColors(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_FAVORITES];
}

export function saveFavoriteColors(colors: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(colors));
  } catch {}
}

export function addFavoriteColor(newColor: string): string[] {
  const current = getFavoriteColors();
  const hex = newColor.toUpperCase();
  if (current.some(c => c.toUpperCase() === hex)) return current;
  const updated = [...current, newColor];
  saveFavoriteColors(updated);
  return updated;
}

export function removeFavoriteColor(colorToRemove: string): string[] {
  const current = getFavoriteColors();
  const hex = colorToRemove.toUpperCase();
  if (ESSENTIAL_COLORS.some(c => c.toUpperCase() === hex)) return current;
  const updated = current.filter(c => c.toUpperCase() !== hex);
  saveFavoriteColors(updated);
  return updated;
}
