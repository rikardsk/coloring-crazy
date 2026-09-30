import { describe, it, expect } from 'vitest';
import { extractAndCleanSvg } from './lineArtGenerator';

describe('extractAndCleanSvg', () => {
  it('extracts raw SVG XML wrapped in markdown code blocks', () => {
    const raw = "```xml\n<svg viewBox=\"0 0 800 800\" width=\"800\" height=\"800\"><circle cx=\"100\" cy=\"100\" r=\"50\"/></svg>\n```";
    const clean = extractAndCleanSvg(raw);
    expect(clean).toContain('<svg');
    expect(clean).toContain('</svg>');
    expect(clean).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('auto-closes truncated SVG tag if closing tag is omitted', () => {
    const raw = '<svg viewBox="0 0 800 800"><path d="M 0 0 L 100 100"/>';
    const clean = extractAndCleanSvg(raw);
    expect(clean).toContain('</svg>');
  });

  it('wraps inner vector elements in a complete SVG container if root svg tag is omitted', () => {
    const raw = '<path d="M 10 10 L 50 50" stroke="black"/>';
    const clean = extractAndCleanSvg(raw);
    expect(clean).toContain('<svg');
    expect(clean).toContain('<path d="M 10 10 L 50 50"');
    expect(clean).toContain('</svg>');
  });
});
