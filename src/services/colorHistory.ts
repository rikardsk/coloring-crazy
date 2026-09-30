const COLOR_HISTORY_KEY = 'coloring_crazy_color_history';

export function getColorHistory(): string[] {
  try {
    const raw = localStorage.getItem(COLOR_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushColorHistory(color: string): string[] {
  if (!color) return getColorHistory();
  const hex = color.toUpperCase();
  const current = getColorHistory();
  const filtered = current.filter(c => c.toUpperCase() !== hex);
  const updated = [hex, ...filtered].slice(0, 3);
  try {
    localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    console.warn('Failed to save color history to localStorage');
  }
  return updated;
}

export function clearColorHistory(): void {
  try {
    localStorage.removeItem(COLOR_HISTORY_KEY);
  } catch {}
}
