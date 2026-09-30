import { describe, it, expect } from 'vitest';
import { 
  interpolateColor, 
  computeLinearGradientFactor, 
  computeRadialGradientFactor, 
  computeSpiralGradientFactor,
  applyTextureEffect, 
  calculateFilledPixelColor 
} from './gradientService';
import { RGBA } from './floodFill';

describe('gradientService', () => {
  const red: RGBA = { r: 255, g: 0, b: 0, a: 255 };
  const blue: RGBA = { r: 0, g: 0, b: 255, a: 255 };

  it('interpolates colors correctly at parameter t', () => {
    const mid = interpolateColor(red, blue, 0.5);
    expect(mid.r).toBe(128);
    expect(mid.g).toBe(0);
    expect(mid.b).toBe(128);

    const start = interpolateColor(red, blue, 0);
    expect(start).toEqual(red);

    const end = interpolateColor(red, blue, 1);
    expect(end).toEqual(blue);
  });

  it('computes linear gradient factor along bounding box', () => {
    const minX = 0, minY = 0, maxX = 100, maxY = 100;
    const factorStart = computeLinearGradientFactor(0, 50, minX, minY, maxX, maxY, 0);
    const factorEnd = computeLinearGradientFactor(100, 50, minX, minY, maxX, maxY, 0);

    expect(factorStart).toBeCloseTo(0, 1);
    expect(factorEnd).toBeCloseTo(1, 1);
  });

  it('computes radial gradient factor from center to edge', () => {
    const minX = 0, minY = 0, maxX = 100, maxY = 100;
    const centerFactor = computeRadialGradientFactor(50, 50, minX, minY, maxX, maxY);
    const edgeFactor = computeRadialGradientFactor(100, 50, minX, minY, maxX, maxY);

    expect(centerFactor).toBe(0);
    expect(edgeFactor).toBe(1);
  });

  it('computes spiral gradient factor within bounding box', () => {
    const minX = 0, minY = 0, maxX = 100, maxY = 100;
    const centerFactor = computeSpiralGradientFactor(50, 50, minX, minY, maxX, maxY, 0);
    expect(centerFactor).toBeGreaterThanOrEqual(0);
    expect(centerFactor).toBeLessThanOrEqual(1);

    const spiralColor = calculateFilledPixelColor(25, 25, minX, minY, maxX, maxY, '#FF0000', {
      mode: 'spiral-gradient',
      color2: '#0000FF',
      angle: 45,
      textureStyle: 'noise',
      textureScale: 1.0,
      textureOpacity: 0.5
    });

    expect(spiralColor.a).toBe(255);
  });

  it('applies texture effects without crashing', () => {
    const textured = applyTextureEffect(10, 10, red, 'noise', 1.0, 0.5);
    expect(textured.a).toBe(255);
  });

  it('calculates pixel color with gradient options', () => {
    const solidColor = calculateFilledPixelColor(10, 10, 0, 0, 100, 100, '#FF0000', {
      mode: 'solid',
      color2: '#0000FF',
      angle: 0,
      textureStyle: 'noise',
      textureScale: 1.0,
      textureOpacity: 0.5
    });

    expect(solidColor.r).toBe(255);
    expect(solidColor.g).toBe(0);
    expect(solidColor.b).toBe(0);
  });
});
