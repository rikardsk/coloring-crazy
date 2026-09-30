import React, { useEffect, useState } from 'react';
import { GradientOptions, TextureStyle, DEFAULT_GRADIENT_OPTIONS } from '../../types/coloring';
import { 
  PaintBucket, 
  GripHorizontal, 
  X, 
  ChevronUp, 
  ChevronDown, 
  RotateCw,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

interface BucketSettingsBarProps {
  options: GradientOptions;
  setOptions: React.Dispatch<React.SetStateAction<GradientOptions>>;
  activeColor?: string;
  onClose: () => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_bucket_settings_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 70 };
}

const PRESET_GRADIENT_COLORS = [
  '#FFFFFF', '#000000', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#FACE15'
];

const TEXTURE_PRESETS: { style: TextureStyle; label: string; icon: string }[] = [
  { style: 'noise', label: 'Grain', icon: '💨' },
  { style: 'halftone', label: 'Dots', icon: '🟤' },
  { style: 'hatch', label: 'Hatch', icon: '📐' },
  { style: 'linen', label: 'Fabric', icon: '🧵' },
  { style: 'glitter', label: 'Glitter', icon: '✨' }
];

export const BucketSettingsBar: React.FC<BucketSettingsBarProps> = ({
  options,
  setOptions,
  onClose
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
      const newX = Math.max(0, Math.min(window.innerWidth - 320, clientX - dragOffset.x));
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

  const updateOptions = (partial: Partial<GradientOptions>) => {
    setOptions(prev => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setOptions(DEFAULT_GRADIENT_OPTIONS);
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
          <PaintBucket className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold tracking-wide">Gradient & Texture Bucket</span>
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
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Bucket Settings Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 text-xs text-slate-200 flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => updateOptions({ mode: 'solid' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.mode === 'solid'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Solid Color Fill"
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ mode: 'linear-gradient' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.mode === 'linear-gradient'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Linear Gradient Fill"
            >
              Linear
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ mode: 'radial-gradient' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.mode === 'radial-gradient'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Radial Gradient Fill"
            >
              Radial
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ mode: 'spiral-gradient' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.mode === 'spiral-gradient'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Spiral Swirl Gradient Fill"
            >
              Spiral
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ mode: 'texture' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.mode === 'texture'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Texture & Shading Fill"
            >
              Texture
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition font-semibold text-xs cursor-pointer"
            title="Reset gradient & texture settings to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Reset</span>
          </button>

          {/* Gradient Secondary Color & Angle Controls */}
          {options.mode === 'linear-gradient' || options.mode === 'radial-gradient' || options.mode === 'spiral-gradient' ? (
            <div className="flex items-center space-x-3 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              {/* Color 2 Indicator & Input */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Color 2:</span>
                <input
                  type="color"
                  value={options.color2}
                  onChange={(e) => updateOptions({ color2: e.target.value })}
                  className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0 p-0"
                  title="Choose Secondary Gradient Color"
                />
                <div className="flex items-center space-x-1">
                  {PRESET_GRADIENT_COLORS.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateOptions({ color2: c })}
                      style={{ backgroundColor: c }}
                      className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
                        options.color2.toUpperCase() === c ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Angle Slider for Linear & Spiral Gradient */}
              {options.mode === 'linear-gradient' || options.mode === 'spiral-gradient' ? (
                <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                  <RotateCw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-400">Angle:</span>
                  <button
                    type="button"
                    onClick={() => updateOptions({ angle: Math.max(0, options.angle - 15) })}
                    className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                    title="Decrease Angle (-15°)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={options.angle}
                    onChange={(e) => updateOptions({ angle: Number(e.target.value) })}
                    className="w-16 accent-purple-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => updateOptions({ angle: Math.min(360, options.angle + 15) })}
                    className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                    title="Increase Angle (+15°)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-purple-300 font-semibold w-8">{options.angle}°</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Texture Style & Intensity Controls */}
          {options.mode === 'texture' ? (
            <div className="flex items-center space-x-3 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1">
                {TEXTURE_PRESETS.map((t) => (
                  <button
                    key={t.style}
                    type="button"
                    onClick={() => updateOptions({ textureStyle: t.style })}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                      options.textureStyle === t.style
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Texture: ${t.label}`}
                  >
                    <span>{t.icon}</span>
                    <span className="ml-1">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                <span className="text-slate-400">Opacity:</span>
                <button
                  type="button"
                  onClick={() => updateOptions({ textureOpacity: Math.max(0.1, Number((options.textureOpacity - 0.05).toFixed(2))) })}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                  title="Decrease Opacity (-5%)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.textureOpacity}
                  onChange={(e) => updateOptions({ textureOpacity: Number(e.target.value) })}
                  className="w-16 accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateOptions({ textureOpacity: Math.min(1.0, Number((options.textureOpacity + 0.05).toFixed(2))) })}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                  title="Increase Opacity (+5%)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 font-semibold w-8">
                  {Math.round(options.textureOpacity * 100)}%
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
