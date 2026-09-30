import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getAllResources, 
  addCustomResource, 
  deleteCustomResource, 
  getCustomResources 
} from './resources';

describe('Resources Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns preset resources by default', () => {
    const resources = getAllResources();
    expect(resources.length).toBeGreaterThan(0);
    expect(resources.some(r => r.id === 'super-coloring')).toBe(true);
  });

  it('adds custom resource link and normalizes URL', () => {
    const added = addCustomResource({
      title: 'My Favorite Line Art Site',
      url: 'mylineart.com/pages',
      category: 'Custom',
      description: 'Cool custom drawings'
    });

    expect(added.url).toBe('https://mylineart.com/pages');
    expect(added.isPreset).toBe(false);

    const custom = getCustomResources();
    expect(custom.length).toBe(1);
    expect(custom[0].title).toBe('My Favorite Line Art Site');
  });

  it('deletes custom resource link', () => {
    const added = addCustomResource({
      title: 'Temp Site',
      url: 'https://example.com',
      category: 'Custom',
      description: 'Test'
    });

    deleteCustomResource(added.id);
    const custom = getCustomResources();
    expect(custom.length).toBe(0);
  });
});
