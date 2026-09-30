import React from 'react';
import { Palette, BookOpen, Heart, Image as ImageIcon, PlusCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'library' | 'artworks' | 'favorites';
  setActiveTab: (tab: 'library' | 'artworks' | 'favorites') => void;
  onOpenCreator: () => void;
  onOpenBlankStudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreator,
  onOpenBlankStudio
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('library')}>
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              ColoringCrazy
            </h1>
            <p className="text-xs text-slate-400">Create, Share & Color Line Art</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setActiveTab('artworks')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'artworks'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>My Masterpieces</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onOpenBlankStudio ? (
            <button
              onClick={onOpenBlankStudio}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/25 transition-all transform hover:scale-105 active:scale-95"
              title="Open Studio with a new blank canvas"
            >
              <Palette className="w-5 h-5 text-white" />
              <span>Open Studio</span>
            </button>
          ) : null}

          <button
            onClick={onOpenCreator}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25 transition-all transform hover:scale-105 active:scale-95"
            title="Create line art from photo or prompt"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Create Line Art</span>
          </button>
        </div>
      </div>
    </header>
  );
};

