import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleFavorite, deletePage, getAllPages, deleteArtwork, isArtworkDeleted, saveArtwork, getAllArtworks, db } from './db';
import { ColoringPage, SavedArtwork } from '../types/coloring';

describe('Favorite and Delete functionality tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('toggles favorite on a server page not initially in IndexedDB', async () => {
    vi.spyOn(db.pages, 'get').mockResolvedValue(undefined as never);
    vi.spyOn(db.pages, 'put').mockResolvedValue('server-dinosaurs-t_rex-svg' as never);
    vi.spyOn(db.pages, 'update').mockResolvedValue(1 as never);

    const mockServerPage: ColoringPage = {
      id: 'server-dinosaurs-t_rex-svg',
      title: 'T Rex',
      description: 'Dino line art',
      category: 'Dinosaurs',
      tags: ['dino'],
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      createdAt: 1000,
      isPreset: false,
      difficulty: 'Medium'
    };

    const result = await toggleFavorite('server-dinosaurs-t_rex-svg', mockServerPage);
    expect(result).toBe(true);
    expect(db.pages.put).toHaveBeenCalled();
    expect(db.pages.update).toHaveBeenCalledWith('server-dinosaurs-t_rex-svg', { isFavorite: true });
  });

  it('deletes a page and prevents it from appearing in getAllPages', async () => {
    vi.spyOn(db.pages, 'delete').mockResolvedValue(undefined as never);

    const mockServerPage: ColoringPage = {
      id: 'server-dinosaurs-t_rex-svg',
      title: 'T Rex',
      description: 'Dino line art',
      category: 'Dinosaurs',
      tags: ['dino'],
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      createdAt: 1000,
      isPreset: false,
      difficulty: 'Medium'
    };

    await deletePage(mockServerPage.id);

    vi.spyOn(db.pages, 'toArray').mockResolvedValue([mockServerPage] as never);

    const pages = await getAllPages();
    const found = pages.find(p => p.id === mockServerPage.id);
    expect(found).toBeUndefined();
  });

  it('tracks deleted artworks and excludes them from getAllArtworks until re-saved', async () => {
    vi.spyOn(db.artworks, 'delete').mockResolvedValue(undefined as never);
    vi.spyOn(db.artworks, 'put').mockResolvedValue('artwork-123' as never);

    const mockArtwork: SavedArtwork = {
      id: 'artwork-123',
      pageId: 'page-123',
      title: 'Dino Masterpiece',
      coloredDataUrl: 'data:image/png;base64,456',
      lineArtDataUrl: 'data:image/svg+xml;base64,123',
      completedAt: 2000,
      paletteUsed: ['#FF0000'],
      category: 'Dinosaurs'
    };

    expect(isArtworkDeleted('artwork-123')).toBe(false);

    await deleteArtwork('artwork-123');
    expect(isArtworkDeleted('artwork-123')).toBe(true);

    const fakeQuery = {
      reverse: () => ({
        toArray: async () => [mockArtwork]
      })
    };
    vi.spyOn(db.artworks, 'orderBy').mockReturnValue(fakeQuery as any);

    const artworksAfterDelete = await getAllArtworks();
    expect(artworksAfterDelete.find(a => a.id === 'artwork-123')).toBeUndefined();

    await saveArtwork(mockArtwork);
    expect(isArtworkDeleted('artwork-123')).toBe(false);
  });
});
