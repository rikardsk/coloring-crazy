import Dexie, { Table } from 'dexie';
import { ColoringPage, SavedArtwork, ColorPalette, CategoryType } from '../types/coloring';
import { PRESET_PAGES } from './presets';

export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: 'palette-pastel',
    name: 'Pastel Dreams',
    colors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F3D1F4', '#FFF5BA'],
    isDefault: true
  },
  {
    id: 'palette-vibrant',
    name: 'Vibrant Pop',
    colors: ['#FF2A6D', '#05D9E8', '#005670', '#D1F7FF', '#FFC857', '#E9724C', '#C5283D'],
    isDefault: true
  },
  {
    id: 'palette-earth',
    name: 'Earth & Nature',
    colors: ['#2D5A27', '#8FBC8F', '#D2B48C', '#8B4513', '#CD853F', '#F4A460', '#E0EEE0'],
    isDefault: true
  },
  {
    id: 'palette-neon',
    name: 'Neon Cyber',
    colors: ['#FF007F', '#00F0FF', '#7000FF', '#FFE600', '#00FF66', '#FF5500', '#FFFFFF'],
    isDefault: true
  },
  {
    id: 'palette-retro',
    name: 'Retro Vintage',
    colors: ['#CC5577', '#EEDD88', '#77AADD', '#FFAABB', '#99DDFF', '#44BB99', '#AAAA44'],
    isDefault: true
  }
];

export class ColoringDB extends Dexie {
  pages!: Table<ColoringPage, string>;
  artworks!: Table<SavedArtwork, string>;
  palettes!: Table<ColorPalette, string>;

  constructor() {
    super('ColoringCrazyDB');
    this.version(1).stores({
      pages: 'id, category, isPreset, isFavorite, createdAt',
      artworks: 'id, pageId, completedAt, category'
    });
    this.version(2).stores({
      pages: 'id, category, isPreset, isFavorite, createdAt',
      artworks: 'id, pageId, completedAt, category',
      palettes: 'id, name, isDefault'
    });
  }
}

export const db = new ColoringDB();

// Seed initial database presets if empty
export async function initDatabase(): Promise<void> {
  try {
    const count = await db.pages.count();
    if (count === 0) {
      await db.pages.bulkAdd(PRESET_PAGES);
    }
    const palCount = await db.palettes.count();
    if (palCount === 0) {
      await db.palettes.bulkAdd(DEFAULT_PALETTES);
    }
  } catch (err) {
    console.warn('Dexie DB seed warning:', err);
  }
}

const CUSTOM_PAGES_LS_KEY = 'coloring_crazy_custom_pages';

