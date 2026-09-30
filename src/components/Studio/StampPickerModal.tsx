import React, { useState } from 'react';
import { BUILTIN_STAMPS } from '../../services/stampService';
import { StampCategory } from '../../types/coloring';
import { Sparkles, X, Search } from 'lucide-react';

interface StampPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStampId?: string;
  activeStampId?: string;
  onSelectStamp: (stampId: string) => void;
}

const CATEGORIES: ('All' | StampCategory)[] = ['All', 'Shapes', 'Nature', 'Magic', 'Fun'];

export const StampPickerModal: React.FC<StampPickerModalProps> = ({
  isOpen,
  onClose,
  selectedStampId,
  activeStampId,
  onSelectStamp
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | StampCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStamps = BUILTIN_STAMPS.filter(stamp => {
    const matchesCategory = activeCategory === 'All' || stamp.category === activeCategory;
    const matchesSearch = stamp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold tracking-wide">Sticker & Stamp Library</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 space-y-3 border-b border-slate-800/60 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search stickers & stamps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Stamps */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredStamps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No stickers or stamps found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {filteredStamps.map(stamp => {
                const isSelected = (selectedStampId || activeStampId) === stamp.id;
                return (
                  <button
                    key={stamp.id}
                    type="button"
                    onClick={() => {
                      onSelectStamp(stamp.id);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/60'
                    }`}
                  >
                    <span className="text-2xl transform group-hover:scale-110 transition">
                      {stamp.icon}
                    </span>
                    <span className="text-[10px] font-medium text-slate-300 group-hover:text-white truncate w-full text-center">
                      {stamp.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
