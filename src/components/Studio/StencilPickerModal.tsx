import React, { useState, useRef } from 'react';
import { StencilCategory, StencilDef } from '../../types/coloring';
import { getAllStencils } from '../../services/stencilService';
import { addCustomStencil, deleteCustomStencil, parseSvgContent } from '../../services/customStencils';
import { Shapes, X, Trash2, Check, Plus, Upload, ArrowLeft, PenTool } from 'lucide-react';

interface StencilPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStencilId: string | null;
  onSelectStencil: (stencilId: string) => void;
  onClearStencil: () => void;
  onOpenSvgCreator?: () => void;
}

const CATEGORIES: ('All' | StencilCategory)[] = ['All', 'Shapes', 'Nature', 'Fun', 'Mandalas', 'Custom'];
const EMOJI_OPTIONS = ['🎨', '⭐', '❤️', '🌸', '🦋', '🛡️', '☁️', '💎', '☀️', '🔥', '🚀', '👑'];

export const StencilPickerModal: React.FC<StencilPickerModalProps> = ({
  isOpen,
  onClose,
  selectedStencilId,
  onSelectStencil,
  onClearStencil,
  onOpenSvgCreator
}) => {
  const [activeTab, setActiveTab] = useState<'All' | StencilCategory>('All');
  const [stencilsList, setStencilsList] = useState<StencilDef[]>(() => getAllStencils());
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  // Form state for creating custom stencil
  const [customName, setCustomName] = useState<string>('');
  const [customIcon, setCustomIcon] = useState<string>('🎨');
  const [customSvgPath, setCustomSvgPath] = useState<string>('');
  const [customViewBox, setCustomViewBox] = useState<string>('0 0 200 200');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    setStencilsList(getAllStencils());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    if (!customName && file.name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setCustomName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setErrorMessage('Failed to read file content.');
        return;
      }
      const parsed = parseSvgContent(text);
      if (parsed) {
        setCustomSvgPath(parsed.svgPath);
        if (parsed.viewBox) setCustomViewBox(parsed.viewBox);
      } else {
        setErrorMessage('Could not find valid SVG path data (<path d="...">) in the uploaded file.');
      }
    };
    reader.onerror = () => setErrorMessage('Error reading file.');
    reader.readAsText(file);
  };

  const handleRawPathChange = (val: string) => {
    setCustomSvgPath(val);
    setErrorMessage(null);
    if (val.includes('<svg') || val.includes('<path')) {
      const parsed = parseSvgContent(val);
      if (parsed) {
        setCustomSvgPath(parsed.svgPath);
        if (parsed.viewBox) setCustomViewBox(parsed.viewBox);
      }
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSvgPath.trim()) {
      setErrorMessage('Please upload an SVG file or enter SVG path data.');
      return;
    }

    const newStencil = addCustomStencil(
      customName || 'Custom Stencil',
      customIcon || '🎨',
      customSvgPath,
      customViewBox || '0 0 200 200'
    );

    refreshList();
    setIsAddingCustom(false);
    setActiveTab('Custom');
    onSelectStencil(newStencil.id);
    onClose();

    // Reset form
    setCustomName('');
    setCustomIcon('🎨');
    setCustomSvgPath('');
    setCustomViewBox('0 0 200 200');
    setErrorMessage(null);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomStencil(id);
    refreshList();
    if (selectedStencilId === id) {
      onClearStencil();
    }
  };

  const filteredStencils = activeTab === 'All' 
    ? stencilsList 
    : stencilsList.filter(s => s.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-950/60 border border-purple-800/50 rounded-xl text-purple-400">
              <Shapes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isAddingCustom ? 'Add Custom Stencil' : 'Stencil Mask Library'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAddingCustom 
                  ? 'Upload an SVG file or paste path vector data' 
                  : 'Choose or upload a stencil cutout to place on your canvas'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAddingCustom ? (
          /* Create / Upload Custom Stencil View */
          <form onSubmit={handleSaveCustom} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs text-slate-200 pr-4">
            {errorMessage ? (
              <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 font-medium">
                {errorMessage}
              </div>
            ) : null}

            {/* SVG File Upload Button */}
            <div className="flex flex-col space-y-2">
              <label className="font-semibold text-slate-300">Upload SVG File:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-700/60 bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 font-medium flex items-center justify-center space-x-2 transition"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Choose SVG File (.svg)</span>
              </button>
            </div>

            {/* Raw SVG Path Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-semibold text-slate-300">Or Paste SVG Path / XML Code:</label>
              <textarea
                value={customSvgPath}
                onChange={(e) => handleRawPathChange(e.target.value)}
                placeholder='e.g. M 100 20 L 160 70 L 100 180 Z or <svg><path d="..."/></svg>'
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-[11px] text-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Name & Emoji Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-slate-300">Stencil Name:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Super Star"
                  className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-slate-300">Icon / Emoji:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="w-12 p-2 text-center bg-slate-950 border border-slate-700 rounded-xl text-base focus:outline-none focus:ring-1 focus:ring-purple-500"
                    maxLength={3}
                  />
                  <div className="flex items-center space-x-1 overflow-x-auto py-1 max-w-[170px]">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCustomIcon(em)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition shrink-0 ${
                          customIcon === em ? 'bg-purple-600 ring-1 ring-purple-400' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stencil Shape SVG Preview */}
            {customSvgPath ? (
              <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Stencil Vector Preview</span>
                <svg
                  viewBox={customViewBox || '0 0 200 200'}
                  className="w-24 h-24 text-purple-400 drop-shadow-md"
                >
                  <path d={customSvgPath} fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
            ) : null}

            {/* Form Footer Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustom(false);
                  setErrorMessage(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={!customSvgPath.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Custom Stencil</span>
              </button>
            </div>
          </form>
        ) : (
          /* Stencil Selection Grid & Tabs */
          <>
            {/* Category Tabs & Upload Button */}
            <div className="flex items-center justify-between p-3.5 px-6 bg-slate-950/50 border-b border-slate-800/60 gap-4 min-h-[64px]">
              <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar py-2 pb-3 px-1 pr-3 min-w-0 flex-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      activeTab === cat
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 shrink-0 z-10 py-1">
                {onOpenSvgCreator ? (
                  <button
                    type="button"
                    onClick={onOpenSvgCreator}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shrink-0 flex items-center space-x-1.5 shadow-sm"
                    title="Draw vector SVG paths directly in studio"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Draw Vector</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 hover:text-white transition shrink-0 flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload SVG</span>
                </button>
              </div>
            </div>

            {/* Stencil Grid */}
            <div className="p-5 px-6 overflow-y-auto custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3.5 min-h-[220px] pr-4">
              {filteredStencils.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-slate-500 text-xs text-center space-y-2">
                  <span>No stencils found in this category.</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(true)}
                    className="px-3 py-1.5 bg-purple-950/60 border border-purple-800/50 text-purple-300 rounded-xl font-medium hover:text-white transition"
                  >
                    Upload Custom Stencil
                  </button>
                </div>
              ) : null}

              {filteredStencils.map((st: StencilDef) => {
                const isSelected = selectedStencilId === st.id;
                const isCustom = st.category === 'Custom';
                return (
                  <div key={st.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectStencil(st.id);
                        onClose();
                      }}
                      className={`w-full p-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2 ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 shadow-lg text-purple-200'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{st.icon}</span>
                      <span className="text-xs font-medium text-center truncate w-full">{st.name}</span>
                      {isSelected ? (
                        <span className="flex items-center text-[10px] font-bold text-purple-400 space-x-0.5">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : null}
                    </button>

                    {/* Delete Custom Stencil Button */}
                    {isCustom ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustom(st.id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-xl opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Delete Custom Stencil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClearStencil();
                  onClose();
                }}
                disabled={!selectedStencilId}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  selectedStencilId
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/60'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Active Stencil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
