import { StencilDef } from '../types/coloring';

const CUSTOM_STENCILS_KEY = 'coloring_crazy_custom_stencils';

/**
 * Retrieves all saved custom stencils from localStorage.
 */
export function getCustomStencils(): StencilDef[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STENCILS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading custom stencils from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new custom stencil to localStorage and returns the updated list.
 */
export function addCustomStencil(
  name: string,
  icon: string,
  svgPath: string,
  viewBox: string = '0 0 200 200'
): StencilDef {
  const customList = getCustomStencils();
  const newStencil: StencilDef = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || 'Custom Stencil',
    category: 'Custom',
    icon: icon.trim() || '🎨',
    svgPath: svgPath.trim(),
    viewBox: viewBox || '0 0 200 200'
  };

  const updated = [newStencil, ...customList];
  try {
    localStorage.setItem(CUSTOM_STENCILS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving custom stencil to localStorage:', err);
  }
  return newStencil;
}

/**
 * Deletes a custom stencil by ID.
 */
export function deleteCustomStencil(id: string): StencilDef[] {
  const current = getCustomStencils();
  const updated = current.filter(s => s.id !== id);
  try {
    localStorage.setItem(CUSTOM_STENCILS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting custom stencil from localStorage:', err);
  }
  return updated;
}

/**
 * Parses SVG string content and extracts path data (`d` attributes) and optional viewBox.
 */
export function parseSvgContent(svgText: string): { svgPath: string; viewBox?: string } | null {
  if (!svgText || typeof svgText !== 'string') return null;

  const trimmed = svgText.trim();

  // If the user pasted a raw path string (starts with M, m, C, c, L, l, etc. without <svg tags)
  if (!trimmed.toLowerCase().includes('<svg') && !trimmed.toLowerCase().includes('<path')) {
    if (/^[a-zA-Z0-9\s,.-]+$/.test(trimmed) && (trimmed.startsWith('M') || trimmed.startsWith('m'))) {
      return { svgPath: trimmed, viewBox: '0 0 200 200' };
    }
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'image/svg+xml');
    
    // Check for parse errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('SVG parse warning:', parserError.textContent);
    }

    const svgElement = doc.querySelector('svg');
    const viewBox = svgElement?.getAttribute('viewBox') || undefined;

    const pathElements = Array.from(doc.querySelectorAll('path'));
    const pathDatas: string[] = [];

    pathElements.forEach(p => {
      const d = p.getAttribute('d');
      if (d && d.trim().length > 0) {
        pathDatas.push(d.trim());
      }
    });

    // Also support polygon tags if no path tag was found
    if (pathDatas.length === 0) {
      const polygons = Array.from(doc.querySelectorAll('polygon'));
      polygons.forEach(poly => {
        const points = poly.getAttribute('points');
        if (points) {
          const coords = points.trim().split(/\s+|,/);
          if (coords.length >= 4) {
            let pathStr = `M ${coords[0]} ${coords[1]}`;
            for (let i = 2; i < coords.length - 1; i += 2) {
              pathStr += ` L ${coords[i]} ${coords[i + 1]}`;
            }
            pathStr += ' Z';
            pathDatas.push(pathStr);
          }
        }
      });
    }

    // Support rect tags if no path tag found
    if (pathDatas.length === 0) {
      const rects = Array.from(doc.querySelectorAll('rect'));
      rects.forEach(r => {
        const x = Number(r.getAttribute('x') || 0);
        const y = Number(r.getAttribute('y') || 0);
        const w = Number(r.getAttribute('width') || 100);
        const h = Number(r.getAttribute('height') || 100);
        pathDatas.push(`M ${x} ${y} h ${w} v ${h} h ${-w} Z`);
      });
    }

    // Support circle tags if no path tag found
    if (pathDatas.length === 0) {
      const circles = Array.from(doc.querySelectorAll('circle'));
      circles.forEach(c => {
        const cx = Number(c.getAttribute('cx') || 100);
        const cy = Number(c.getAttribute('cy') || 100);
        const r = Number(c.getAttribute('r') || 50);
        pathDatas.push(`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`);
      });
    }

    if (pathDatas.length === 0) return null;

    return {
      svgPath: pathDatas.join(' '),
      viewBox
    };
  } catch (err) {
    console.error('Failed to parse SVG content:', err);
    return null;
  }
}
