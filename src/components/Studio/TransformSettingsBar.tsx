import React, { useEffect, useState } from 'react';
import { CanvasTransform } from '../../types/coloring';
import { 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Move, 
  Maximize2,
  X,
  Focus,
  GripHorizontal,
  ChevronUp,
  ChevronDown,
  Pipette,
  Layers,
  Palette,
  Sliders,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

interface TransformSettingsBarProps {
  transform: CanvasTransform;
  setTransform: React.Dispatch<React.SetStateAction<CanvasTransform>>;
  onClose?: () => void;
  position?: 'top' | 'bottom';
  activeColor?: string;
  isPickingColor?: boolean;
  setIsPickingColor?: (picking: boolean) => void;
  onDeleteColor?: () => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_transform_settings_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 70 };
}

export const TransformSettingsBar: React.FC<TransformSettingsBarProps> = ({
  transform,
  setTransform,
  onClose,
  activeColor = '#ff0000',
  isPickingColor = false,
  setIsPickingColor,
  onDeleteColor
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

  const updateTransform = (partial: Partial<CanvasTransform>) => {
    setTransform(prev => ({ ...prev, ...partial }));
  };

  const handleRotate90 = () => {
    setTransform(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleCenter = () => {
    updateTransform({ offsetX: 0, offsetY: 0 });
  };

  const handleReset = () => {
    setTransform({
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      offsetX: 0,
      offsetY: 0,
      targetMode: 'all',
      targetColor: activeColor,
      replacementColor: '',
      colorTolerance: 20
    });
  };

  const targetMode = transform.targetMode ?? 'all';
  const targetColor = transform.targetColor ?? activeColor;
  const replacementColor = transform.replacementColor ?? '';
  const colorTolerance = transform.colorTolerance ?? 20;

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
          <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold tracking-wide">Canvas Transform</span>
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
              title="Close Canvas Transform Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 text-xs text-slate-200 flex flex-col gap-2.5">
          {/* Target Mode Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            <button
              type="button"
              onClick={() => updateTransform({ targetMode: 'all' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                targetMode === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transform all elements on the canvas"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Canvas</span>
            </button>

            <button
              type="button"
              onClick={() => updateTransform({ targetMode: 'color', targetColor: targetColor || activeColor })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                targetMode === 'color'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transform or recolor just one target color"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Single Color</span>
            </button>
          </div>

          {/* Single Color Specific Options */}
          {targetMode === 'color' && (
            <div className="flex flex-wrap items-center gap-2.5 p-2 bg-purple-950/30 border border-purple-800/40 rounded-xl">
              {/* Target Color Picker & Eyedropper */}
              <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium">Target:</span>
                <input
                  type="color"
                  value={targetColor}
                  onChange={(e) => updateTransform({ targetColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  title="Choose target color"
                />
                {setIsPickingColor && (
                  <button
                    type="button"
                    onClick={() => setIsPickingColor(!isPickingColor)}
                    className={`p-1 rounded transition ${
                      isPickingColor
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isPickingColor ? 'Click on canvas to pick color' : 'Pick color from canvas'}
                  >
                    <Pipette className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Recolor / Replacement Color */}
              <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={Boolean(replacementColor)}
                    onChange={(e) => updateTransform({ replacementColor: e.target.checked ? activeColor : '' })}
                    className="rounded text-purple-500 focus:ring-0 accent-purple-500 cursor-pointer"
                  />
                  <span>Recolor To:</span>
                </label>
                {replacementColor ? (
                  <input
                    type="color"
                    value={replacementColor}
                    onChange={(e) => updateTransform({ replacementColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Choose new color to replace target color"
                  />
                ) : null}
              </div>

              {/* Color Tolerance Slider */}
              <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-purple-400 mr-0.5" />
                <span className="text-slate-400 font-medium">Tol:</span>
                <button
                  type="button"
                  onClick={() => updateTransform({ colorTolerance: Math.max(0, colorTolerance - 1) })}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 font-bold transition text-xs select-none"
                  title="Decrease Tolerance"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={colorTolerance}
                  onChange={(e) => updateTransform({ colorTolerance: Number(e.target.value) })}
                  className="w-14 accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateTransform({ colorTolerance: Math.min(60, colorTolerance + 1) })}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 font-bold transition text-xs select-none"
                  title="Increase Tolerance"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 font-bold min-w-[20px] ml-0.5">{colorTolerance}</span>
              </div>

              {/* Delete Color Button */}
              {onDeleteColor ? (
                <button
                  type="button"
                  onClick={onDeleteColor}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white border border-red-800/60 rounded-lg font-semibold transition flex items-center space-x-1 shadow-sm"
                  title="Delete all pixels of this target color from canvas"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete Color</span>
                </button>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Scale Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Scale:</span>
              <button
                type="button"
                onClick={() => updateTransform({ scale: Math.max(0.5, Number((transform.scale - 0.05).toFixed(2))) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Decrease Scale"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={transform.scale}
                onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
                className="w-16 accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateTransform({ scale: Math.min(3.0, Number((transform.scale + 0.05).toFixed(2))) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Increase Scale"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-purple-300 font-bold min-w-[38px] ml-0.5">
                {Math.round(transform.scale * 100)}%
              </span>
            </div>

            {/* Rotate Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium flex items-center space-x-1">
                <RotateCw className="w-3 h-3 text-purple-400" />
                <span>Rotate:</span>
              </span>
              <button
                type="button"
                onClick={() => updateTransform({ rotation: (transform.rotation - 5 + 360) % 360 })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Rotate counter-clockwise 5°"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={transform.rotation}
                onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
                className="w-16 accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateTransform({ rotation: (transform.rotation + 5) % 360 })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Rotate clockwise 5°"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-purple-300 font-bold min-w-[32px]">{transform.rotation}°</span>
              <button
                type="button"
                onClick={handleRotate90}
                className="px-2 py-0.5 bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 rounded text-[11px] font-semibold transition ml-0.5"
                title="Rotate 90° clockwise"
              >
                +90°
              </button>
            </div>

            {/* Flip Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => updateTransform({ flipH: !transform.flipH })}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                  transform.flipH
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Flip Horizontally"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip H</span>
              </button>
              <button
                type="button"
                onClick={() => updateTransform({ flipV: !transform.flipV })}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                  transform.flipV
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Flip Vertically"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Flip V</span>
              </button>
            </div>

            {/* Move Position Sliders */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Move className="w-3.5 h-3.5 text-purple-400 mr-0.5" />
              
              {/* X Position */}
              <span className="text-slate-400">X:</span>
              <button
                type="button"
                onClick={() => updateTransform({ offsetX: Math.max(-300, transform.offsetX - 5) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Move Left 5px"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="-300"
                max="300"
                step="5"
                value={transform.offsetX}
                onChange={(e) => updateTransform({ offsetX: Number(e.target.value) })}
                className="w-14 accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateTransform({ offsetX: Math.min(300, transform.offsetX + 5) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Move Right 5px"
              >
                <Plus className="w-3 h-3" />
              </button>

              {/* Y Position */}
              <span className="text-slate-400 ml-1">Y:</span>
              <button
                type="button"
                onClick={() => updateTransform({ offsetY: Math.max(-300, transform.offsetY - 5) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Move Up 5px"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="-300"
                max="300"
                step="5"
                value={transform.offsetY}
                onChange={(e) => updateTransform({ offsetY: Number(e.target.value) })}
                className="w-14 accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateTransform({ offsetY: Math.min(300, transform.offsetY + 5) })}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition select-none"
                title="Move Down 5px"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Center Drawing Position Button */}
            <button
              type="button"
              onClick={handleCenter}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-purple-300 border border-slate-800 rounded-xl font-medium transition flex items-center space-x-1"
              title="Center drawing position (X: 0, Y: 0)"
            >
              <Focus className="w-3.5 h-3.5 text-purple-400" />
              <span>Center</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-purple-300 border border-slate-800 rounded-xl font-medium transition flex items-center space-x-1"
              title="Reset transform settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
