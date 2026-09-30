export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// Convert HSL to Hex string
export function hslToHex(h: number, s: number, l: number): string {
  const sPct = s / 100;
  const lPct = l / 100;

  const c = (1 - Math.abs(2 * lPct - 1)) * sPct;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lPct - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Convert Hex to HSL
export function hexToHsl(hex: string): HSL {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const num = parseInt(clean, 16) || 0;

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
