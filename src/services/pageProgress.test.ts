import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveCustomPage, getAllPages, db } from './db';
import { ColoringPage } from '../types/coloring';

describe('Page progress persistence tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('saves and preserves initialColorDataUrl on a coloring page', async () => {
    vi.spyOn(db.pages, 'put').mockResolvedValue('preset-mandala-1' as never);

    const pageWithColor: ColoringPage = {
      id: 'preset-mandala-1',
      title: 'Sacred Bloom Mandala',
      description: 'An intricate geometric mandala',
      category: 'Mandalas',
      tags: ['mandala'],
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      initialColorDataUrl: 'data:image/png;base64,colored456',
      thumbnailDataUrl: 'data:image/png;base64,merged789',
      createdAt: 1000,
      isPreset: true,
      difficulty: 'Medium'
    };

    await saveCustomPage(pageWithColor);
    expect(db.pages.put).toHaveBeenCalledWith(pageWithColor);
  });

  it('getAllPages includes saved initialColorDataUrl from db', async () => {
    const mockDbPage: ColoringPage = {
      id: 'preset-mandala-1',
      title: 'Sacred Bloom Mandala',
      description: 'An intricate geometric mandala',
      category: 'Mandalas',
      tags: ['mandala'],
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      initialColorDataUrl: 'data:image/png;base64,colored456',
      thumbnailDataUrl: 'data:image/png;base64,merged789',
      createdAt: 1000,
      isPreset: true,
      difficulty: 'Medium'
    };

    vi.spyOn(db.pages, 'count').mockResolvedValue(1 as never);
    vi.spyOn(db.pages, 'toArray').mockResolvedValue([mockDbPage] as never);

    const pages = await getAllPages();
    const mandalaPage = pages.find(p => p.id === 'preset-mandala-1');
    expect(mandalaPage).toBeDefined();
    expect(mandalaPage?.initialColorDataUrl).toBe('data:image/png;base64,colored456');
    expect(mandalaPage?.thumbnailDataUrl).toBe('data:image/png;base64,merged789');
  });

  it('saves and retrieves canvas transform settings on a coloring page', async () => {
    const transformSettings = {
      scale: 1.5,
      rotation: 90,
      flipH: true,
      flipV: false,
      offsetX: 25,
      offsetY: -10
    };

    const mockPage: ColoringPage = {
      id: 'custom-123',
      title: 'Transformed Page',
      description: 'Test page',
      category: 'Custom',
      tags: ['custom'],
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      transform: transformSettings,
      createdAt: 1000,
      isPreset: false,
      difficulty: 'Medium'
    };

    vi.spyOn(db.pages, 'count').mockResolvedValue(1 as never);
    vi.spyOn(db.pages, 'toArray').mockResolvedValue([mockPage] as never);

    const pages = await getAllPages();
    const customPage = pages.find(p => p.id === 'custom-123');
    expect(customPage?.transform).toEqual(transformSettings);
  });
});
