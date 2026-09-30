import React, { useState } from 'react';
import { Keyboard, X, Search, Brush, PaintBucket, Eraser, Pipette, Move, Square, Circle, Minus, Type, Stamp, ZoomIn, Undo, Save, Printer, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
  category: 'Tools' | 'Shapes' | 'Navigation' | 'Actions';
}

const SHORTCUTS: ShortcutItem[] = [
  // Tools
  { keys: ['B'], description: 'Paint Brush Tool', icon: <Brush className="w-4 h-4 text-purple-400" />, category: 'Tools' },
  { keys: ['F', 'G'], description: 'Paint Bucket Tool (Fill)', icon: <PaintBucket className="w-4 h-4 text-purple-400" />, category: 'Tools' },
  { keys: ['E'], description: 'Eraser Tool', icon: <Eraser className="w-4 h-4 text-purple-400" />, category: 'Tools' },
  { keys: ['I'], description: 'Color Picker (Eyedropper)', icon: <Pipette className="w-4 h-4 text-purple-400" />, category: 'Tools' },
  { keys: ['H'], description: 'Pan / Hand Canvas Drag Tool', icon: <Move className="w-4 h-4 text-purple-400" />, category: 'Tools' },
  { keys: ['['], description: 'Decrease Brush Size', category: 'Tools' },
  { keys: [']'], description: 'Increase Brush Size', category: 'Tools' },

  // Shapes & Clipart
  { keys: ['V'], description: 'Select & Transform Tool', icon: <Move className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['L'], description: 'Line Tool', icon: <Minus className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['C'], description: 'Circle Tool', icon: <Circle className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['Q', 'R'], description: 'Square / Rectangle Tool', icon: <Square className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['T'], description: 'Vector Stamp / Clipart Library', icon: <Stamp className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['W'], description: 'Speech Bubble Tool', icon: <Type className="w-4 h-4 text-purple-400" />, category: 'Shapes' },
  { keys: ['Del', 'Backspace'], description: 'Delete Selected Shape / Stamp / Stencil', category: 'Shapes' },

  // Navigation
  { keys: ['Space + Drag'], description: 'Hold Space to Temporary Pan', icon: <Move className="w-4 h-4 text-purple-400" />, category: 'Navigation' },
  { keys: ['+', 'Ctrl + +'], description: 'Zoom In', icon: <ZoomIn className="w-4 h-4 text-purple-400" />, category: 'Navigation' },
  { keys: ['-', 'Ctrl + -'], description: 'Zoom Out', category: 'Navigation' },
  { keys: ['0', 'Ctrl + 0'], description: 'Reset Zoom & Pan (100%)', category: 'Navigation' },

  // Actions
  { keys: ['Ctrl + Z'], description: 'Undo Last Action', icon: <Undo className="w-4 h-4 text-purple-400" />, category: 'Actions' },
  { keys: ['Ctrl + Y', 'Shift + Z'], description: 'Redo Action', category: 'Actions' },
  { keys: ['Ctrl + S'], description: 'Save Artwork', icon: <Save className="w-4 h-4 text-purple-400" />, category: 'Actions' },
  { keys: ['Ctrl + P'], description: 'Open Print Station Modal', icon: <Printer className="w-4 h-4 text-purple-400" />, category: 'Actions' },
  { keys: ['?'], description: 'Open Keyboard Shortcuts Cheat Sheet', icon: <HelpCircle className="w-4 h-4 text-purple-400" />, category: 'Actions' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Tools', 'Shapes', 'Navigation', 'Actions'];

  const filteredShortcuts = SHORTCUTS.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesQuery = filterQuery === '' ||
      s.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.keys.some(k => k.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Keyboard Shortcuts Cheat Sheet</h3>
              <p className="text-xs text-slate-400">Master studio workflows with hotkeys</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/20">
          {filteredShortcuts.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center space-x-2.5">
                {item.icon && <div className="p-1.5 bg-slate-800/60 rounded-md">{item.icon}</div>}
                <span className="text-xs font-medium text-slate-200">{item.description}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-2">
                {item.keys.map((k, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 text-[11px] font-mono font-semibold text-purple-300 rounded shadow-sm">
                      {k}
                    </kbd>
                    {kIdx < item.keys.length - 1 && <span className="text-[10px] text-slate-500">or</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-purple-300 font-mono">?</kbd> anytime to toggle this modal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
