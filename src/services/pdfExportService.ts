import { ColoringPage } from '../types/coloring';

export type PaperSize = 'A4' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type PrintMode = 'lineart' | 'lineart-shapes' | 'full-colored';

export interface PrintPdfOptions {
  page: ColoringPage;
  paperSize: PaperSize;
  orientation: PageOrientation;
  printMode: PrintMode;
  includeFooter?: boolean;
  includePaletteSwatches?: boolean;
  includeBorder?: boolean;
  cleanPaper?: boolean;
  customTitle?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  category: string,
  paperSize: string,
  isLandscape: boolean,
  width: number,
  height: number,
  margin: number,
  headerHeight: number
): void {
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.round(height * 0.026)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, width / 2, margin + headerHeight / 2 - Math.round(height * 0.008));

  ctx.fillStyle = '#64748b';
  ctx.font = `${Math.round(height * 0.011)}px monospace`;
  ctx.fillText(
    `CATEGORY: ${category.toUpperCase()} • FORMAT: ${paperSize} (${isLandscape ? 'LANDSCAPE' : 'PORTRAIT'})`,
    width / 2,
    margin + headerHeight / 2 + Math.round(height * 0.014)
  );

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(2, Math.round(height * 0.001));
  ctx.beginPath();
  ctx.moveTo(margin, margin + headerHeight - 8);
  ctx.lineTo(width - margin, margin + headerHeight - 8);
  ctx.stroke();
}

