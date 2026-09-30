import React, { useEffect, useState } from 'react';
import { ActiveStencilState, StencilDef } from '../../types/coloring';
import { GripHorizontal, ZoomIn, RotateCw, FlipHorizontal, Trash2, X, Move, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface StencilSettingsBarProps {
  stencilState: ActiveStencilState;
  setStencilState: React.Dispatch<React.SetStateAction<ActiveStencilState | null>>;
  stencilDef: StencilDef;
  onOpenPicker: () => void;
  onClose: () => void;
  onMove?: () => void;
  isMoveActive?: boolean;
  onOutline?: () => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_stencil_settings_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 70 };
}

export const StencilSettingsBar: React.FC<StencilSettingsBarProps> = ({
  stencilState,
  setStencilState,
  stencilDef,
  onOpenPicker,
  onClose,
  onMove,
  isMoveActive = false,
  onOutline
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
      const newX = Math.max(0, Math.min(window.innerWidth - 300, clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(position));
      } catch {}
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

  const updateState = (updater: (prev: ActiveStencilState) => ActiveStencilState) => {
    setStencilState(prev => prev ? updater(prev) : null);
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-40 bg-slate-900/95 border border-purple-800/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden select-none animate-fade-in"
    >
      {/* Drag Handle & Header */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-move text-slate-300 hover:text-white transition gap-3"
      >
        <div className="flex items-center space-x-1.5">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-sm shrink-0">{stencilDef.icon}</span>
          <span className="text-xs font-bold tracking-wide">Stencil: {stencilDef.name}</span>
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
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Stencil Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Active Stencil Info & Change Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenPicker}
            className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 rounded-lg text-purple-300 text-xs font-medium transition shrink-0"
          >
            Change Stencil
          </button>
        </div>

      {/* Scale & Rotation Sliders */}
      <div className="flex items-center space-x-4 text-xs">
        {/* Scale */}
        <div className="flex items-center space-x-1.5">
          <ZoomIn className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-slate-400 shrink-0">Scale:</span>
          <input
            type="range"
            min="0.3"
            max="3.0"
            step="0.1"
            value={stencilState.scale}
            onChange={(e) => updateState(s => ({ ...s, scale: Number(e.target.value) }))}
            className="w-20 accent-purple-500 cursor-pointer"
          />
          <span className="w-9 font-mono text-[11px] text-purple-300 font-semibold">
            {Math.round(stencilState.scale * 100)}%
          </span>
        </div>

        {/* Rotation */}
        <div className="flex items-center space-x-1.5">
          <RotateCw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-slate-400 shrink-0">Rotate:</span>
          <input
            type="range"
            min="0"
            max="360"
            value={stencilState.rotation}
            onChange={(e) => updateState(s => ({ ...s, rotation: Number(e.target.value) }))}
            className="w-20 accent-purple-500 cursor-pointer"
          />
          <span className="w-8 font-mono text-[11px] text-purple-300 font-semibold">
            {stencilState.rotation}°
          </span>
        </div>

        {/* Invert Toggle */}
        <button
          type="button"
          onClick={() => updateState(s => ({ ...s, isInverted: !s.isInverted }))}
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
            stencilState.isInverted
              ? 'bg-amber-600/30 border-amber-500 text-amber-200 hover:bg-amber-600/50'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={stencilState.isInverted ? "Inverted mode: Paint OUTSIDE stencil shape" : "Normal mode: Paint INSIDE stencil shape"}
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          <span>{stencilState.isInverted ? 'Shield Outer' : 'Cutout Inner'}</span>
        </button>
      </div>

      {/* Move, Outline, Trash & Close */}
      <div className="flex items-center space-x-2">
        {onMove ? (
          <button
            type="button"
            onClick={onMove}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5 ${
              isMoveActive
                ? 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-700/40'
            }`}
            title="Switch focus to Stencil tool to drag & move stencil on canvas"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Move</span>
          </button>
        ) : null}
        {onOutline ? (
          <button
            type="button"
            onClick={onOutline}
            className="px-3 py-1 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-300 hover:text-white"
            title="Stroke an outline of this stencil onto the canvas using current brush color & size"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Outline</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setStencilState(null);
            onClose();
          }}
          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition"
          title="Remove Stencil (Shortcut: Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      </div>
      ) : null}
    </div>
  );
};