function getLocalStoragePages(): ColoringPage[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PAGES_LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoragePage(page: ColoringPage) {
  try {
    const existing = getLocalStoragePages();
    const filtered = existing.filter(p => p.id !== page.id);
    const updated = [page, ...filtered];
    localStorage.setItem(CUSTOM_PAGES_LS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }
}

// Fetch all pages sorted by custom pages first, then newest
export async function getAllPages(): Promise<ColoringPage[]> {
  let dbPages: ColoringPage[] = [];
  try {
    await initDatabase();
    dbPages = await db.pages.toArray();
  } catch (err) {
    console.error('Dexie DB Error in getAllPages:', err);
  }

  // 1. Merge LocalStorage pages if missing
  const lsPages = getLocalStoragePages();
  const existingIds = new Set(dbPages.map(p => p.id));
  for (const lsp of lsPages) {
    if (!existingIds.has(lsp.id)) {
      dbPages.push(lsp);
      existingIds.add(lsp.id);
    }
  }

  // 2. Fetch server directory pages (server/custom_pages/)
  try {
    const res = await fetch('/api/server-pages');
    if (res.ok) {
      const data = await res.json();
      if (data.pages && Array.isArray(data.pages)) {
        for (const sp of data.pages) {
          const isDuplicate = dbPages.some(
            p => p.id === sp.id || (p.title && sp.title && p.title.toLowerCase().replace(/[^a-z0-9]/g, '') === sp.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );
          if (!isDuplicate) {
            dbPages.push(sp);
          }
        }
      }
    }
  } catch {
    // Server proxy endpoint offline, fallback to local
  }

  if (dbPages.length === 0) {
    return [...PRESET_PAGES];
  }

  // 3. Ensure preset pages are included if missing
  const dbPresetIds = new Set(dbPages.map(p => p.id));
  for (const preset of PRESET_PAGES) {
    if (!dbPresetIds.has(preset.id)) {
      dbPages.push(preset);
    }
  }

  // 4. Filter out deleted pages
  const deletedSet = getDeletedPageIds();
  const activePages = dbPages.filter(p => !deletedSet.has(p.id));

  // 5. Sort: Custom user & server pages FIRST (newest created first), then presets
  return activePages.sort((a, b) => {
    const aIsPreset = Boolean(a.isPreset);
    const bIsPreset = Boolean(b.isPreset);
    if (aIsPreset !== bIsPreset) {
      return aIsPreset ? 1 : -1; // Custom pages at the top!
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

const DELETED_PAGES_LS_KEY = 'coloring_crazy_deleted_page_ids';

function getDeletedPageIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PAGES_LS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markPageAsDeleted(id: string): void {
  try {
    const set = getDeletedPageIds();
    set.add(id);
    localStorage.setItem(DELETED_PAGES_LS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to save deleted page ID:', err);
  }
}

// Save page progress (persists to IndexedDB and LocalStorage without spawning duplicate disk files)
export async function savePageProgress(page: ColoringPage): Promise<string> {
  try {
    await db.pages.put(page);
  } catch (err) {
    console.error('Failed to save page progress to IndexedDB:', err);
  }

  saveLocalStoragePage(page);
  return page.id;
}

// Save custom line art page (persists locally to IndexedDB & LocalStorage for this user)
export async function saveCustomPage(page: ColoringPage): Promise<string> {
  try {
    await db.pages.put(page);
  } catch (err) {
    console.error('Failed to save page to IndexedDB:', err);
  }

  saveLocalStoragePage(page);
  return page.id;
}

// Toggle favorite status (supports presets, server pages, and custom pages)
export async function toggleFavorite(pageId: string, pageObj?: ColoringPage): Promise<boolean> {
  try {
    let page = await db.pages.get(pageId);
    if (!page) {
      if (pageObj) {
        page = { ...pageObj, isFavorite: false };
      } else {
        const presetsAndServer = await getAllPages();
        const found = presetsAndServer.find(p => p.id === pageId);
        if (found) page = { ...found, isFavorite: false };
      }
      if (page) await db.pages.put(page);
    }
    
    if (!page) return false;
    const newFavStatus = !page.isFavorite;
    await db.pages.update(pageId, { isFavorite: newFavStatus });
    saveLocalStoragePage({ ...page, isFavorite: newFavStatus });
    return newFavStatus;
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
    return false;
  }
}

const DELETED_ARTWORKS_LS_KEY = 'coloring_crazy_deleted_artwork_ids';

export function getDeletedArtworkIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_ARTWORKS_LS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markArtworkAsDeleted(id: string): void {
  try {
    const set = getDeletedArtworkIds();
    set.add(id);
    localStorage.setItem(DELETED_ARTWORKS_LS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to save deleted artwork ID:', err);
  }
}

export function unmarkArtworkAsDeleted(id: string): void {
  try {
    const set = getDeletedArtworkIds();
    set.delete(id);
    localStorage.setItem(DELETED_ARTWORKS_LS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to unmark deleted artwork ID:', err);
  }
}

export function isArtworkDeleted(id: string): boolean {
  return getDeletedArtworkIds().has(id);
}

// Save finished artwork
export async function saveArtwork(artwork: SavedArtwork): Promise<string> {
  unmarkArtworkAsDeleted(artwork.id);
  try {
    await db.artworks.put(artwork);
  } catch (err) {
    console.error('Failed to save artwork:', err);
  }
  return artwork.id;
}

// Fetch all finished artworks
export async function getAllArtworks(): Promise<SavedArtwork[]> {
  try {
    const all = await db.artworks.orderBy('completedAt').reverse().toArray();
    const deletedSet = getDeletedArtworkIds();
    return all.filter(art => !deletedSet.has(art.id));
  } catch (err) {
    console.error('Dexie DB Error in getAllArtworks:', err);
    return [];
  }
}

// Delete an artwork
export async function deleteArtwork(id: string): Promise<void> {
  markArtworkAsDeleted(id);
  try {
    await db.artworks.delete(id);
  } catch (err) {
    console.error('Failed to delete artwork:', err);
  }
}

// Delete a page locally from GUI (hides from user's IndexedDB & LocalStorage without deleting server template files)
export async function deletePage(id: string): Promise<void> {
  markPageAsDeleted(id);

  try {
    await db.pages.delete(id);
  } catch (err) {
    console.error('Failed to delete page from Dexie:', err);
  }

  try {
    const lsPages = getLocalStoragePages().filter(p => p.id !== id);
    localStorage.setItem(CUSTOM_PAGES_LS_KEY, JSON.stringify(lsPages));
  } catch {}
}

// Update page tags & category details
export async function updatePageTags(pageId: string, tags: string[]): Promise<void> {
  try {
    await db.pages.update(pageId, { tags });
  } catch (err) {
    console.error('Failed to update page tags:', err);
  }
}

export async function updatePageDetails(pageId: string, details: { title?: string; tags?: string[]; category?: CategoryType }): Promise<void> {
  try {
    await db.pages.update(pageId, details);
  } catch (err) {
    console.error('Failed to update page details:', err);
  }
}

// Fetch all color palettes
export async function getAllPalettes(): Promise<ColorPalette[]> {
  try {
    await initDatabase();
    const pals = await db.palettes.toArray();
    return pals.length > 0 ? pals : DEFAULT_PALETTES;
  } catch (err) {
    console.error('Dexie DB Error in getAllPalettes:', err);
    return DEFAULT_PALETTES;
  }
}

// Save or update custom palette
export async function savePalette(palette: ColorPalette): Promise<string> {
  try {
    await db.palettes.put(palette);
  } catch (err) {
    console.error('Failed to save palette:', err);
  }
  return palette.id;
}

// Delete custom palette
export async function deletePalette(id: string): Promise<void> {
  try {
    await db.palettes.delete(id);
  } catch (err) {
    console.error('Failed to delete palette:', err);
  }
}
