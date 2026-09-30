import React, { useEffect, useState } from 'react';
import { StudioTool, BrushStyle } from '../../types/coloring';
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
  Save, 
  ZoomIn, 
  ZoomOut,
  GripHorizontal,
  X,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Move,
  Slash,
  Circle,
  Square,
  Wand2,
  ChevronUp,
  ChevronDown,
  Grid,
  Sparkles
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

interface FloatingToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: StudioTool;
  setActiveTool: (tool: StudioTool) => void;
  activeColor: string;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tolerance: number;
  setTolerance: (tol: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  zoom: number;
  setZoom: (val: number | ((prev: number) => number)) => void;
  onResetZoom: () => void;
  showBrushPreview: boolean;
  onToggleBrushPreview: () => void;
  onExtractLineArt?: () => void;
  brushStyle?: BrushStyle;
  setBrushStyle?: (style: BrushStyle) => void;
  onOpenStencilPicker?: () => void;
  onOpenStampPicker?: () => void;
  showGridSettings?: boolean;
  onToggleGridSettings?: () => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_floating_toolbar_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 120 };
}

function savePosition(pos: { x: number; y: number }): void {
  try {
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(pos));
  } catch {}
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isOpen,
  onClose,
  activeTool,
  setActiveTool,
  activeColor,
  brushSize,
  setBrushSize,
  tolerance,
  setTolerance,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  zoom,
  setZoom,
  onResetZoom,
  showBrushPreview,
  onToggleBrushPreview,
  onExtractLineArt,
  brushStyle = 'solid',
  setBrushStyle,
  onOpenStencilPicker,
  onOpenStampPicker,
  showGridSettings = false,
  onToggleGridSettings
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(getInitialPosition);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragOffset({ x: clientX - position.x, y: clientY - position.y });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newX = Math.max(8, Math.min(window.innerWidth - 280, clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 300, clientY - dragOffset.y));
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      savePosition(position);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, dragOffset, position]);

  if (!isOpen) return null;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-40 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden select-none flex flex-col text-slate-200 transition-shadow hover:shadow-purple-900/20 animate-fade-in"
    >
      {/* Drag Handle & Header */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-move text-slate-300 hover:text-white transition gap-3"
      >
        <div className="flex items-center space-x-1.5">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <Paintbrush className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold tracking-wide">Floating Toolbar</span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          {onClose ? (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Floating Toolbar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 space-y-3">
        {/* Tool Selectors */}
        <div className="grid grid-cols-8 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'select' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Select & Move (V)"
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
            title="Stencil Mask Tool (S)"
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
            title="Pan Hand (H)"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('transform')}
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'transform' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Canvas Transform Tool (M or T)"
          >
            <Move className="w-4 h-4" />
          </button>
          {onExtractLineArt ? (
            <button
              type="button"
              onClick={onExtractLineArt}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-950 transition"
              title="Extract Line Art from Colorful Photo / Image"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
            </button>
          ) : null}
          {onToggleGridSettings ? (
            <button
              type="button"
              onClick={onToggleGridSettings}
              className={`p-1.5 rounded-lg transition ${
                showGridSettings ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Line & Dot Grid Overlay Guide"
            >
              <Grid className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Active Tool Size / Tolerance Controls */}
        {activeTool === 'brush' || activeTool === 'eraser' ? (
          <div className="space-y-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-1.5">
                <div
                  style={{ backgroundColor: activeTool === 'eraser' ? '#FFFFFF' : activeColor }}
                  className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0"
                  title={`Current color: ${activeColor}`}
                />
                <span>{activeTool === 'eraser' ? 'Eraser Size:' : 'Brush Size:'}</span>
              </div>
              <span className="font-mono text-purple-300 font-bold">{brushSize}px</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setBrushSize(Math.max(2, brushSize - 2))}
                disabled={brushSize <= 2}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Decrease size"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="2"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="flex-1 accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setBrushSize(Math.min(60, brushSize + 2))}
                disabled={brushSize >= 60}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Increase size"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={onToggleBrushPreview}
                className={`p-1 rounded-lg border transition shrink-0 ${
                  showBrushPreview ? 'bg-purple-600/30 border-purple-500/60 text-purple-200' : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
                title={showBrushPreview ? "Canvas brush ring: ON" : "Canvas brush ring: OFF"}
              >
                {showBrushPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {setBrushStyle ? (
              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800">
                {BRUSH_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBrushStyle(st.id)}
                    className={`px-1.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
                      brushStyle === st.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                    title={`Brush style: ${st.label}`}
                  >
                    <span>{st.icon}</span>
                    <span className="text-[10px] truncate">{st.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTool === 'bucket' ? (
          <div className="space-y-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-1.5">
                <div
                  style={{ backgroundColor: activeColor }}
                  className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0"
                  title={`Fill color: ${activeColor}`}
                />
                <span>Fill Tolerance:</span>
              </div>
              <span className="font-mono text-purple-300 font-bold">{tolerance}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setTolerance(Math.max(0, tolerance - 5))}
                disabled={tolerance <= 0}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Decrease tolerance"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setTolerance(Math.min(100, tolerance + 5))}
                disabled={tolerance >= 100}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                title="Increase tolerance"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Action Row: Undo, Redo, Clear, Zoom, Save */}
        <div className="flex items-center justify-between pt-1 gap-1 text-xs">
          <div className="flex items-center space-x-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg border transition ${
                canUndo ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg border transition ${
                canRedo ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClear}
              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-lg transition"
              title="Start Over / Clear Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.2).toFixed(2))))} className="p-0.5 text-slate-400 hover:text-white" title="Zoom Out">
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-purple-300 px-1">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, Number((z + 0.2).toFixed(2))))} className="p-0.5 text-slate-400 hover:text-white" title="Zoom In">
              <ZoomIn className="w-3 h-3" />
            </button>
            <button onClick={onResetZoom} className="p-0.5 text-slate-400 hover:text-purple-300" title="Reset Zoom (R)">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onSave}
            className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow transition transform hover:scale-105"
            title="Save Masterpiece (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      ) : null}
    </div>
  );
};
