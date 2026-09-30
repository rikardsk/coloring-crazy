import React from 'react';
import {
  PlacedLine,
  PlacedCircle,
  PlacedSquare,
  PlacedSpiral,
  PlacedSpeechBubble,
  PlacedStamp,
  StudioTool
} from '../../types/coloring';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  X,
  Square,
  Circle,
  Minus,
  MessageSquare,
  Compass,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { getStampById } from '../../services/stampService';

export interface LayerItem {
  id: string;
  type: 'line' | 'circle' | 'square' | 'spiral' | 'bubble' | 'stamp';
  label: string;
  color: string;
  isBehindPaint?: boolean;
  opacity?: number;
  isHidden?: boolean;
  isLocked?: boolean;
}

interface LayerManagerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  placedLines: PlacedLine[];
  setPlacedLines: React.Dispatch<React.SetStateAction<PlacedLine[]>>;
  placedCircles: PlacedCircle[];
  setPlacedCircles: React.Dispatch<React.SetStateAction<PlacedCircle[]>>;
  placedSquares: PlacedSquare[];
  setPlacedSquares: React.Dispatch<React.SetStateAction<PlacedSquare[]>>;
  placedSpirals: PlacedSpiral[];
  setPlacedSpirals: React.Dispatch<React.SetStateAction<PlacedSpiral[]>>;
  placedBubbles: PlacedSpeechBubble[];
  setPlacedBubbles: React.Dispatch<React.SetStateAction<PlacedSpeechBubble[]>>;
  placedStamps?: PlacedStamp[];
  setPlacedStamps?: React.Dispatch<React.SetStateAction<PlacedStamp[]>>;
  selectedLineId: string | null;
  setSelectedLineId: (id: string | null) => void;
  selectedCircleId: string | null;
  setSelectedCircleId: (id: string | null) => void;
  selectedSquareId: string | null;
  setSelectedSquareId: (id: string | null) => void;
  selectedSpiralId: string | null;
  setSelectedSpiralId: (id: string | null) => void;
  selectedBubbleId: string | null;
  setSelectedBubbleId: (id: string | null) => void;
  selectedStampId?: string | null;
  setSelectedStampId?: (id: string | null) => void;
  activeTool: StudioTool;
  setActiveTool: (tool: StudioTool) => void;
}

