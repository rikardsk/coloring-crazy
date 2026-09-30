import { StudioTool } from '../types/coloring';

// Convert clean SVG string to Base64 for 100% reliable Firefox, Chrome & Edge rendering
function buildCursorUrl(svgString: string, hotspotX: number, hotspotY: number, fallback: string): string {
  const cleanSvg = svgString.trim().replace(/\s+/g, ' ');
  const base64 = typeof window !== 'undefined' && window.btoa ? window.btoa(cleanSvg) : encodeURIComponent(cleanSvg);
  return `url("data:image/svg+xml;base64,${base64}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

// 32x32 Paint Bucket SVG Cursor with explicit crosshair target point at (4, 28)
const BUCKET_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <line x1="4" y1="22" x2="4" y2="31" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="0" y1="28" x2="9" y2="28" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="4" y1="23" x2="4" y2="30" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="1" y1="28" x2="8" y2="28" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M26 12 L15 2 L5 11 L16 22 Z" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 25 C10 25 12 22 12 19 C12 16 7 12 7 12 C7 12 2 16 2 19 C2 22 4 25 7 25 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M26 12 L15 2 L5 11 L16 22 Z" fill="#1e293b" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 8 L19 19" stroke="#c084fc" stroke-width="2"/>
  <path d="M7 25 C10 25 12 22 12 19 C12 16 7 12 7 12 C7 12 2 16 2 19 C2 22 4 25 7 25 Z" fill="#a855f7" stroke="#c084fc" stroke-width="1.5"/>
</svg>`;

// 32x32 Paint Brush SVG Cursor (Hotspot at bristle tip 3, 29)
const BRUSH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M22 4 L28 10 L14 24 L8 18 Z" fill="#1e293b" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 4 L28 10 L14 24 L8 18 Z" fill="#1e293b" stroke="#f472b6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 18 L3 29 L14 24 Z" fill="#ec4899" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 18 L3 29 L14 24 Z" fill="#ec4899" stroke="#ec4899" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// 32x32 Eraser SVG Cursor (Hotspot at corner tip 3, 21)
const ERASER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M10 28 L3 21 L20 4 L27 11 Z" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 28 L14 28" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M10 28 L3 21 L20 4 L27 11 Z" fill="#1e293b" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 16 L15 23" stroke="#f43f5e" stroke-width="2"/>
  <path d="M3 21 L10 28 L17 21 L10 14 Z" fill="#fb7185" stroke="#f43f5e" stroke-width="1.5"/>
  <path d="M28 28 L15 28" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// 32x32 Lucide-matching Pipette Eyedropper SVG Cursor (Hotspot at glass tip 3, 29)
const PICKER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <!-- Precision Target Crosshair at Hotspot (3, 29) -->
  <line x1="3" y1="22" x2="3" y2="31" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="0" y1="29" x2="9" y2="29" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="3" y1="23" x2="3" y2="30" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="1" y1="29" x2="8" y2="29" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Unified Outer White Outline (Prevents internal white line artifacts) -->
  <path d="M 3 29 L 4 24 L 15 13 L 19 10 C 23 5, 29 5, 30 10 C 31 14, 27 18, 22 13 L 19 17 L 8 28 Z" 
        fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Eyedropper Barrel Base -->
  <path d="M 3 29 L 4 24 L 15 13 L 19 17 L 8 28 Z" fill="#0f172a"/>
  
  <!-- Liquid Chamber Fill -->
  <path d="M 5 25 L 12 18 L 15 21 L 8 27 Z" fill="#38bdf8"/>
  
  <!-- Nozzle Tip Color -->
  <path d="M 3 29 L 4 24 L 8 28 Z" fill="#38bdf8"/>
  
  <!-- Metallic Ring Accents -->
  <path d="M 12 16 L 16 20" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 15 13 L 19 17" stroke="#e0f2fe" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Rubber Bulb -->
  <path d="M 19 10 C 23 5, 29 5, 30 10 C 31 14, 27 18, 22 13 Z" fill="#0284c7"/>
  
  <!-- Bulb Gloss Highlight -->
  <path d="M 23 7 C 25 5, 28 7, 28 9" fill="none" stroke="#e0f2fe" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// 32x32 Speech Bubble SVG Cursor (Hotspot at target crosshair 4, 28)
const BUBBLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <line x1="4" y1="22" x2="4" y2="31" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="0" y1="28" x2="9" y2="28" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="4" y1="23" x2="4" y2="30" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="1" y1="28" x2="8" y2="28" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 12 4 C 6.5 4 2 8 2 13 C 2 16 3.8 18.6 6.5 20.2 L 5 25 L 10.5 22.5 C 11 22.7 11.5 22.8 12 22.8 C 17.5 22.8 22 18.8 22 13.8 C 22 8.8 17.5 4 12 4 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 12 4 C 6.5 4 2 8 2 13 C 2 16 3.8 18.6 6.5 20.2 L 5 25 L 10.5 22.5 C 11 22.7 11.5 22.8 12 22.8 C 17.5 22.8 22 18.8 22 13.8 C 22 8.8 17.5 4 12 4 Z" fill="#ffffff" stroke="#a855f7" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

// 32x32 Select Pointer SVG Cursor (Hotspot 3, 3)
const SELECT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M 3 3 L 13 27 L 17 17 L 27 13 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 3 3 L 13 27 L 17 17 L 27 13 Z" fill="#a855f7" stroke="#1e293b" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

export function getToolCursorStyle(tool: StudioTool, isPanning: boolean, isPickingColor: boolean = false): string {
  if (isPickingColor || tool === 'picker') return buildCursorUrl(PICKER_SVG, 3, 29, 'crosshair');
  if (tool === 'bucket') return buildCursorUrl(BUCKET_SVG, 4, 28, 'crosshair');
  if (tool === 'brush') return buildCursorUrl(BRUSH_SVG, 3, 29, 'crosshair');
  if (tool === 'eraser') return buildCursorUrl(ERASER_SVG, 3, 21, 'crosshair');
  if (tool === 'bubble') return buildCursorUrl(BUBBLE_SVG, 4, 28, 'crosshair');
  if (tool === 'select') return buildCursorUrl(SELECT_SVG, 3, 3, 'default');
  if (tool === 'spiral' || tool === 'line' || tool === 'circle' || tool === 'square') return 'crosshair';
  if (tool === 'pan' || tool === 'transform') return isPanning ? 'grabbing' : 'grab';
  return 'default';
}
