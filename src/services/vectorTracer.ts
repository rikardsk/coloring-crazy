export interface Point {
  x: number;
  y: number;
}

/**
 * Simplifies an array of points by removing points closer than `minDistance`.
 */
export function simplifyPoints(points: Point[], minDistance: number = 4): Point[] {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const last = result[result.length - 1];
    const curr = points[i];
    const distSq = (curr.x - last.x) ** 2 + (curr.y - last.y) ** 2;
    if (distSq >= minDistance ** 2) {
      result.push(curr);
    }
  }

  // Always keep the last point
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Converts an array of points into a smooth or linear SVG path `d` string.
 * Coordinates are normalized into a standard viewBox (e.g. 0 0 200 200) if bounds are provided.
 */
export function pointsToSvgPath(
  rawPoints: Point[],
  options: {
    closed?: boolean;
    smooth?: boolean;
    normalizeViewBox?: boolean;
    targetSize?: number;
  } = {}
): { svgPath: string; viewBox: string } {
  const { closed = true, smooth = true, normalizeViewBox = true, targetSize = 200 } = options;

  if (!rawPoints || rawPoints.length < 2) {
    return { svgPath: '', viewBox: `0 0 ${targetSize} ${targetSize}` };
  }

  let points = simplifyPoints(rawPoints);

  if (normalizeViewBox) {
    // Compute bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const maxDim = Math.max(width, height);
    const padding = 20; // 10px padding on each side inside 200x200
    const scale = (targetSize - padding * 2) / maxDim;

    const offsetX = padding + (targetSize - padding * 2 - width * scale) / 2;
    const offsetY = padding + (targetSize - padding * 2 - height * scale) / 2;

    points = points.map(p => ({
      x: Math.round((p.x - minX) * scale + offsetX),
      y: Math.round((p.y - minY) * scale + offsetY)
    }));
  }

  if (points.length < 2) {
    return { svgPath: '', viewBox: `0 0 ${targetSize} ${targetSize}` };
  }

  let pathStr = `M ${Math.round(points[0].x)} ${Math.round(points[0].y)}`;

  if (smooth && points.length > 2) {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? points.length - 1 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? (i + 2) % points.length : i + 2];

      const cp1x = Math.round(p1.x + (p2.x - p0.x) / 6);
      const cp1y = Math.round(p1.y + (p2.y - p0.y) / 6);
      const cp2x = Math.round(p2.x - (p3.x - p1.x) / 6);
      const cp2y = Math.round(p2.y - (p3.y - p1.y) / 6);

      pathStr += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${Math.round(p2.x)} ${Math.round(p2.y)}`;
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      pathStr += ` L ${Math.round(points[i].x)} ${Math.round(points[i].y)}`;
    }
  }

  if (closed) {
    pathStr += ' Z';
  }

  return { svgPath: pathStr, viewBox: `0 0 ${targetSize} ${targetSize}` };
}

/**
 * Scans non-transparent canvas pixels and extracts the outer contour points,
 * converting them into an SVG path string.
 */
export function traceCanvasToSvgPath(
  canvas: HTMLCanvasElement,
  threshold: number = 20
): { svgPath: string; viewBox: string } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const points: Point[] = [];
  const step = Math.max(2, Math.floor(Math.min(width, height) / 200));

  // Sample edge points where pixel alpha or dark content is found
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Pixel is active if opaque and not pure white
      const isDark = a > threshold && (r < 240 || g < 240 || b < 240);
      if (isDark) {
        // Check if on border of shape
        let isEdge = false;
        const neighbors = [
          ((y - step) * width + x) * 4,
          ((y + step) * width + x) * 4,
          (y * width + (x - step)) * 4,
          (y * width + (x + step)) * 4
        ];

        for (const nIdx of neighbors) {
          if (nIdx < 0 || nIdx >= data.length || data[nIdx + 3] <= threshold || (data[nIdx] > 240 && data[nIdx + 1] > 240 && data[nIdx + 2] > 240)) {
            isEdge = true;
            break;
          }
        }

        if (isEdge) {
          points.push({ x, y });
        }
      }
    }
  }

  if (points.length < 3) return null;

  // Sort points radially around centroid to form a clean closed loop contour
  const cx = points.reduce((acc, p) => acc + p.x, 0) / points.length;
  const cy = points.reduce((acc, p) => acc + p.y, 0) / points.length;

  points.sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });

  return pointsToSvgPath(points, { closed: true, smooth: true });
}