export const LayerManagerPanel: React.FC<LayerManagerPanelProps> = ({
  isOpen,
  onClose,
  placedLines,
  setPlacedLines,
  placedCircles,
  setPlacedCircles,
  placedSquares,
  setPlacedSquares,
  placedSpirals,
  setPlacedSpirals,
  placedBubbles,
  setPlacedBubbles,
  placedStamps = [],
  setPlacedStamps,
  selectedLineId,
  setSelectedLineId,
  selectedCircleId,
  setSelectedCircleId,
  selectedSquareId,
  setSelectedSquareId,
  selectedSpiralId,
  setSelectedSpiralId,
  selectedBubbleId,
  setSelectedBubbleId,
  selectedStampId = null,
  setSelectedStampId,
  setActiveTool
}) => {
  if (!isOpen) return null;

  // Build combined list of all vector shape layer items
  const allLayers: LayerItem[] = [
    ...placedBubbles.map((b, idx) => ({
      id: b.id,
      type: 'bubble' as const,
      label: `Speech Bubble ${idx + 1}`,
      color: b.options.backgroundColor || '#ffffff',
      isBehindPaint: b.isBehindPaint,
      opacity: b.opacity ?? 1,
      isHidden: b.isHidden,
      isLocked: b.isLocked
    })),
    ...placedLines.map((l, idx) => ({
      id: l.id,
      type: 'line' as const,
      label: `Line ${idx + 1}`,
      color: l.color,
      isBehindPaint: l.isBehindPaint,
      opacity: l.opacity ?? 1,
      isHidden: l.isHidden,
      isLocked: l.isLocked
    })),
    ...placedCircles.map((c, idx) => ({
      id: c.id,
      type: 'circle' as const,
      label: `Circle ${idx + 1}`,
      color: c.color,
      isBehindPaint: c.isBehindPaint,
      opacity: c.opacity ?? 1,
      isHidden: c.isHidden,
      isLocked: c.isLocked
    })),
    ...placedSquares.map((sq, idx) => ({
      id: sq.id,
      type: 'square' as const,
      label: `Square ${idx + 1}`,
      color: sq.color,
      isBehindPaint: sq.isBehindPaint,
      opacity: sq.opacity ?? 1,
      isHidden: sq.isHidden,
      isLocked: sq.isLocked
    })),
    ...placedSpirals.map((s, idx) => ({
      id: s.id,
      type: 'spiral' as const,
      label: `Spiral ${idx + 1}`,
      color: s.color,
      isBehindPaint: s.isBehindPaint,
      opacity: s.opacity ?? 1,
      isHidden: s.isHidden,
      isLocked: s.isLocked
    })),
    ...placedStamps.map((st, idx) => {
      const def = getStampById(st.stampId);
      const name = def ? `${def.icon} ${def.name}` : `Stamp ${idx + 1}`;
      return {
        id: st.id,
        type: 'stamp' as const,
        label: name,
        color: st.fillColor || st.color,
        isBehindPaint: st.isBehindPaint,
        opacity: st.opacity ?? 1,
        isHidden: st.isHidden,
        isLocked: st.isLocked
      };
    })
  ];

  const selectLayerItem = (item: LayerItem) => {
    setSelectedLineId(item.type === 'line' ? item.id : null);
    setSelectedCircleId(item.type === 'circle' ? item.id : null);
    setSelectedSquareId(item.type === 'square' ? item.id : null);
    setSelectedSpiralId(item.type === 'spiral' ? item.id : null);
    setSelectedBubbleId(item.type === 'bubble' ? item.id : null);
    if (setSelectedStampId) setSelectedStampId(item.type === 'stamp' ? item.id : null);
    setActiveTool(item.type === 'bubble' ? 'bubble' : item.type === 'stamp' ? 'stamp' : 'select');
  };

  const isItemSelected = (item: LayerItem): boolean => {
    if (item.type === 'line') return selectedLineId === item.id;
    if (item.type === 'circle') return selectedCircleId === item.id;
    if (item.type === 'square') return selectedSquareId === item.id;
    if (item.type === 'spiral') return selectedSpiralId === item.id;
    if (item.type === 'bubble') return selectedBubbleId === item.id;
    if (item.type === 'stamp') return selectedStampId === item.id;
    return false;
  };

  const toggleVisibility = (item: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextHidden = !item.isHidden;
    if (item.type === 'line') setPlacedLines(prev => prev.map(l => l.id === item.id ? { ...l, isHidden: nextHidden } : l));
    if (item.type === 'circle') setPlacedCircles(prev => prev.map(c => c.id === item.id ? { ...c, isHidden: nextHidden } : c));
    if (item.type === 'square') setPlacedSquares(prev => prev.map(sq => sq.id === item.id ? { ...sq, isHidden: nextHidden } : sq));
    if (item.type === 'spiral') setPlacedSpirals(prev => prev.map(s => s.id === item.id ? { ...s, isHidden: nextHidden } : s));
    if (item.type === 'bubble') setPlacedBubbles(prev => prev.map(b => b.id === item.id ? { ...b, isHidden: nextHidden } : b));
    if (item.type === 'stamp' && setPlacedStamps) setPlacedStamps(prev => prev.map(st => st.id === item.id ? { ...st, isHidden: nextHidden } : st));
  };

  const toggleLock = (item: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLocked = !item.isLocked;
    if (item.type === 'line') setPlacedLines(prev => prev.map(l => l.id === item.id ? { ...l, isLocked: nextLocked } : l));
    if (item.type === 'circle') setPlacedCircles(prev => prev.map(c => c.id === item.id ? { ...c, isLocked: nextLocked } : c));
    if (item.type === 'square') setPlacedSquares(prev => prev.map(sq => sq.id === item.id ? { ...sq, isLocked: nextLocked } : sq));
    if (item.type === 'spiral') setPlacedSpirals(prev => prev.map(s => s.id === item.id ? { ...s, isLocked: nextLocked } : s));
    if (item.type === 'bubble') setPlacedBubbles(prev => prev.map(b => b.id === item.id ? { ...b, isLocked: nextLocked } : b));
    if (item.type === 'stamp' && setPlacedStamps) setPlacedStamps(prev => prev.map(st => st.id === item.id ? { ...st, isLocked: nextLocked } : st));
  };

  const toggleLayerDepth = (item: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextBehind = !item.isBehindPaint;
    if (item.type === 'line') setPlacedLines(prev => prev.map(l => l.id === item.id ? { ...l, isBehindPaint: nextBehind } : l));
    if (item.type === 'circle') setPlacedCircles(prev => prev.map(c => c.id === item.id ? { ...c, isBehindPaint: nextBehind } : c));
    if (item.type === 'square') setPlacedSquares(prev => prev.map(sq => sq.id === item.id ? { ...sq, isBehindPaint: nextBehind } : sq));
    if (item.type === 'spiral') setPlacedSpirals(prev => prev.map(s => s.id === item.id ? { ...s, isBehindPaint: nextBehind } : s));
    if (item.type === 'bubble') setPlacedBubbles(prev => prev.map(b => b.id === item.id ? { ...b, isBehindPaint: nextBehind } : b));
    if (item.type === 'stamp' && setPlacedStamps) setPlacedStamps(prev => prev.map(st => st.id === item.id ? { ...st, isBehindPaint: nextBehind } : st));
  };

  const updateOpacity = (item: LayerItem, opacity: number) => {
    if (item.type === 'line') setPlacedLines(prev => prev.map(l => l.id === item.id ? { ...l, opacity } : l));
    if (item.type === 'circle') setPlacedCircles(prev => prev.map(c => c.id === item.id ? { ...c, opacity } : c));
    if (item.type === 'square') setPlacedSquares(prev => prev.map(sq => sq.id === item.id ? { ...sq, opacity } : sq));
    if (item.type === 'spiral') setPlacedSpirals(prev => prev.map(s => s.id === item.id ? { ...s, opacity } : s));
    if (item.type === 'bubble') setPlacedBubbles(prev => prev.map(b => b.id === item.id ? { ...b, opacity } : b));
    if (item.type === 'stamp' && setPlacedStamps) setPlacedStamps(prev => prev.map(st => st.id === item.id ? { ...st, opacity } : st));
  };

  const deleteItem = (item: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'line') {
      setPlacedLines(prev => prev.filter(l => l.id !== item.id));
      if (selectedLineId === item.id) setSelectedLineId(null);
    }
    if (item.type === 'circle') {
      setPlacedCircles(prev => prev.filter(c => c.id !== item.id));
      if (selectedCircleId === item.id) setSelectedCircleId(null);
    }
    if (item.type === 'square') {
      setPlacedSquares(prev => prev.filter(sq => sq.id !== item.id));
      if (selectedSquareId === item.id) setSelectedSquareId(null);
    }
    if (item.type === 'spiral') {
      setPlacedSpirals(prev => prev.filter(s => s.id !== item.id));
      if (selectedSpiralId === item.id) setSelectedSpiralId(null);
    }
    if (item.type === 'bubble') {
      setPlacedBubbles(prev => prev.filter(b => b.id !== item.id));
      if (selectedBubbleId === item.id) setSelectedBubbleId(null);
    }
    if (item.type === 'stamp' && setPlacedStamps) {
      setPlacedStamps(prev => prev.filter(st => st.id !== item.id));
      if (selectedStampId === item.id && setSelectedStampId) setSelectedStampId(null);
    }
  };

  const moveLayerOrder = (item: LayerItem, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const updateArr = <T extends { id: string }>(arr: T[], setArr: React.Dispatch<React.SetStateAction<T[]>>) => {
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx === -1) return;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return;
      const copy = [...arr];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      setArr(copy);
    };

    if (item.type === 'line') updateArr(placedLines, setPlacedLines);
    if (item.type === 'circle') updateArr(placedCircles, setPlacedCircles);
    if (item.type === 'square') updateArr(placedSquares, setPlacedSquares);
    if (item.type === 'spiral') updateArr(placedSpirals, setPlacedSpirals);
    if (item.type === 'bubble') updateArr(placedBubbles, setPlacedBubbles);
    if (item.type === 'stamp' && setPlacedStamps) updateArr(placedStamps, setPlacedStamps);
  };

  const renderIcon = (type: LayerItem['type']) => {
    switch (type) {
      case 'line': return <Minus className="w-4 h-4 text-sky-400" />;
      case 'circle': return <Circle className="w-4 h-4 text-emerald-400" />;
      case 'square': return <Square className="w-4 h-4 text-indigo-400" />;
      case 'spiral': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'bubble': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'stamp': return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed right-4 top-20 bottom-20 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 px-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm tracking-wide text-white">Visual Layer Manager</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
            {allLayers.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          title="Close Layer Manager"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {allLayers.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-medium text-slate-400">No vector shapes added yet</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Draw lines, circles, squares, spirals, or speech bubbles to see them listed here.
            </p>
          </div>
        ) : (
          allLayers.map(item => {
            const selected = isItemSelected(item);
            return (
              <div
                key={item.id}
                onClick={() => selectLayerItem(item)}
                className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selected
                    ? 'bg-purple-950/50 border-purple-500/80 shadow-md shadow-purple-950/40'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                {/* Top Row: Type Icon, Label, Color Indicator & Visibility/Lock buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 shrink-0 overflow-hidden">
                    <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/70">
                      {renderIcon(item.type)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                      {item.label}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0"
                      style={{ backgroundColor: item.color }}
                      title={`Color: ${item.color}`}
                    />
                  </div>

                  {/* Actions (Visibility, Lock, Depth, Delete) */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Layer Depth Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleLayerDepth(item, e)}
                      className={`p-1 rounded-md text-[10px] font-semibold border transition ${
                        item.isBehindPaint
                          ? 'bg-purple-900/60 text-purple-200 border-purple-700'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.isBehindPaint ? 'Behind Paint (Layer 0.5)' : 'In Front of Paint'}
                    >
                      {item.isBehindPaint ? 'Back' : 'Front'}
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleVisibility(item, e)}
                      className={`p-1 rounded-md border transition ${
                        item.isHidden
                          ? 'bg-rose-950/50 text-rose-400 border-rose-800'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.isHidden ? 'Hidden' : 'Visible'}
                    >
                      {item.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleLock(item, e)}
                      className={`p-1 rounded-md border transition ${
                        item.isLocked
                          ? 'bg-amber-950/50 text-amber-400 border-amber-800'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.isLocked ? 'Locked (Protected from canvas moves)' : 'Unlocked'}
                    >
                      {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Reorder Up / Down */}
                    <button
                      type="button"
                      onClick={(e) => moveLayerOrder(item, 'up', e)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => moveLayerOrder(item, 'down', e)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => deleteItem(item, e)}
                      className="p-1 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded transition"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Shape Opacity Slider */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-700/40 text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] w-12 shrink-0">Opacity</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={item.opacity ?? 1}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateOpacity(item, parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                  />
                  <span className="font-mono text-[10px] text-purple-300 w-8 text-right shrink-0">
                    {Math.round((item.opacity ?? 1) * 100)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
