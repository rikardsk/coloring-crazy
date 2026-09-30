import React, { useEffect, useState } from 'react';
import { GridOptions, DEFAULT_GRID_OPTIONS } from '../../types/coloring';
import { 
  Grid, 
  GripHorizontal, 
  X, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

interface GridSettingsBarProps {
  options: GridOptions;
  setOptions: React.Dispatch<React.SetStateAction<GridOptions>>;
  onClose: () => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_grid_settings_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 140 };
}

const PRESET_GRID_COLORS = [
  '#000000', '#475569', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981'
];

export const GridSettingsBar: React.FC<GridSettingsBarProps> = ({
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

  const updateOptions = (partial: Partial<GridOptions>) => {
    setOptions(prev => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setOptions(DEFAULT_GRID_OPTIONS);
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
          <Grid className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold tracking-wide">Grid Overlay Guide</span>
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
            title="Close Grid Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 text-xs text-slate-200 flex flex-wrap items-center gap-3">
          {/* Grid Type Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => updateOptions({ type: 'none' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                options.type === 'none'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Disable Grid Overlay"
            >
              Off
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ type: 'line' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                options.type === 'line'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Line Grid (Graph Paper)"
            >
              <span>📏</span>
              <span>Line Grid</span>
            </button>
            <button
              type="button"
              onClick={() => updateOptions({ type: 'dot' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                options.type === 'dot'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dot Grid (Bullet Journal)"
            >
              <span>🟢</span>
              <span>Dot Grid</span>
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition font-semibold text-xs cursor-pointer"
            title="Reset grid settings to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Reset</span>
          </button>

          {/* Grid Spacing & Opacity Controls */}
          {options.type !== 'none' ? (
            <div className="flex items-center space-x-3 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              {/* Spacing / Size Slider */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Spacing:</span>
                <button
                  type="button"
                  onClick={() => updateOptions({ size: Math.max(20, options.size - 10) })}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                  title="Decrease Grid Spacing (-10px)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={options.size}
                  onChange={(e) => updateOptions({ size: Number(e.target.value) })}
                  className="w-16 accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateOptions({ size: Math.min(100, options.size + 10) })}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                  title="Increase Grid Spacing (+10px)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 font-semibold w-8">{options.size}px</span>
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                <span className="text-slate-400 font-medium">Opacity:</span>
                <button
                  type="button"
                  onClick={() => updateOptions({ opacity: Math.max(0.1, Number((options.opacity - 0.05).toFixed(2))) })}
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
                  value={options.opacity}
                  onChange={(e) => updateOptions({ opacity: Number(e.target.value) })}
                  className="w-16 accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateOptions({ opacity: Math.min(1.0, Number((options.opacity + 0.05).toFixed(2))) })}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer"
                  title="Increase Opacity (+5%)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 font-semibold w-8">
                  {Math.round(options.opacity * 100)}%
                </span>
              </div>

              {/* Grid Color */}
              <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                <span className="text-slate-400 font-medium">Color:</span>
                <input
                  type="color"
                  value={options.color}
                  onChange={(e) => updateOptions({ color: e.target.value })}
                  className="w-5 h-5 rounded bg-transparent cursor-pointer border-0 p-0"
                  title="Choose Grid Color"
                />
                <div className="flex items-center space-x-1">
                  {PRESET_GRID_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateOptions({ color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-3.5 h-3.5 rounded-full border transition-transform hover:scale-110 ${
                        options.color.toUpperCase() === c ? 'border-purple-400 ring-1 ring-purple-400/50' : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Grid Move / Alignment Shift Controls */}
              <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                <span className="text-slate-400 font-medium">Move X:</span>
                <button
                  type="button"
                  onClick={() => updateOptions({ offsetX: Math.max(0, options.offsetX - 5) })}
                  disabled={options.offsetX <= 0}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
                  title="Shift Left (-5px)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="0"
                  max={options.size}
                  step="1"
                  value={Math.max(0, Math.min(options.size, options.offsetX))}
                  onChange={(e) => updateOptions({ offsetX: Math.max(0, Math.min(options.size, Number(e.target.value))) })}
                  className="w-14 accent-purple-500 cursor-pointer"
                  title="Horizontal Grid Shift"
                />
                <button
                  type="button"
                  onClick={() => updateOptions({ offsetX: Math.min(options.size, options.offsetX + 5) })}
                  disabled={options.offsetX >= options.size}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
                  title="Shift Right (+5px)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 text-xs w-6">{options.offsetX}p</span>
              </div>

              <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
                <span className="text-slate-400 font-medium">Move Y:</span>
                <button
                  type="button"
                  onClick={() => updateOptions({ offsetY: Math.max(0, options.offsetY - 5) })}
                  disabled={options.offsetY <= 0}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
                  title="Shift Up (-5px)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="0"
                  max={options.size}
                  step="1"
                  value={Math.max(0, Math.min(options.size, options.offsetY))}
                  onChange={(e) => updateOptions({ offsetY: Math.max(0, Math.min(options.size, Number(e.target.value))) })}
                  className="w-14 accent-purple-500 cursor-pointer"
                  title="Vertical Grid Shift"
                />
                <button
                  type="button"
                  onClick={() => updateOptions({ offsetY: Math.min(options.size, options.offsetY + 5) })}
                  disabled={options.offsetY >= options.size}
                  className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-md transition text-xs font-bold border border-slate-700 select-none cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
                  title="Shift Down (+5px)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="font-mono text-purple-300 text-xs w-6">{options.offsetY}p</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
