export type CategoryType = 
  | 'Mandalas' 
  | 'Cute Animals' 
  | 'Castle & Dragons' 
  | 'Fantasy & Space' 
  | 'Nature & Botanical'
  | 'Custom'
  | (string & {});

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Intricate';

export type PageAspectRatio = '1:1' | '4:5' | '5:4' | '16:9' | 'auto';

export interface ColoringPage {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  tags: string[];
  lineArtDataUrl: string; // SVG data URL or high-contrast PNG data URL
  thumbnailDataUrl?: string;
  createdAt: number;
  isPreset: boolean;
  difficulty: DifficultyLevel;
  likes?: number;
  isFavorite?: boolean;
  author?: string;
  initialColorDataUrl?: string;
  artworkId?: string;
  folder?: string;
  relativePath?: string;
  lastEditedAt?: number;
  aspectRatio?: PageAspectRatio;
  width?: number;
  height?: number;
  transform?: CanvasTransform;
  placedLines?: PlacedLine[];
  placedCircles?: PlacedCircle[];
  placedSquares?: PlacedSquare[];
  placedSpirals?: PlacedSpiral[];
  placedBubbles?: PlacedSpeechBubble[];
  placedStamps?: PlacedStamp[];
}

export interface SavedArtwork {
  id: string;
  pageId: string;
  title: string;
  coloredDataUrl: string; // Data URL of the completed colored artwork
  lineArtDataUrl: string;
  completedAt: number;
  paletteUsed: string[];
  category: CategoryType;
  aspectRatio?: PageAspectRatio;
  width?: number;
  height?: number;
  transform?: CanvasTransform;
  placedLines?: PlacedLine[];
  placedCircles?: PlacedCircle[];
  placedSquares?: PlacedSquare[];
  placedSpirals?: PlacedSpiral[];
  placedBubbles?: PlacedSpeechBubble[];
  placedStamps?: PlacedStamp[];
}

export type StudioTool = 'bucket' | 'brush' | 'eraser' | 'line' | 'picker' | 'pan' | 'bubble' | 'select' | 'transform' | 'stencil' | 'spiral' | 'circle' | 'square' | 'stamp';

export type BrushStyle = 'solid' | 'crayon' | 'pencil' | 'marker' | 'neon' | 'glitter' | 'spray';

export type StencilCategory = 'Shapes' | 'Nature' | 'Fun' | 'Mandalas' | 'Custom';

export interface StencilDef {
  id: string;
  name: string;
  category: StencilCategory;
  icon: string;
  svgPath: string;
  viewBox?: string;
}

export type FillMode = 'solid' | 'linear-gradient' | 'radial-gradient' | 'spiral-gradient' | 'texture';

export type TextureStyle = 'noise' | 'halftone' | 'hatch' | 'linen' | 'glitter';

export interface GradientOptions {
  mode: FillMode;
  color2: string; // Secondary color for gradients (Color 1 is activeColor)
  angle: number; // Linear gradient angle in degrees (0..360)
  textureStyle: TextureStyle;
  textureScale: number;
  textureOpacity: number;
}

export const DEFAULT_GRADIENT_OPTIONS: GradientOptions = {
  mode: 'solid',
  color2: '#FFFFFF',
  angle: 45,
  textureStyle: 'noise',
  textureScale: 1.0,
  textureOpacity: 0.5
};

export type GridType = 'none' | 'line' | 'dot';

export interface GridOptions {
  type: GridType;
  size: number; // Grid spacing in px (20..100)
  opacity: number; // Visibility opacity (0.1 to 1.0)
  color: string; // Grid line or dot color
  offsetX: number; // Horizontal grid shift in px
  offsetY: number; // Vertical grid shift in px
}

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  type: 'none',
  size: 40,
  opacity: 0.35,
  color: '#000000',
  offsetX: 0,
  offsetY: 0
};

export interface ActiveStencilState {
  stencilId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isInverted: boolean;
}

export interface CanvasTransform {
  scale: number; // 0.5 to 3.0
  rotation: number; // 0 to 360 degrees
  flipH: boolean;
  flipV: boolean;
  offsetX: number;
  offsetY: number;
  targetMode?: 'all' | 'color';
  targetColor?: string;
  replacementColor?: string;
  colorTolerance?: number;
}

export type BubbleShape = 'speech' | 'thought' | 'shout' | 'box' | 'sticky' | 'label' | 'pointer';

export interface SpeechBubbleOptions {
  text: string;
  shape: BubbleShape;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  tailX?: number;
  tailY?: number;
}

export interface PlacedSpeechBubble {
  id: string;
  x: number;
  y: number;
  options: SpeechBubbleOptions;
  tailX?: number;
  tailY?: number;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface PlacedLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  size: number;
  style: BrushStyle;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface PlacedSpiral {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  turns?: number;
  color: string;
  size: number;
  style: BrushStyle;
  fillColor?: string;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface PlacedCircle {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  color: string;
  size: number;
  style: BrushStyle;
  fillColor?: string;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface PlacedSquare {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  size: number;
  style: BrushStyle;
  fillColor?: string;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  isDefault?: boolean;
}

export type LineArtMethod = 'sobel' | 'imagemagick-lat' | 'imagemagick-dog';

export interface ProcessingSettings {
  method?: LineArtMethod; // 'sobel' | 'imagemagick-lat' | 'imagemagick-dog'
  contrast: number; // 1 to 10
  thickness: number; // 1 to 5
  invert: boolean;
  cleanNoise: boolean;
  scale?: number; // 0.2 to 3.0 (default 1.0)
  rotation?: number; // 0 to 360 degrees (default 0)
  flipH?: boolean; // Flip horizontal
  flipV?: boolean; // Flip vertical
  offsetX?: number; // X position offset in px
  offsetY?: number; // Y position offset in px
}

export type StampCategory = 'Shapes' | 'Nature' | 'Magic' | 'Fun';

export interface StampDef {
  id: string;
  name: string;
  category: StampCategory;
  icon: string;
  svgPath: string;
  viewBox?: string;
}

export interface PlacedStamp {
  id: string;
  stampId: string;
  cx: number;
  cy: number;
  size: number;
  rotation?: number;
  color: string;
  fillColor?: string;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}
