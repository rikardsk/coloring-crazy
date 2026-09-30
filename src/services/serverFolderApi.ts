import { ColoringPage } from '../types/coloring';
import { db } from './db';

export interface ServerFolderInfo {
  id: string;
  name: string;
  path: string;
  count: number;
  coverDataUrl?: string | null;
}

export async function getServerFolders(): Promise<ServerFolderInfo[]> {
  try {
    const res = await fetch('/api/server-folders');
    if (!res.ok) return [];
    const data = await res.json();
    return data.folders || [];
  } catch (err) {
    console.error('Error fetching server folders:', err);
    return [];
  }
}

export async function getServerFolderPages(folderPath?: string): Promise<ColoringPage[]> {
  try {
    const param = folderPath ? `?folder=${encodeURIComponent(folderPath)}` : '';
    const res = await fetch(`/api/server-pages${param}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.pages || [];
  } catch (err) {
    console.error('Error fetching server folder pages:', err);
    return [];
  }
}



export async function importPagesToLibrary(
  pagesToImport: ColoringPage[],
  overrideCategory?: string
): Promise<number> {
  if (!pagesToImport || pagesToImport.length === 0) return 0;

  let count = 0;
  for (const p of pagesToImport) {
    const category = overrideCategory?.trim() || p.category || 'Server Imports';
    const importedPage: ColoringPage = {
      ...p,
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category,
      isPreset: false,
      createdAt: Date.now()
    };

    try {
      await db.pages.put(importedPage);
      count++;
    } catch (err) {
      console.error('Failed to import page into IndexedDB:', err);
    }
  }

  return count;
}
