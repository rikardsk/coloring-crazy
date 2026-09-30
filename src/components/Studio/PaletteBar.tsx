import React, { useEffect, useState } from 'react';
import { ColorPalette } from '../../types/coloring';
import { getAllPalettes, DEFAULT_PALETTES } from '../../services/db';
import { getColorHistory, pushColorHistory } from '../../services/colorHistory';
import { Sparkles, Disc, Settings, History, Star } from 'lucide-react';
import { ColorWheelModal } from './ColorWheelModal';
import { PaletteSettingsModal } from '../Settings/PaletteSettingsModal';

interface PaletteBarProps {
  activeColor: string;
  setActiveColor: (color: string) => void;
  showFloatingFavorites?: boolean;
  onToggleFloatingFavorites?: () => void;
}

export const PaletteBar: React.FC<PaletteBarProps> = ({
  activeColor,
  setActiveColor,
  showFloatingFavorites = true,
  onToggleFloatingFavorites
}) => {
  const [palettes, setPalettes] = useState<ColorPalette[]>(DEFAULT_PALETTES);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(DEFAULT_PALETTES[0]);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>(() => getColorHistory());

  const loadPalettes = async () => {
    const loaded = await getAllPalettes();
    setPalettes(loaded);
    const current = loaded.find(p => p.id === selectedPalette.id) || loaded[0] || DEFAULT_PALETTES[0];
    setSelectedPalette(current);
  };

  useEffect(() => {
    loadPalettes();
  }, []);

  const handleSelectColor = (newColor: string) => {
    if (activeColor && activeColor.toUpperCase() !== newColor.toUpperCase()) {
      const updated = pushColorHistory(activeColor);
      setColorHistory(updated);
    }
    setActiveColor(newColor);
  };

  const handleWheelSelectColor = (newColor: string) => {
    handleSelectColor(newColor);
    setColorHistory(getColorHistory());
  };

  return (
    <div className="bg-slate-800/90 border-t border-slate-700/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0 overflow-visible">
      {/* Palette Selector & Settings */}
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <select
          value={selectedPalette.id}
          onChange={(e) => {
            const found = palettes.find(p => p.id === e.target.value);
            if (found) setSelectedPalette(found);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {palettes.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-700/60 rounded-lg transition"
          title="Palette Settings & Custom Palettes"
        >
          <Settings className="w-4 h-4" />
        </button>

        {onToggleFloatingFavorites ? (
          <button
            onClick={onToggleFloatingFavorites}
            className={`p-1.5 rounded-lg border transition flex items-center space-x-1 text-xs ${
              showFloatingFavorites
                ? 'bg-amber-600/30 border-amber-500/60 text-amber-200'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={showFloatingFavorites ? "Hide floating favorites bar" : "Show floating favorites bar"}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-medium">Favorites</span>
          </button>
        ) : null}
      </div>

      {/* Swatches Container */}
      <div className="flex items-center space-x-3 overflow-x-auto px-3 py-2">
        {selectedPalette.colors.map((color, idx) => (
          <button
            key={`${color}-${idx}`}
            onClick={() => handleSelectColor(color)}
            style={{ backgroundColor: color }}
            className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 flex-shrink-0 ${
              activeColor.toLowerCase() === color.toLowerCase()
                ? 'border-white ring-2 ring-purple-500 scale-110 shadow-lg'
                : 'border-slate-700'
            }`}
            title={color}
          />
        ))}
      </div>

      {/* Custom Color Wheel & Eyedropper Input */}
      <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
        {colorHistory.length > 0 ? (
          <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-700/50" title="Recent Colors">
            <History className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex items-center space-x-1">
              {colorHistory.map((hColor, idx) => (
                <button
                  key={`bar-${hColor}-${idx}`}
                  onClick={() => handleSelectColor(hColor)}
                  style={{ backgroundColor: hColor }}
                  className="w-5 h-5 rounded-full border border-slate-600 hover:border-white hover:scale-110 transition-all shadow-sm"
                  title={`Use recent color ${hColor}`}
                />
              ))}
            </div>
          </div>
        ) : null}

        <button
          onClick={() => {
            setColorHistory(getColorHistory());
            setIsWheelOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold shadow-md transition transform hover:scale-105"
          title="Open Custom Color Wheel"
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Color Wheel</span>
        </button>

        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            title="Custom Hex Picker"
          />
          <span className="text-xs font-mono text-slate-400 uppercase">{activeColor}</span>
        </div>
      </div>

      {/* Color Wheel Modal */}
      {isWheelOpen ? (
        <ColorWheelModal
          currentColor={activeColor}
          onSelectColor={handleWheelSelectColor}
          onClose={() => {
            setColorHistory(getColorHistory());
            setIsWheelOpen(false);
          }}
        />
      ) : null}

      {/* Palette Settings Modal */}
      {isSettingsOpen ? (
        <PaletteSettingsModal
          palettes={palettes}
          onClose={() => setIsSettingsOpen(false)}
          onPalettesUpdated={loadPalettes}
        />
      ) : null}
    </div>
  );
};
