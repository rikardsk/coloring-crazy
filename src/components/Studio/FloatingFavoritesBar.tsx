import React, { useEffect, useState } from 'react';
import { getFavoriteColors, addFavoriteColor, removeFavoriteColor } from '../../services/favoriteColors';
import { pushColorHistory } from '../../services/colorHistory';
import { Star, GripHorizontal, X, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface FloatingFavoritesBarProps {
  isOpen: boolean;
  onClose: () => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
}

const POS_STORAGE_KEY = 'coloring_crazy_floating_favorites_pos';

function getInitialPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 24, y: 350 };
}

export const FloatingFavoritesBar: React.FC<FloatingFavoritesBarProps> = ({
  isOpen,
  onClose,
  activeColor,
  setActiveColor
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(getInitialPosition);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [favorites, setFavorites] = useState<string[]>(() => getFavoriteColors());

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
      const newX = Math.max(8, Math.min(window.innerWidth - 240, clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 100, clientY - dragOffset.y));
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

  if (!isOpen) return null;

  const handleSelectColor = (newColor: string) => {
    if (activeColor && activeColor.toUpperCase() !== newColor.toUpperCase()) {
      pushColorHistory(activeColor);
    }
    setActiveColor(newColor);
  };

  const handlePinColor = () => {
    if (!activeColor) return;
    const updated = addFavoriteColor(activeColor);
    setFavorites(updated);
  };

  const handleRemoveColor = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFavoriteColor(color);
    setFavorites(updated);
  };

  const customFavs = favorites.filter(c => c.toUpperCase() !== '#000000' && c.toUpperCase() !== '#FFFFFF');

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
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold tracking-wide">Favorites</span>
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
            title="Close Floating Favorites"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="p-3 flex items-center space-x-2 overflow-x-auto max-w-sm">
        {/* Black */}
        <button
          type="button"
          onClick={() => handleSelectColor('#000000')}
          className={`w-7 h-7 rounded-full bg-black border-2 transition-all transform hover:scale-110 shrink-0 ${
            activeColor.toUpperCase() === '#000000' ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110' : 'border-slate-700'
          }`}
          title="Always Black (#000000)"
        />

        {/* White */}
        <button
          type="button"
          onClick={() => handleSelectColor('#FFFFFF')}
          className={`w-7 h-7 rounded-full bg-white border-2 transition-all transform hover:scale-110 shrink-0 ${
            activeColor.toUpperCase() === '#FFFFFF' ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110' : 'border-slate-400'
          }`}
          title="Always White (#FFFFFF)"
        />

        {/* Pinned Favorites */}
        {customFavs.map((favColor, idx) => (
          <div key={`fav-float-${favColor}-${idx}`} className="relative group shrink-0">
            <button
              type="button"
              onClick={() => handleSelectColor(favColor)}
              style={{ backgroundColor: favColor }}
              className={`w-7 h-7 rounded-full border-2 transition-all transform hover:scale-110 ${
                activeColor.toUpperCase() === favColor.toUpperCase() ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110' : 'border-slate-700'
              }`}
              title={`Favorite color: ${favColor}`}
            />
            <button
              type="button"
              onClick={(e) => handleRemoveColor(favColor, e)}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white hidden group-hover:flex items-center justify-center text-[9px] shadow font-bold"
              title="Unpin favorite color"
            >
              ×
            </button>
          </div>
        ))}

        {/* Pin Active Color Button */}
        <button
          type="button"
          onClick={handlePinColor}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/80 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-purple-600 transition shrink-0"
          title={`Pin active color (${activeColor}) to Favorites`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      ) : null}
    </div>
  );
};
