import { describe, it, expect } from 'vitest';
import { ColoringPage } from '../types/coloring';

describe('Last Edited Sort Order tests', () => {
  it('sorts pages by lastEditedAt descending as default', () => {
    const page1: ColoringPage = {
      id: 'p1',
      title: 'Page 1',
      description: '',
      category: 'General',
      tags: [],
      lineArtDataUrl: '',
      createdAt: 1000,
      lastEditedAt: 2000,
      isPreset: false,
      difficulty: 'Easy'
    };

    const page2: ColoringPage = {
      id: 'p2',
      title: 'Page 2',
      description: '',
      category: 'General',
      tags: [],
      lineArtDataUrl: '',
      createdAt: 1500,
      lastEditedAt: 5000, // Recently edited!
      isPreset: false,
      difficulty: 'Easy'
    };

    const page3: ColoringPage = {
      id: 'p3',
      title: 'Page 3',
      description: '',
      category: 'General',
      tags: [],
      lineArtDataUrl: '',
      createdAt: 3000, // No lastEditedAt, falls back to createdAt
      isPreset: false,
      difficulty: 'Easy'
    };

    const pages = [page1, page2, page3];

    const sorted = [...pages].sort((a, b) => {
      const aTime = a.lastEditedAt || a.createdAt || 0;
      const bTime = b.lastEditedAt || b.createdAt || 0;
      return bTime - aTime;
    });

    expect(sorted[0].id).toBe('p2'); // 5000
    expect(sorted[1].id).toBe('p3'); // 3000
    expect(sorted[2].id).toBe('p1'); // 2000
  });
});
