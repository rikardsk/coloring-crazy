import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getCustomStencils, 
  addCustomStencil, 
  deleteCustomStencil, 
  parseSvgContent 
} from './customStencils';

describe('customStencils service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty custom stencils list', () => {
    expect(getCustomStencils()).toEqual([]);
  });

  it('adds a custom stencil and retrieves it', () => {
    const stencil = addCustomStencil('My Star', '🌟', 'M 10 10 L 90 90 Z', '0 0 100 100');
    expect(stencil.name).toBe('My Star');
    expect(stencil.category).toBe('Custom');
    expect(stencil.icon).toBe('🌟');
    expect(stencil.svgPath).toBe('M 10 10 L 90 90 Z');

    const list = getCustomStencils();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(stencil.id);
  });

  it('deletes a custom stencil by ID', () => {
    const s1 = addCustomStencil('Stencil 1', '⭐', 'M 0 0 Z');
    const s2 = addCustomStencil('Stencil 2', '❤️', 'M 1 1 Z');

    expect(getCustomStencils().length).toBe(2);
    const updated = deleteCustomStencil(s1.id);
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe(s2.id);
  });

  it('parses SVG path string correctly from raw SVG XML', () => {
    const svgXml = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 10 10 L 50 50 Z" />
      </svg>
    `;

    const parsed = parseSvgContent(svgXml);
    expect(parsed).not.toBeNull();
    expect(parsed?.svgPath).toBe('M 10 10 L 50 50 Z');
    expect(parsed?.viewBox).toBe('0 0 100 100');
  });

  it('parses raw SVG path string directly without XML tags', () => {
    const rawPath = 'M 100 10 L 126 63 L 185 72 Z';
    const parsed = parseSvgContent(rawPath);
    expect(parsed).not.toBeNull();
    expect(parsed?.svgPath).toBe(rawPath);
  });
});
