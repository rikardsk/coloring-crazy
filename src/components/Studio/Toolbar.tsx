import React from 'react';
import { StudioTool, BrushStyle, PageAspectRatio } from '../../types/coloring';
import { 
  PaintBucket, 
  Paintbrush, 
  Eraser, 
  Pipette, 
  Hand,
  MessageSquare,
  MousePointer, 
  Shapes,
  Undo2, 
  Redo2, 
  RotateCcw,
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff,
  Move,
  Slash,
  Circle,
  Square,
  Minus,
  Plus,
  Wand2,
  ArrowLeft,
  Pencil,
  Grid,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const BRUSH_STYLES: { id: BrushStyle; label: string; icon: string }[] = [
  { id: 'solid', label: 'Solid', icon: '🎨' },
  { id: 'spray', label: 'Spray', icon: '💨' },
  { id: 'crayon', label: 'Crayon', icon: '🖍️' },
  { id: 'pencil', label: 'Pencil', icon: '✏️' },
  { id: 'marker', label: 'Marker', icon: '🖊️' },
  { id: 'neon', label: 'Neon', icon: '⚡' },
  { id: 'glitter', label: 'Glitter', icon: '✨' },
];

export interface ToolbarProps {
  onBack?: () => void;
  title?: string;
  setTitle?: (t: string) => void;
  isEditingTitle?: boolean;
  setIsEditingTitle?: (b: boolean) => void;
  onSaveTitle?: () => void;
  category?: string;
  aspectRatio?: PageAspectRatio;
  onAspectRatioChange?: (ratio: PageAspectRatio) => void;

  activeTool: StudioTool;
  setActiveTool: (tool: StudioTool) => void;
  activeColor?: string;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tolerance: number;
  setTolerance: (tol: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  zoom: number;
  setZoom: (val: number | ((prev: number) => number)) => void;
  onResetZoom: () => void;
  showBrushPreview?: boolean;
  onToggleBrushPreview?: () => void;
  showFloatingToolbar?: boolean;
  onToggleFloatingToolbar?: () => void;
  onExtractLineArt?: () => void;
  brushStyle?: BrushStyle;
  setBrushStyle?: (style: BrushStyle) => void;
  onOpenStencilPicker?: () => void;
  onOpenStampPicker?: () => void;
  showGridSettings?: boolean;
  onToggleGridSettings?: () => void;
  isLayerManagerOpen?: boolean;
  onToggleLayerManager?: () => void;
  onOpenShortcuts?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onBack,
  title = 'Coloring Page',
  setTitle,
  isEditingTitle = false,
  setIsEditingTitle,
  onSaveTitle,
  category,
  aspectRatio = '1:1',
  onAspectRatioChange,
  activeTool,
  setActiveTool,
  activeColor = '#A855F7',
  brushSize,
  setBrushSize,
  tolerance,
  setTolerance,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  setZoom,
  onResetZoom,
  showBrushPreview = true,
  onToggleBrushPreview,
  onExtractLineArt,
  brushStyle = 'solid',
  setBrushStyle,
  onOpenStencilPicker,
  onOpenStampPicker,
  showGridSettings = false,
  onToggleGridSettings,
  isLayerManagerOpen = false,
  onToggleLayerManager,
  onOpenShortcuts
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 shrink-0 select-none flex flex-col">
      {/* Top Header Row: Back (Left), Title (Centered), Category & Paper Size (Right Corner) */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/60 flex items-center justify-between gap-2 relative min-h-[40px]">
        {/* Left: Back Button */}
        <div className="flex items-center space-x-2 shrink-0 z-10">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition shrink-0"
              title="Back to Library"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : null}
        </div>

        {/* Center: Title Editor */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center space-x-1 z-10 pointer-events-auto">
          {isEditingTitle && setTitle && onSaveTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={onSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveTitle();
              }}
              autoFocus
              className="bg-slate-900 border border-purple-500 rounded-lg px-2 py-0.5 text-xs font-semibold text-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 sm:w-52 text-center"
            />
          ) : setIsEditingTitle ? (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center space-x-1 group text-purple-300 hover:text-white transition shrink-0"
              title="Click to edit page title"
            >
              <h2 className="text-xs sm:text-sm font-semibold truncate max-w-[140px] sm:max-w-[260px] text-center">
                {title}
              </h2>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-purple-300 transition opacity-60 group-hover:opacity-100" />
            </button>
          ) : (
            <h2 className="text-xs sm:text-sm font-semibold text-purple-300 truncate max-w-[160px] sm:max-w-[300px] text-center">
              {title}
            </h2>
          )}
        </div>

        {/* Right Corner: Category & Paper Size Dropdown */}
        <div className="flex items-center space-x-2 shrink-0 z-10">
          {category ? (
            <span className="text-[11px] px-2.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800/60 rounded-full font-medium shrink-0">
              {category}
            </span>
          ) : null}

          {onAspectRatioChange ? (
            <select
              value={aspectRatio}
              onChange={(e) => onAspectRatioChange(e.target.value as PageAspectRatio)}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-lg font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 shrink-0"
              title="Change Canvas Aspect Ratio"
            >
              <option value="1:1">1:1 Sq</option>
              <option value="4:5">4:5 Port</option>
              <option value="5:4">5:4 Land</option>
              <option value="16:9">16:9 Wide</option>
              <option value="auto">Auto</option>
            </select>
          ) : null}
        </div>
      </div>

      {/* Main Tools Toolbar Row */}
      <div className="p-2 px-3 flex items-center justify-between gap-2 text-slate-200 overflow-x-auto min-h-[48px]">
        {/* 1. Tool Buttons */}
      <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/50 shrink-0">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'select' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Select & Move (V or S)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('bucket')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'bucket' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Paint Bucket (G or F)"
        >
          <PaintBucket className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setActiveTool('brush');
          }}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'brush' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Paint Brush (B)"
        >
          <Paintbrush className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('eraser')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'eraser' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('picker')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'picker' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Eyedropper (I)"
        >
          <Pipette className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('bubble')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'bubble' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Text & Callouts (T)"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setActiveTool('stencil');
            if (onOpenStencilPicker) onOpenStencilPicker();
          }}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'stencil' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Stencil Tool (S)"
        >
          <Shapes className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setActiveTool('stamp');
            if (onOpenStampPicker) onOpenStampPicker();
          }}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'stamp' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Stickers & Stamp Library"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={() => setActiveTool('spiral')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'spiral' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Spiral Tool (Paints spirals with active brush)"
        >
          <RotateCcw className="w-4 h-4 text-purple-300" />
        </button>

        <button
          onClick={() => setActiveTool('line')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'line' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Line Tool (L - Straight lines at any angle, hold Shift to snap)"
        >
          <Slash className="w-4 h-4 text-purple-300" />
        </button>

        <button
          onClick={() => setActiveTool('circle')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'circle' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Circle Tool (C - Draw perfect circles)"
        >
          <Circle className="w-4 h-4 text-purple-300" />
        </button>

        <button
          onClick={() => setActiveTool('square')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'square' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Square Tool (Q - Draw squares & rectangles)"
        >
          <Square className="w-4 h-4 text-purple-300" />
        </button>

        <button
          onClick={() => setActiveTool('pan')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'pan' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Pan (H)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('transform')}
          className={`p-1.5 rounded-lg transition ${
            activeTool === 'transform' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Transform Tool (M or T)"
        >
          <Move className="w-4 h-4" />
        </button>

        {onExtractLineArt ? (
          <button
            type="button"
            onClick={onExtractLineArt}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-950/80 transition border border-purple-800/40"
            title="Extract Line Art"
          >
            <Wand2 className="w-4 h-4 text-purple-400" />
          </button>
        ) : null}

        {onToggleGridSettings ? (
          <button
            type="button"
            onClick={onToggleGridSettings}
            className={`p-1.5 rounded-lg transition border ${
              showGridSettings
                ? 'bg-purple-600/40 border-purple-500 text-purple-200 shadow'
                : 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900'
            }`}
            title="Line & Dot Grid Overlay Guide"
          >
            <Grid className="w-4 h-4" />
          </button>
        ) : null}

        {onToggleLayerManager ? (
          <button
            type="button"
            onClick={onToggleLayerManager}
            className={`p-1.5 rounded-lg transition border ${
              isLayerManagerOpen
                ? 'bg-purple-600 border-purple-400 text-white shadow'
                : 'text-purple-300 hover:text-white border-purple-800/60 hover:bg-purple-950/80 bg-purple-950/40'
            }`}
            title="Visual Layer Manager Panel"
          >
            <Layers className="w-4 h-4 text-purple-400" />
          </button>
        ) : null}
      </div>

      <div className="h-5 w-px bg-slate-700/80 mx-1 shrink-0" />

      {/* 3. Tool Sliders & Preview */}
      <div className="flex items-center text-xs shrink-0">
        {activeTool === 'brush' || activeTool === 'eraser' ? (
          <div className="flex items-center space-x-1.5 shrink-0">
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => setBrushSize(Math.max(2, brushSize - 2))}
                disabled={brushSize <= 2}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Decrease size ([)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="2"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 sm:w-20 accent-purple-500 cursor-pointer shrink-0"
                title={`Size: ${brushSize}px`}
              />
              <button
                type="button"
                onClick={() => setBrushSize(Math.min(60, brushSize + 2))}
                disabled={brushSize >= 60}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Increase size (])"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="w-6 text-right font-mono text-purple-300 text-xs shrink-0">{brushSize}p</span>

            {/* Visual Indicator & Ring Toggle */}
            <div className="flex items-center space-x-1 shrink-0">
              <div
                className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner"
                title="Size preview"
              >
                <div
                  style={{
                    width: `${Math.min(20, Math.max(2, (brushSize / 60) * 18 + 2))}px`,
                    height: `${Math.min(20, Math.max(2, (brushSize / 60) * 18 + 2))}px`,
                    backgroundColor: activeTool === 'eraser' ? '#FFFFFF' : activeColor
                  }}
                  className="rounded-full transition-all duration-100"
                />
              </div>

              {onToggleBrushPreview ? (
                <button
                  onClick={onToggleBrushPreview}
                  className={`p-1 rounded-lg border text-xs transition ${
                    showBrushPreview
                      ? 'bg-purple-600/30 border-purple-500/60 text-purple-200'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                  title={showBrushPreview ? "Canvas ring: ON" : "Canvas ring: OFF"}
                >
                  {showBrushPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              ) : null}
            </div>

            {activeTool === 'brush' && setBrushStyle ? (
              <div className="flex items-center space-x-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/60 ml-1 shrink-0">
                {BRUSH_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBrushStyle(st.id)}
                    className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                      brushStyle === st.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Brush style: ${st.label}`}
                  >
                    <span>{st.icon}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTool === 'bucket' ? (
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-slate-400 text-xs shrink-0">Tol:</span>
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => setTolerance(Math.max(0, tolerance - 5))}
                disabled={tolerance <= 0}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-16 accent-purple-500 cursor-pointer shrink-0"
                title={`Tolerance: ${tolerance}`}
              />
              <button
                type="button"
                onClick={() => setTolerance(Math.min(100, tolerance + 5))}
                disabled={tolerance >= 100}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="w-5 font-mono text-purple-300 text-xs shrink-0">{tolerance}</span>
          </div>
        ) : null}
      </div>

      <div className="h-5 w-px bg-slate-700/80 mx-1 shrink-0" />

      {/* 4. Zoom & Undo/Redo Controls */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1 bg-slate-950/60 px-1.5 py-0.5 rounded-xl border border-slate-700/50 shrink-0">
          <button
            onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.2).toFixed(2))))}
            className="p-1 text-slate-400 hover:text-white transition shrink-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="40"
            max="400"
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-16 sm:w-20 accent-purple-500 cursor-pointer shrink-0"
            title="Zoom Slider"
          />

          <button
            onClick={() => setZoom(z => Math.min(4, Number((z + 0.2).toFixed(2))))}
            className="p-1 text-slate-400 hover:text-white transition shrink-0"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="w-9 text-center text-[11px] font-mono text-purple-300 shrink-0">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={onResetZoom}
            className="flex items-center space-x-0.5 px-1.5 py-0.5 bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 rounded text-slate-300 hover:text-white text-[11px] font-medium transition shrink-0"
            title="Reset Zoom (0 or R)"
          >
            <RotateCcw className="w-3 h-3 text-purple-400 hover:text-white" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-0.5 border-l border-slate-700/60 pl-1.5 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded transition ${
              canUndo ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded transition ${
              canRedo ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition ml-1"
              title="Keyboard Shortcuts Cheat Sheet (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);
};