function drawSwatches(
  ctx: CanvasRenderingContext2D,
  height: number,
  footerY: number,
  footerHeight: number,
  contentX: number,
  contentWidth: number
): void {
  const swatchCount = 8;
  const swatchRadius = Math.round(footerHeight * 0.2);
  const spacing = Math.round((contentWidth - swatchCount * (swatchRadius * 2)) / (swatchCount + 1));
  const startX = contentX + spacing + swatchRadius;
  const swatchesY = footerY + Math.round(footerHeight * 0.45);

  ctx.font = `${Math.round(height * 0.009)}px monospace`;
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText('COLOR TEST SWATCHES:', contentX, swatchesY - swatchRadius - 4);

  for (let i = 0; i < swatchCount; i++) {
    const sx = startX + i * (swatchRadius * 2 + spacing);
    ctx.beginPath();
    ctx.arc(sx, swatchesY, swatchRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(1.5, Math.round(height * 0.0008));
    ctx.stroke();
  }
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  margin: number
): void {
  ctx.fillStyle = '#64748b';
  ctx.font = `${Math.round(height * 0.01)}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText('ColoringCrazy Printable Line Art Library', margin, height - margin / 2);
  ctx.textAlign = 'right';
  ctx.fillText('www.coloringcrazy.app', width - margin, height - margin / 2);
}

/**
 * Renders high-DPI (300 DPI) print canvas formatted for A4 or US Letter paper.
 */
export async function renderHighResPrintCanvas(options: PrintPdfOptions): Promise<HTMLCanvasElement> {
  const {
    page,
    paperSize,
    orientation,
    printMode,
    includeFooter = true,
    includePaletteSwatches = true,
    includeBorder = true,
    cleanPaper = false,
    customTitle
  } = options;

  let isLandscape = false;
  if (orientation === 'landscape') {
    isLandscape = true;
  } else if (orientation === 'auto') {
    if (page.aspectRatio === '16:9' || page.aspectRatio === '5:4') {
      isLandscape = true;
    }
  }

  const width = paperSize === 'A4' ? (isLandscape ? 3508 : 2480) : (isLandscape ? 3300 : 2550);
  const height = paperSize === 'A4' ? (isLandscape ? 2480 : 3508) : (isLandscape ? 2550 : 3300);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2d context');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const showHeader = !cleanPaper;
  const showFooter = !cleanPaper && includeFooter;
  const showSwatches = !cleanPaper && includePaletteSwatches;
  const showBorder = !cleanPaper && includeBorder;

  const margin = Math.round(width * 0.05);
  const headerHeight = showHeader ? Math.round(height * 0.07) : 0;
  const footerHeight = (showFooter || showSwatches) ? Math.round(height * 0.07) : 0;

  const contentX = margin;
  const contentY = margin + headerHeight;
  const contentWidth = width - margin * 2;
  const contentHeight = height - margin * 2 - headerHeight - footerHeight;

  if (showHeader) {
    const titleText = customTitle || page.title || 'Coloring Page';
    drawHeader(ctx, titleText, page.category || 'GENERAL', paperSize, isLandscape, width, height, margin, headerHeight);
  }

  let imageSource = page.lineArtDataUrl;
  if (printMode === 'lineart-shapes' || printMode === 'full-colored') {
    imageSource = page.thumbnailDataUrl || page.initialColorDataUrl || page.lineArtDataUrl;
  }

  try {
    const img = await loadImage(imageSource);
    const imgAspect = (img.naturalWidth || 800) / (img.naturalHeight || 800);
    const boxAspect = contentWidth / contentHeight;

    let drawW = contentWidth;
    let drawH = contentHeight;
    if (imgAspect > boxAspect) {
      drawH = contentWidth / imgAspect;
    } else {
      drawW = contentHeight * imgAspect;
    }

    const drawX = contentX + (contentWidth - drawW) / 2;
    const drawY = contentY + (contentHeight - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    if (showBorder) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(2, Math.round(height * 0.001));
      ctx.strokeRect(drawX, drawY, drawW, drawH);
    }
  } catch (e) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(contentX, contentY, contentWidth, contentHeight);
    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.round(height * 0.02)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(customTitle || page.title || 'Coloring Page', width / 2, height / 2);
  }

  const footerY = height - margin - footerHeight;
  if (showFooter || showSwatches) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(2, Math.round(height * 0.001));
    ctx.beginPath();
    ctx.moveTo(margin, footerY);
    ctx.lineTo(width - margin, footerY);
    ctx.stroke();
  }

  if (showSwatches) {
    drawSwatches(ctx, height, footerY, footerHeight, contentX, contentWidth);
  }

  if (showFooter) {
    drawFooter(ctx, width, height, margin);
  }

  return canvas;
}

/**
 * Constructs a binary PDF-1.4 file Blob from JPEG bytes.
 */
export function createPdfBlobFromJpeg(
  jpegBytes: Uint8Array,
  imgWidthPx: number,
  imgHeightPx: number,
  pageWidthPt: number,
  pageHeightPt: number
): Blob {
  const encoder = new TextEncoder();
  const pad10 = (n: number) => n.toString().padStart(10, '0');

  const header = encoder.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  const obj1Str = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2Str = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3Str = `3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}]\n  /Resources <<\n    /XObject << /Img1 4 0 R >>\n    /ProcSet [/PDF /ImageC /ImageI /ImageB]\n  >>\n  /Contents 5 0 R\n>>\nendobj\n`;

  const obj4HeaderStr = `4 0 obj\n<<\n  /Type /XObject\n  /Subtype /Image\n  /Width ${imgWidthPx}\n  /Height ${imgHeightPx}\n  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n  /Filter /DCTDecode\n  /Length ${jpegBytes.length}\n>>\nstream\n`;
  const obj4FooterStr = `\nendstream\nendobj\n`;

  const contentCmds = `q\n${pageWidthPt.toFixed(2)} 0 0 ${pageHeightPt.toFixed(2)} 0 0 cm\n/Img1 Do\nQ\n`;
  const contentCmdsBytes = encoder.encode(contentCmds);
  const obj5Str = `5 0 obj\n<< /Length ${contentCmdsBytes.length} >>\nstream\n${contentCmds}endstream\nendobj\n`;

  const obj1Bytes = encoder.encode(obj1Str);
  const obj2Bytes = encoder.encode(obj2Str);
  const obj3Bytes = encoder.encode(obj3Str);
  const obj4HeaderBytes = encoder.encode(obj4HeaderStr);
  const obj4FooterBytes = encoder.encode(obj4FooterStr);
  const obj5Bytes = encoder.encode(obj5Str);

  const offset1 = header.length;
  const offset2 = offset1 + obj1Bytes.length;
  const offset3 = offset2 + obj2Bytes.length;
  const offset4 = offset3 + obj3Bytes.length;
  const offset5 = offset4 + obj4HeaderBytes.length + jpegBytes.length + obj4FooterBytes.length;
  const xrefOffset = offset5 + obj5Bytes.length;

  const xrefStr = `xref\n0 6\n0000000000 65535 f \n${pad10(offset1)} 00000 n \n${pad10(offset2)} 00000 n \n${pad10(offset3)} 00000 n \n${pad10(offset4)} 00000 n \n${pad10(offset5)} 00000 n \n`;
  const trailerStr = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const xrefBytes = encoder.encode(xrefStr);
  const trailerBytes = encoder.encode(trailerStr);

  const totalLength = xrefOffset + obj5Bytes.length + xrefBytes.length + trailerBytes.length;
  const pdfBuffer = new Uint8Array(totalLength);

  let pos = 0;
  pdfBuffer.set(header, pos); pos += header.length;
  pdfBuffer.set(obj1Bytes, pos); pos += obj1Bytes.length;
  pdfBuffer.set(obj2Bytes, pos); pos += obj2Bytes.length;
  pdfBuffer.set(obj3Bytes, pos); pos += obj3Bytes.length;
  pdfBuffer.set(obj4HeaderBytes, pos); pos += obj4HeaderBytes.length;
  pdfBuffer.set(jpegBytes, pos); pos += jpegBytes.length;
  pdfBuffer.set(obj4FooterBytes, pos); pos += obj4FooterBytes.length;
  pdfBuffer.set(obj5Bytes, pos); pos += obj5Bytes.length;
  pdfBuffer.set(xrefBytes, pos); pos += xrefBytes.length;
  pdfBuffer.set(trailerBytes, pos); pos += trailerBytes.length;

  return new Blob([pdfBuffer], { type: 'application/pdf' });
}

/**
 * Generates and downloads high-resolution printable PDF.
 */
export async function exportPrintablePdf(options: PrintPdfOptions): Promise<{ blob: Blob; filename: string }> {
  const canvas = await renderHighResPrintCanvas(options);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = dataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const jpegBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    jpegBytes[i] = binaryStr.charCodeAt(i);
  }

  let isLandscape = false;
  if (options.orientation === 'landscape') {
    isLandscape = true;
  } else if (options.orientation === 'auto') {
    if (options.page.aspectRatio === '16:9' || options.page.aspectRatio === '5:4') {
      isLandscape = true;
    }
  }

  const pageWidthPt = options.paperSize === 'A4' ? (isLandscape ? 841.89 : 595.28) : (isLandscape ? 792.00 : 612.00);
  const pageHeightPt = options.paperSize === 'A4' ? (isLandscape ? 595.28 : 841.89) : (isLandscape ? 612.00 : 792.00);

  const blob = createPdfBlobFromJpeg(
    jpegBytes,
    canvas.width,
    canvas.height,
    pageWidthPt,
    pageHeightPt
  );

  const safeTitle = (options.customTitle || options.page.title || 'ColoringPage')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeTitle}_${options.paperSize}_${isLandscape ? 'Landscape' : 'Portrait'}.pdf`;

  return { blob, filename };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
