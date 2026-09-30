import { SpeechBubbleOptions } from '../types/coloring';

export interface TailAttachment {
  side: 'bottom' | 'top' | 'left' | 'right';
  base1: { x: number; y: number };
  base2: { x: number; y: number };
  tip: { x: number; y: number };
}

export function wrapBubbleText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxW && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

export function getTailAttachment(
  bx: number,
  by: number,
  w: number,
  h: number,
  tx: number,
  ty: number
): TailAttachment {
  const cx = bx + w / 2;
  const cy = by + h / 2;
  const dx = tx - cx;
  const dy = ty - cy;

  let side: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  if (Math.abs(dx) > Math.abs(dy)) {
    side = dx > 0 ? 'right' : 'left';
  } else {
    side = dy > 0 ? 'bottom' : 'top';
  }

  const baseWidth = Math.min(24, Math.min(w, h) / 3);
  const halfBase = baseWidth / 2;

  let base1 = { x: cx - halfBase, y: by + h };
  let base2 = { x: cx + halfBase, y: by + h };

  if (side === 'bottom') {
    const clampX = Math.max(bx + 12 + halfBase, Math.min(bx + w - 12 - halfBase, tx));
    base1 = { x: clampX - halfBase, y: by + h };
    base2 = { x: clampX + halfBase, y: by + h };
  } else if (side === 'top') {
    const clampX = Math.max(bx + 12 + halfBase, Math.min(bx + w - 12 - halfBase, tx));
    base1 = { x: clampX - halfBase, y: by };
    base2 = { x: clampX + halfBase, y: by };
  } else if (side === 'right') {
    const clampY = Math.max(by + 12 + halfBase, Math.min(by + h - 12 - halfBase, ty));
    base1 = { x: bx + w, y: clampY - halfBase };
    base2 = { x: bx + w, y: clampY + halfBase };
  } else if (side === 'left') {
    const clampY = Math.max(by + 12 + halfBase, Math.min(by + h - 12 - halfBase, ty));
    base1 = { x: bx, y: clampY - halfBase };
    base2 = { x: bx, y: clampY + halfBase };
  }

  return { side, base1, base2, tip: { x: tx, y: ty } };
}

function pathSpeechShapeWithTail(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  w: number,
  h: number,
  tx: number,
  ty: number
): void {
  const r = Math.min(16, h / 3);
  const att = getTailAttachment(bx, by, w, h, tx, ty);

  ctx.beginPath();
  ctx.moveTo(bx + r, by);

  if (att.side === 'top') {
    ctx.lineTo(att.base1.x, by);
    ctx.lineTo(att.tip.x, att.tip.y);
    ctx.lineTo(att.base2.x, by);
  }
  ctx.lineTo(bx + w - r, by);
  ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);

  if (att.side === 'right') {
    ctx.lineTo(bx + w, att.base1.y);
    ctx.lineTo(att.tip.x, att.tip.y);
    ctx.lineTo(bx + w, att.base2.y);
  }
  ctx.lineTo(bx + w, by + h - r);
  ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);

  if (att.side === 'bottom') {
    ctx.lineTo(att.base2.x, by + h);
    ctx.lineTo(att.tip.x, att.tip.y);
    ctx.lineTo(att.base1.x, by + h);
  }
  ctx.lineTo(bx + r, by + h);
  ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);

  if (att.side === 'left') {
    ctx.lineTo(bx, att.base2.y);
    ctx.lineTo(att.tip.x, att.tip.y);
    ctx.lineTo(bx, att.base1.y);
  }
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);

  ctx.closePath();
}

