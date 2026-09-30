import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getServerFolders,
  getServerFolderPages,
  importPagesToLibrary
} from './serverFolderApi';
import { db } from './db';

describe('serverFolderApi tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches server folders correctly', async () => {
    const mockFolders = [
      { id: 'dinosaurs', name: 'Dinosaurs', path: 'dinosaurs', count: 3, coverDataUrl: null },
      { id: 'unicorns', name: 'Unicorns', path: 'unicorns', count: 4, coverDataUrl: null }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ folders: mockFolders })
    } as unknown as Response);

    const folders = await getServerFolders();
    expect(folders).toHaveLength(2);
    expect(folders[0].name).toBe('Dinosaurs');
    expect(folders[1].name).toBe('Unicorns');
  });

  it('fetches server folder pages correctly', async () => {
    const mockPages = [
      {
        id: 'server-dinosaurs-t_rex-svg',
        title: 'T Rex',
        category: 'Dinosaurs',
        lineArtDataUrl: 'data:image/svg+xml;base64,123'
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pages: mockPages })
    } as unknown as Response);

    const pages = await getServerFolderPages('dinosaurs');
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toBe('T Rex');
  });



  it('imports pages into library with specified category', async () => {
    vi.spyOn(db.pages, 'put').mockResolvedValue('imported-1' as never);

    const mockPagesToImport = [
      {
        id: 'server-dinosaurs-t_rex-svg',
        title: 'T Rex',
        description: 'T-Rex line art',
        category: 'Dinosaurs',
        tags: ['dino'],
        lineArtDataUrl: 'data:image/svg+xml;base64,123',
        createdAt: 1000,
        isPreset: false,
        difficulty: 'Medium' as const
      }
    ];

    const count = await importPagesToLibrary(mockPagesToImport, 'Dinosaurs');
    expect(count).toBe(1);
    expect(db.pages.put).toHaveBeenCalledTimes(1);
  });
});
