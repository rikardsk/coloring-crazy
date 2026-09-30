# Doodling, Stenciling & Scribbling Tools Architecture

## Overview
This document outlines the architecture, feature breakdown, and technical roadmap for incorporating **Doodling**, **Stenciling**, and **Scribbling** tools into the ColoringCrazy HTML5 Canvas Studio.

---

## 1. Doodling Tools (Textured & Dynamic Brushes)

### Concepts & Brush Types
* **Crayon / Oil Pastel**: Textured brush tip using a procedural noise alpha mask to produce authentic waxy paper grains.
* **Colored Pencil / Charcoal**: Fine grain texture with subtle opacity buildup on repeated strokes.
* **Marker / Highlighter**: Semi-transparent stroke drawing using `globalCompositeOperation = 'multiply'` for realistic overlay darkening.
* **Neon Glow Pen**: Outer glowing stroke effect using `ctx.shadowBlur` and `ctx.shadowColor`.
* **Glitter / Pattern Stamp Brush**: Emits micro-shapes (stars, hearts, sparkles, confetti) along the stroke path.
* **Stroke Smoothing (Bezier / Quadratic Interpolation)**: Smooths raw pointer input events into fluid, natural curves.

---

## 2. Stenciling Tools (Shape Cutouts & Shield Masks)

### Concepts & Mask Engine
* **Transformable Stencil Overlay**: Interactive semi-transparent shape overlay (rotate, scale, move) positioned over the canvas.
* **Canvas Clip Masking**: When active, drawing operations are restricted to stencil cutout areas using HTML5 canvas clipping (`ctx.clip()`) or composite operations (`destination-in`).
* **Invert Mask (Shielding)**: Option to invert the mask so paint is applied *outside* the shape while protecting the interior.
* **Stencil Library & Custom Loader**: Preset shapes (stars, mandalas, animals, borders, numbers) + custom PNG/SVG mask importer.

---

## 3. Scribbling Tools (Sketchy Strokes & Texture Fills)

### Concepts & Scribble Mechanics
* **Jitter / Sketchy Brush**: Emits multiple randomized micro-strokes per step to create an authentic hand-drawn scribble texture.
* **Scribble Flood Fill**: Extends the flood fill engine to populate bounded line art regions with cross-hatch or scribble patterns instead of flat colors.
* **Dynamic Modifiers**: Modulates scribble line density and jitter based on stroke speed and pen pressure.

---

## Implementation Roadmap

### Phase 1: Doodling Engine & Brush Types
1. Create `src/services/brushEngine.ts` to manage textured strokes, noise patterns, and special effects.
2. Extend `StudioTool` and brush settings in `src/types/coloring.ts`.
3. Integrate textured brush rendering into `src/components/Studio/CanvasContainer.tsx`.
4. Add brush style selection UI to `src/components/Studio/Toolbar.tsx` and `src/components/Studio/FloatingToolbar.tsx`.
5. Add unit tests for brush utilities.

### Phase 2: Stenciling System
1. Create `src/services/stencilService.ts` for mask rendering and canvas clipping calculations.
2. Build `src/components/Studio/StencilOverlay.tsx` for interactive stencil positioning (drag, scale, rotate).
3. Create `src/components/Studio/StencilPickerModal.tsx` for browsing and selecting stencils.
4. Integrate stencil clip masking into `CanvasContainer.tsx`.

### Phase 3: Scribbling & Texture Fill Engine
1. Implement jitter stroke generation in `src/services/scribbleEngine.ts`.
2. Implement pattern flood fill in `src/services/floodFill.ts`.
3. Add scribble controls to the toolbar.
