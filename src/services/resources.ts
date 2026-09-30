export interface ColoringResource {
  id: string;
  title: string;
  url: string;
  category: 'Free Line Art' | 'Mandalas' | 'Public Domain' | 'Interactive Tools' | 'Custom';
  description: string;
  isPreset?: boolean;
  createdAt?: number;
}

export const PRESET_RESOURCES: ColoringResource[] = [
  {
    id: 'super-coloring',
    title: 'Super Coloring',
    url: 'https://www.supercoloring.com',
    category: 'Free Line Art',
    description: 'Thousands of free printable line art, mandalas, animals, and intricate drawings for kids & adults.',
    isPreset: true
  },
  {
    id: 'coloring-home',
    title: 'Coloring Home',
    url: 'https://coloringhome.com',
    category: 'Free Line Art',
    description: 'Free high-contrast line art templates and printable coloring pages across dozens of themes.',
    isPreset: true
  },
  {
    id: 'openclipart',
    title: 'Openclipart SVG Archive',
    url: 'https://openclipart.org',
    category: 'Public Domain',
    description: '100% free public-domain vector SVG line art drawings ready to download and import.',
    isPreset: true
  },
  {
    id: 'wikimedia-line-art',
    title: 'Wikimedia Commons Line Art',
    url: 'https://commons.wikimedia.org/wiki/Category:Line_art',
    category: 'Public Domain',
    description: 'Massive open repository of historical line art, botanical sketches, and classic book illustrations.',
    isPreset: true
  },
  {
    id: 'mandala-generator',
    title: 'Mandala Generator',
    url: 'https://www.mandalagenerator.com',
    category: 'Mandalas',
    description: 'Interactive online tool to design, generate, and export custom symmetrical mandala patterns.',
    isPreset: true
  },
  {
    id: 'just-color',
    title: 'Just Color (Art & Mandalas)',
    url: 'https://www.justcolor.net',
    category: 'Mandalas',
    description: 'Intricate anti-stress coloring pages, detailed mandalas, and artistic line drawings.',
    isPreset: true
  }
];

const STORAGE_KEY = 'coloring_crazy_user_resources';

export function getCustomResources(): ColoringResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomResources(resources: ColoringResource[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch {}
}

export function addCustomResource(resource: Omit<ColoringResource, 'id' | 'isPreset' | 'createdAt'>): ColoringResource {
  let normalizedUrl = resource.url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const newResource: ColoringResource = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: resource.title.trim(),
    url: normalizedUrl,
    category: resource.category || 'Custom',
    description: resource.description.trim(),
    isPreset: false,
    createdAt: Date.now()
  };

  const existing = getCustomResources();
  const updated = [newResource, ...existing];
  saveCustomResources(updated);
  return newResource;
}

export function deleteCustomResource(id: string): void {
  const existing = getCustomResources();
  const updated = existing.filter(r => r.id !== id);
  saveCustomResources(updated);
}

export function getAllResources(): ColoringResource[] {
  const custom = getCustomResources();
  return [...custom, ...PRESET_RESOURCES];
}
