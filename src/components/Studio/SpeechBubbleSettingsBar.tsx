import React, { useEffect, useState } from 'react';
import { SpeechBubbleOptions, BubbleShape } from '../../types/coloring';
import { MessageSquare, MessageCircle, Zap, Square, StickyNote, Tag, ArrowRight, X, Trash2, GripHorizontal, MousePointer, ChevronUp, ChevronDown } from 'lucide-react';

interface SpeechBubbleSettingsBarProps {
  options: SpeechBubbleOptions;
  setOptions: React.Dispatch<React.SetStateAction<SpeechBubbleOptions>>;
  activeColor: string;
  onClose?: () => void;
  selectedBubbleId?: string | null;
  onDeleteSelected?: () => void;
  onMoveSelected?: () => void;
  isMoveActive?: boolean;
  onResetTail?: () => void;
}

const PRESET_MESSAGES = ['Hello!', 'Yay!', 'BOOM!', 'Note:', 'Important!', 'Coloring Time!'];
const POS_STORAGE_KEY = 'coloring_crazy_speech_bubble_bar_v2_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        const safeY = (parsed.y > window.innerHeight - 150 || parsed.y < 10) ? 70 : parsed.y;
        const safeX = Math.max(8, Math.min(window.innerWidth - 100, parsed.x));
        return { x: safeX, y: safeY };
      }
    }
  } catch {}
  return { x: Math.max(16, (window.innerWidth - 720) / 2), y: 70 };
}

export const SpeechBubbleSettingsBar: React.FC<SpeechBubbleSettingsBarProps> = ({
  options,
  setOptions,
  activeColor,
  onClose,
  selectedBubbleId,
  onDeleteSelected,
  onMoveSelected,
  isMoveActive = false,
  onResetTail
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
      const newX = Math.max(8, Math.min(window.innerWidth - 100, clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 60, clientY - dragOffset.y));
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

  const updateOption = <K extends keyof SpeechBubbleOptions>(key: K, value: SpeechBubbleOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const shapes: { type: BubbleShape; label: string; icon: React.ReactNode }[] = [
    { type: 'speech', label: 'Speech', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { type: 'thought', label: 'Thought', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { type: 'shout', label: 'Shout', icon: <Zap className="w-3.5 h-3.5" /> },
    { type: 'box', label: 'Box', icon: <Square className="w-3.5 h-3.5" /> },
    { type: 'sticky', label: 'Sticky', icon: <StickyNote className="w-3.5 h-3.5" /> },
    { type: 'label', label: 'Label', icon: <Tag className="w-3.5 h-3.5" /> },
    { type: 'pointer', label: 'Pointer', icon: <ArrowRight className="w-3.5 h-3.5" /> }
  ];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 bg-slate-900/95 border border-purple-800/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden select-none animate-fade-in min-w-[680px] max-w-5xl"
    >
      {/* Drag Handle & Header */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-move text-slate-300 hover:text-white transition gap-3"
      >
        <div className="flex items-center space-x-1.5">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold tracking-wide">Text & Callouts</span>
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
              title="Close Text & Callouts Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 space-y-2.5 text-xs text-slate-200">
        {/* Row 1: Text Input, Shape Selector, Font Size & Select Button */}
        <div className="flex items-center gap-3">
          {/* Text Input */}
          <div className="flex-1 min-w-[180px] flex items-center space-x-2">
            <span className="font-semibold text-purple-300 whitespace-nowrap">Text:</span>
            <input
              type="text"
              value={options.text}
              onChange={(e) => updateOption('text', e.target.value)}
              placeholder="Type speech bubble text..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

        {/* Shape Selector */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
          {shapes.map(s => (
            <button
              key={s.type}
              type="button"
              onClick={() => updateOption('shape', s.type)}
              title={`${s.label} Bubble`}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition ${
                options.shape === s.type
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Font Size */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
          <span className="text-[10px] text-slate-400 px-1 font-bold">Size:</span>
          {[14, 18, 24, 32].map(size => (
            <button
              key={size}
              type="button"
              onClick={() => updateOption('fontSize', size)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                options.fontSize === size
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Select & Move Button */}
        {onMoveSelected ? (
          <button
            type="button"
            onClick={onMoveSelected}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition shrink-0 ${
              isMoveActive
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700'
            }`}
            title="Select & Move Callouts (Shortcut: V or S)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
        ) : null}
      </div>

      {/* Row 2: Fill Swatches, Presets & Delete Selected Action */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Fill Background Quick Swatches */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[10px] text-slate-400 font-bold">Fill:</span>
          {[
            { color: '#ffffff', label: 'White' },
            { color: '#fef9c3', label: 'Yellow' },
            { color: '#fce7f3', label: 'Pink' },
            { color: '#e0f2fe', label: 'Blue' },
            { color: activeColor, label: 'Active Color' },
            { color: 'transparent', label: 'Transparent' }
          ].map(swatch => (
            <button
              key={swatch.color}
              type="button"
              onClick={() => updateOption('backgroundColor', swatch.color)}
              title={`Background: ${swatch.label}`}
              className={`w-5 h-5 rounded-full border border-slate-600 transition transform hover:scale-110 ${
                options.backgroundColor === swatch.color ? 'ring-2 ring-purple-400 scale-110' : ''
              }`}
              style={{ backgroundColor: swatch.color === 'transparent' ? 'transparent' : swatch.color }}
            >
              {swatch.color === 'transparent' ? <span className="text-[9px] text-slate-400">∅</span> : null}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-[10px] font-semibold text-purple-400 whitespace-nowrap">Presets:</span>
          {PRESET_MESSAGES.map(msg => (
            <button
              key={msg}
              type="button"
              onClick={() => updateOption('text', msg)}
              className="px-2.5 py-0.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 rounded-lg text-[11px] font-medium text-purple-200 whitespace-nowrap transition"
            >
              {msg}
            </button>
          ))}
        </div>

        {/* Delete Selected Bubble Button & Reset Tail */}
        <div className="flex items-center space-x-1.5 shrink-0 ml-auto">
          {selectedBubbleId && onResetTail ? (
            <button
              type="button"
              onClick={onResetTail}
              className="p-1 px-2 text-purple-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition text-xs"
              title="Reset Tail target position to default"
            >
              <span className="font-semibold text-[10px]">Reset Tail</span>
            </button>
          ) : null}

          {selectedBubbleId && onDeleteSelected ? (
            <button
              type="button"
              onClick={onDeleteSelected}
              className="p-1 px-2.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition flex items-center space-x-1 text-xs"
              title="Delete Selected Speech Bubble (Shortcut: Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="font-semibold text-[10px]">Delete Bubble</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
    ) : null}
  </div>
);
};
