import React, { useState } from 'react';
import { ColorPalette } from '../../types/coloring';
import { savePalette, deletePalette } from '../../services/db';
import { Settings, Plus, Trash2, Edit3, X, Check } from 'lucide-react';

interface PaletteSettingsModalProps {
  palettes: ColorPalette[];
  onClose: () => void;
  onPalettesUpdated: () => void;
}

export const PaletteSettingsModal: React.FC<PaletteSettingsModalProps> = ({
  palettes,
  onClose,
  onPalettesUpdated
}) => {
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);
  const [paletteName, setPaletteName] = useState('');
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [newColorInput, setNewColorInput] = useState('#a855f7');

  const handleStartCreate = () => {
    setEditingPalette({
      id: `palette-custom-${Date.now()}`,
      name: 'My Custom Palette',
      colors: ['#FF2A6D', '#05D9E8', '#FFC857', '#00FF66', '#7000FF']
    });
    setPaletteName('My Custom Palette');
    setPaletteColors(['#FF2A6D', '#05D9E8', '#FFC857', '#00FF66', '#7000FF']);
  };

  const handleStartEdit = (p: ColorPalette) => {
    setEditingPalette(p);
    setPaletteName(p.name);
    setPaletteColors([...p.colors]);
  };

  const handleAddColor = () => {
    if (!newColorInput || paletteColors.includes(newColorInput)) return;
    setPaletteColors([...paletteColors, newColorInput]);
  };

  const handleRemoveColor = (index: number) => {
    if (paletteColors.length <= 1) return;
    setPaletteColors(paletteColors.filter((_, i) => i !== index));
  };

  const handleSavePalette = async () => {
    if (!editingPalette || !paletteName.trim() || paletteColors.length === 0) return;

    const updated: ColorPalette = {
      ...editingPalette,
      name: paletteName.trim(),
      colors: paletteColors
    };

    await savePalette(updated);
    setEditingPalette(null);
    onPalettesUpdated();
  };

  const handleDeletePalette = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom color palette?')) {
      await deletePalette(id);
      onPalettesUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-100">Palette Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {!editingPalette ? (
            /* List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Manage and create custom color palettes for your studio.</p>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Palette</span>
                </button>
              </div>

              <div className="space-y-3">
                {palettes.map(p => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-200">{p.name}</span>
                        {p.isDefault ? (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
                            Preset
                          </span>
                        ) : null}
                      </div>

                      {/* Swatches */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                        {p.colors.map((c, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: c }}
                            className="w-6 h-6 rounded-full border border-slate-700 flex-shrink-0"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-xl transition"
                        title="Edit Palette"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {!p.isDefault ? (
                        <button
                          onClick={() => handleDeletePalette(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
                          title="Delete Palette"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Edit Form View */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Palette Name</label>
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Swatches Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Palette Colors</label>
                <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 min-h-[64px] items-center">
                  {paletteColors.map((c, idx) => (
                    <div key={idx} className="relative group">
                      <div
                        style={{ backgroundColor: c }}
                        className="w-8 h-8 rounded-full border-2 border-white/80 shadow-md"
                        title={c}
                      />
                      {paletteColors.length > 1 ? (
                        <button
                          onClick={() => handleRemoveColor(idx)}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow hover:bg-rose-500 transition"
                          title="Remove color"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Color Section */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Add New Color</span>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 uppercase"
                  />
                  <button
                    onClick={handleAddColor}
                    className="flex items-center space-x-1 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Color</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end space-x-3">
          {editingPalette ? (
            <>
              <button
                onClick={() => setEditingPalette(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
              >
                Back to List
              </button>
              <button
                onClick={handleSavePalette}
                className="flex items-center space-x-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg transition transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Save Palette</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
