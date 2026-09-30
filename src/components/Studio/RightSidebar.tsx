import React from 'react';
import { 
  FilePlus,
  Trash2, 
  RotateCcw, 
  Move, 
  Printer, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal,
  Shapes,
  Keyboard
} from 'lucide-react';

export interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onBlankCanvas?: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
  showFloatingToolbar: boolean;
  onToggleFloatingToolbar?: () => void;
  showShapeSelectPanel?: boolean;
  onToggleShapeSelectPanel?: () => void;
  onOpenShortcuts?: () => void;
  onPrint: () => void;
  onSave: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onToggle,
  onBlankCanvas,
  canUndo,
  onUndo,
  onClear,
  showFloatingToolbar,
  onToggleFloatingToolbar,
  showShapeSelectPanel = true,
  onToggleShapeSelectPanel,
  onOpenShortcuts,
  onPrint,
  onSave,
}) => {
  return (
    <div 
      className={`fixed right-0 top-16 bottom-16 z-30 flex items-center transition-transform duration-300 ease-in-out pointer-events-none ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={onToggle}
        className="pointer-events-auto absolute -left-10 top-1/2 -translate-y-1/2 bg-slate-900/95 hover:bg-slate-800 text-purple-300 hover:text-white border border-r-0 border-slate-700/80 rounded-l-xl p-2.5 shadow-2xl transition-all group flex flex-col items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        title={isOpen ? 'Collapse Actions Sidebar' : 'Open Actions Sidebar'}
        aria-label={isOpen ? 'Collapse Actions Sidebar' : 'Open Actions Sidebar'}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
        )}
        <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-wider uppercase text-purple-300/80 group-hover:text-purple-200">
          Actions
        </span>
      </button>

      <aside className="pointer-events-auto w-64 h-auto max-h-[80vh] bg-slate-900/95 backdrop-blur-md border border-r-0 border-slate-700/80 rounded-l-2xl shadow-2xl p-4 flex flex-col gap-3 overflow-y-auto text-slate-200 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-purple-300">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Studio Actions</h3>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-xs"
            title="Collapse Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {onBlankCanvas ? (
            <button
              onClick={onBlankCanvas}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border border-purple-800/50 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98"
              title="Create a new blank white canvas for freehand painting"
            >
              <FilePlus className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span>Blank Canvas</span>
                <span className="text-[10px] text-purple-300/70 font-normal">Fresh white canvas</span>
              </div>
            </button>
          ) : null}

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
              canUndo 
                ? 'bg-slate-800/90 hover:bg-rose-950/40 text-rose-300 border-slate-700 hover:border-rose-800/60 active:scale-98' 
                : 'bg-slate-950/40 text-slate-600 border-slate-800/50 cursor-not-allowed'
            }`}
            title="Delete last applied color layer (Shortcut: Ctrl+Z)"
          >
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span>Delete Layer</span>
              <span className="text-[10px] text-slate-500 font-normal">Remove recent stroke</span>
            </div>
          </button>

          <button
            onClick={onClear}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98"
            title="Clear all colored layers and start over"
          >
            <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span>Start Over</span>
              <span className="text-[10px] text-rose-400/70 font-normal">Reset canvas paint</span>
            </div>
          </button>

          {onToggleFloatingToolbar ? (
            <button
              onClick={onToggleFloatingToolbar}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-sm active:scale-98 ${
                showFloatingToolbar
                  ? 'bg-purple-600/25 border-purple-500/60 text-purple-200 hover:bg-purple-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={showFloatingToolbar ? "Hide draggable floating toolbar" : "Show draggable floating toolbar"}
            >
              <Move className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span>Float Bar</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {showFloatingToolbar ? 'Floating bar ON' : 'Floating bar OFF'}
                </span>
              </div>
            </button>
          ) : null}

          {onToggleShapeSelectPanel ? (
            <button
              onClick={onToggleShapeSelectPanel}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-sm active:scale-98 ${
                showShapeSelectPanel
                  ? 'bg-purple-600/25 border-purple-500/60 text-purple-200 hover:bg-purple-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={showShapeSelectPanel ? "Hide floating selection panel for shapes & stamps" : "Show floating selection panel for shapes & stamps"}
            >
              <Shapes className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span>Select Panel</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {showShapeSelectPanel ? 'Select panel ON' : 'Select panel OFF'}
                </span>
              </div>
            </button>
          ) : null}

          {onOpenShortcuts ? (
            <button
              onClick={onOpenShortcuts}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98"
              title="Keyboard Shortcuts Cheat Sheet (Shortcut: ?)"
            >
              <Keyboard className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span>Shortcuts</span>
                <span className="text-[10px] text-slate-400 font-normal">Hotkeys cheat sheet (?)</span>
              </div>
            </button>
          ) : null}

          <button
            onClick={onPrint}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98"
            title="Print Coloring Page"
          >
            <Printer className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="flex flex-col text-left">
              <span>Print</span>
              <span className="text-[10px] text-slate-400 font-normal">Print your page</span>
            </div>
          </button>

          <button
            onClick={onSave}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white border border-purple-500 rounded-xl text-xs font-bold shadow-md hover:shadow-purple-600/30 transition-all transform hover:scale-[1.02] active:scale-98"
            title="Save Masterpiece to library & My Masterpieces (Shortcut: Ctrl+S)"
          >
            <Save className="w-4 h-4 text-white shrink-0" />
            <div className="flex flex-col text-left">
              <span>Save Masterpiece</span>
              <span className="text-[10px] text-purple-200 font-normal">Save to library</span>
            </div>
          </button>
        </div>
      </aside>
    </div>
  );
};
