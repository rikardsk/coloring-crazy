import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPdfBlobFromJpeg, renderHighResPrintCanvas } from './pdfExportService';
import { ColoringPage } from '../types/coloring';

describe('pdfExportService', () => {
  const dummyJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);

  beforeEach(() => {
    // Mock HTMLImageElement in node/jsdom test env
    globalThis.Image = class {
      onload: (() => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      src = '';
      naturalWidth = 800;
      naturalHeight = 800;
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    const mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
      strokeRect: vi.fn()
    };

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockCtx as any);
  });

  it('creates valid PDF-1.4 blob with correct header and footer structure', async () => {
    const blob = createPdfBlobFromJpeg(
      dummyJpegBytes,
      2480,
      3508,
      595.28,
      841.89
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');

    const buffer = await blob.arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    expect(text).toContain('%PDF-1.4');
    expect(text).toContain('/MediaBox [0 0 595.28 841.89]');
    expect(text).toContain('/Filter /DCTDecode');
    expect(text).toContain('xref');
    expect(text).toContain('trailer');
    expect(text).toContain('%%EOF');
  });

  it('calculates page point dimensions for Letter landscape correctly', async () => {
    const blob = createPdfBlobFromJpeg(
      dummyJpegBytes,
      3300,
      2550,
      792.00,
      612.00
    );

    const text = new TextDecoder().decode(await blob.arrayBuffer());
    expect(text).toContain('/MediaBox [0 0 792.00 612.00]');
  });

  it('renders high res canvas with cleanPaper option enabled', async () => {
    const page: ColoringPage = {
      id: 'test-page',
      title: 'Test Clean Page',
      category: 'animals',
      lineArtDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      aspectRatio: '1:1',
      description: 'Test description',
      tags: ['test'],
      createdAt: Date.now(),
      isPreset: true,
      difficulty: 'Easy'
    };

    const canvas = await renderHighResPrintCanvas({
      page,
      paperSize: 'A4',
      orientation: 'portrait',
      printMode: 'lineart',
      cleanPaper: true
    });

    expect(canvas.width).toBe(2480);
    expect(canvas.height).toBe(3508);
  });
});