function pathThoughtShape(ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number): void {
  const cx = bx + w / 2;
  const cy = by + h / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function pathShoutShape(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  w: number,
  h: number,
  tx?: number,
  ty?: number
): void {
  const cx = bx + w / 2;
  const cy = by + h / 2;
  const numSpikes = 14;
  const rxOuter = w / 2 + 10;
  const ryOuter = h / 2 + 10;
  const rxInner = w / 2 - 4;
  const ryInner = h / 2 - 4;

  ctx.beginPath();
  for (let i = 0; i < numSpikes; i++) {
    const angle = (i * Math.PI * 2) / numSpikes;
    const isOuter = i % 2 === 0;
    let rx = isOuter ? rxOuter : rxInner;
    let ry = isOuter ? ryOuter : ryInner;

    // Extend closest spike to target tail if present
    if (tx !== undefined && ty !== undefined && i === 6) {
      ctx.lineTo(tx, ty);
      continue;
    }

    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function pathBoxShape(ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.rect(bx, by, w, h);
  ctx.closePath();
}

function pathStickyShape(ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number): void {
  const fold = Math.min(16, Math.min(w, h) / 3);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + w, by);
  ctx.lineTo(bx + w, by + h - fold);
  ctx.lineTo(bx + w - fold, by + h);
  ctx.lineTo(bx, by + h);
  ctx.closePath();
}

function drawStickyFold(ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number, options: SpeechBubbleOptions): void {
  const fold = Math.min(16, Math.min(w, h) / 3);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bx + w - fold, by + h);
  ctx.lineTo(bx + w - fold, by + h - fold);
  ctx.lineTo(bx + w, by + h - fold);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fill();
  ctx.strokeStyle = options.borderColor;
  ctx.lineWidth = Math.max(1, options.borderWidth * 0.8);
  ctx.stroke();
  ctx.restore();
}

function pathLabelShape(ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number): void {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + w - r, by);
  ctx.arc(bx + w - r, by + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(bx + r, by + h);
  ctx.arc(bx + r, by + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
}

function pathPointerShapeWithTail(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  w: number,
  h: number,
  tx: number,
  ty: number
): void {
  pathSpeechShapeWithTail(ctx, bx, by, w, h, tx, ty);
}

function drawThoughtBubblesTrail(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  w: number,
  h: number,
  tx: number,
  ty: number,
  options: SpeechBubbleOptions
): void {
  const cx = bx + w / 2;
  const cy = by + h / 2;
  const steps = 3;

  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const px = cx + (tx - cx) * t;
    const py = cy + (ty - cy) * t;
    const r = Math.max(2.5, 7 - i * 1.4);

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    if (options.backgroundColor !== 'transparent') {
      ctx.fillStyle = options.backgroundColor;
      ctx.fill();
    }
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.stroke();
  }
}

export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: SpeechBubbleOptions,
  customTailX?: number,
  customTailY?: number
): void {
  ctx.save();
  ctx.font = `bold ${options.fontSize}px "Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif`;

  const maxW = 220;
  const lines = wrapBubbleText(ctx, options.text || 'Hello!', maxW);
  let maxLineWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  }

  const paddingX = Math.max(16, options.fontSize * 0.8);
  const paddingY = Math.max(12, options.fontSize * 0.6);
  const lineHeight = options.fontSize * 1.25;

  const bubbleW = Math.max(70, maxLineWidth + paddingX * 2);
  const bubbleH = Math.max(45, lines.length * lineHeight + paddingY * 2);

  const bx = x - bubbleW / 2;
  const by = y - bubbleH / 2;

  const tx = customTailX !== undefined ? customTailX : (options.tailX !== undefined ? options.tailX : x - 25);
  const ty = customTailY !== undefined ? customTailY : (options.tailY !== undefined ? options.tailY : y + bubbleH / 2 + 25);

  if (options.shape === 'speech') pathSpeechShapeWithTail(ctx, bx, by, bubbleW, bubbleH, tx, ty);
  else if (options.shape === 'thought') pathThoughtShape(ctx, bx, by, bubbleW, bubbleH);
  else if (options.shape === 'shout') pathShoutShape(ctx, bx, by, bubbleW, bubbleH, tx, ty);
  else if (options.shape === 'sticky') pathStickyShape(ctx, bx, by, bubbleW, bubbleH);
  else if (options.shape === 'label') pathLabelShape(ctx, bx, by, bubbleW, bubbleH);
  else if (options.shape === 'pointer') pathPointerShapeWithTail(ctx, bx, by, bubbleW, bubbleH, tx, ty);
  else pathBoxShape(ctx, bx, by, bubbleW, bubbleH);

  if (options.backgroundColor !== 'transparent') {
    ctx.fillStyle = options.backgroundColor;
    ctx.fill();
  }
  ctx.strokeStyle = options.borderColor;
  ctx.lineWidth = options.borderWidth;
  ctx.stroke();

  if (options.shape === 'thought') {
    drawThoughtBubblesTrail(ctx, bx, by, bubbleW, bubbleH, tx, ty, options);
  } else if (options.shape === 'sticky') {
    drawStickyFold(ctx, bx, by, bubbleW, bubbleH, options);
  }

  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startY = by + paddingY + lineHeight / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });

  ctx.restore();
}

export interface BubbleBounds {
  bx: number;
  by: number;
  width: number;
  height: number;
}

export function getSpeechBubbleBounds(ctx: CanvasRenderingContext2D, x: number, y: number, options: SpeechBubbleOptions): BubbleBounds {
  ctx.save();
  ctx.font = `bold ${options.fontSize}px "Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif`;

  const maxW = 220;
  const lines = wrapBubbleText(ctx, options.text || 'Hello!', maxW);
  let maxLineWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  }

  const paddingX = Math.max(16, options.fontSize * 0.8);
  const paddingY = Math.max(12, options.fontSize * 0.6);
  const lineHeight = options.fontSize * 1.25;

  const bubbleW = Math.max(70, maxLineWidth + paddingX * 2);
  const bubbleH = Math.max(45, lines.length * lineHeight + paddingY * 2);

  const bx = x - bubbleW / 2;
  const by = y - bubbleH / 2;
  ctx.restore();

  return { bx, by, width: bubbleW, height: bubbleH };
}

export function isPointInBubble(ctx: CanvasRenderingContext2D, px: number, py: number, x: number, y: number, options: SpeechBubbleOptions): boolean {
  const bounds = getSpeechBubbleBounds(ctx, x, y, options);
  const padding = 10;
  return (
    px >= bounds.bx - padding &&
    px <= bounds.bx + bounds.width + padding &&
    py >= bounds.by - padding &&
    py <= bounds.by + bounds.height + padding
  );
}
