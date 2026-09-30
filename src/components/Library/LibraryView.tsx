import React, { useState, useEffect } from 'react';
import { ColoringPage } from '../../types/coloring';
import { toggleFavorite, deletePage } from '../../services/db';
import { Search, Heart, Palette, Printer, Download, Trash2, Sparkles, Tag, ChevronLeft, ChevronRight, ArrowUpDown, Folder, Globe } from 'lucide-react';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { EditTagsModal } from './EditTagsModal';

export type SortOption = 'last-edited' | 'default' | 'title-asc' | 'title-desc' | 'newest' | 'oldest' | 'likes';

interface LibraryViewProps {
  pages: ColoringPage[];
  onRefresh: () => void;
  onSelectPage: (page: ColoringPage) => void;
  onPrintPage: (page: ColoringPage) => void;
  onOpenCreator: () => void;
  onOpenBlankStudio?: () => void;
  onOpenServerFolders?: () => void;
  onOpenResources?: () => void;
  onlyFavorites?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  pages,
  onRefresh,
  onSelectPage,
  onPrintPage,
  onOpenCreator,
  onOpenBlankStudio,
  onOpenServerFolders,
  onOpenResources,
  onlyFavorites = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingPage, setDeletingPage] = useState<ColoringPage | null>(null);
  const [editingTagsPage, setEditingTagsPage] = useState<ColoringPage | null>(null);
  const [optimisticFavorites, setOptimisticFavorites] = useState<Record<string, boolean>>({});
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(new Set());

  // Sorting & Pagination states
  const [sortBy, setSortBy] = useState<SortOption>('last-edited');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const categories: string[] = Array.from(new Set([
    'All',
    'Mandalas',
    'Cute Animals',
    'Castle & Dragons',
    'Fantasy & Space',
    'Nature & Botanical',
    'Custom',
    ...pages.map(p => p.category)
  ]));

  // Reset to page 1 whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage, sortBy]);

  const isPageFavorite = (page: ColoringPage): boolean => {
    return optimisticFavorites[page.id] !== undefined ? optimisticFavorites[page.id] : Boolean(page.isFavorite);
  };

  const handleFavoriteClick = (e: React.MouseEvent, page: ColoringPage) => {
    e.stopPropagation();
    const newStatus = !isPageFavorite(page);
    setOptimisticFavorites(prev => ({ ...prev, [page.id]: newStatus }));

    toggleFavorite(page.id, page).then(() => {
      onRefresh();
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, page: ColoringPage) => {
    e.stopPropagation();
    setDeletingPage(page);
  };

  const confirmDelete = () => {
    if (!deletingPage) return;
    const target = deletingPage;
    setOptimisticDeletedIds(prev => new Set([...prev, target.id]));
    setDeletingPage(null);

    deletePage(target.id).then(() => {
      onRefresh();
    });
  };

  const handleDownload = (e: React.MouseEvent, page: ColoringPage) => {
    e.stopPropagation();
    const url = page.thumbnailDataUrl || page.lineArtDataUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-coloring-page.png`;
    a.click();
  };

  const filteredPages = pages.filter(page => {
    if (optimisticDeletedIds.has(page.id)) return false;
    if (onlyFavorites && !isPageFavorite(page)) return false;
    if (selectedCategory !== 'All' && page.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = page.title.toLowerCase().includes(q);
      const matchTags = page.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchTags;
    }
    return true;
  });

  const sortedPages = [...filteredPages].sort((a, b) => {
    if (sortBy === 'last-edited') {
      const aTime = a.lastEditedAt || a.createdAt || 0;
      const bTime = b.lastEditedAt || b.createdAt || 0;
      return bTime - aTime;
    }
    if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'title-desc') {
      return b.title.localeCompare(a.title);
    }
    if (sortBy === 'newest') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortBy === 'oldest') {
      return (a.createdAt || 0) - (b.createdAt || 0);
    }
    if (sortBy === 'likes') {
      return (b.likes || 0) - (a.likes || 0);
    }
    // Default: Custom pages first (newest created), then presets
    const aIsPreset = Boolean(a.isPreset);
    const bIsPreset = Boolean(b.isPreset);
    if (aIsPreset !== bIsPreset) {
      return aIsPreset ? 1 : -1;
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const totalPages = Math.ceil(sortedPages.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPages = sortedPages.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      {!onlyFavorites ? (
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-pink-900/30 border border-slate-800 p-8 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-900/60 border border-purple-700/50 rounded-full text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Line Art & Coloring Library</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Color, Create & Print Free Line Art
            </h2>
            <p className="text-sm text-slate-300">
              Explore intricate mandalas, dinosaurs, unicorns, cute animals & fantasy art. Browse server folders to import entire folders as custom categories!
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {onOpenBlankStudio ? (
              <button
                onClick={onOpenBlankStudio}
                className="flex items-center space-x-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 shadow-xl whitespace-nowrap"
                title="Open Studio with a new blank canvas"
              >
                <Palette className="w-4 h-4 text-white" />
                <span>Open Studio Canvas</span>
              </button>
            ) : null}
            {onOpenResources ? (
              <button
                onClick={onOpenResources}
                className="flex items-center space-x-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-purple-300 hover:text-white rounded-2xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 shadow-xl whitespace-nowrap"
              >
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Web Resources</span>
              </button>
            ) : null}
            {onOpenServerFolders ? (
              <button
                onClick={onOpenServerFolders}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 shadow-xl whitespace-nowrap"
              >
                <Folder className="w-4 h-4 text-purple-200" />
                <span>Browse Server Folders</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pages by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Image Count, Sorting & Items Per Page Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            Showing {sortedPages.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, sortedPages.length)} of {sortedPages.length} Coloring Pages
          </span>
          {sortedPages.length !== pages.length ? (
            <span className="text-slate-500">({pages.length} total in library)</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-900 border border-slate-700 text-purple-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="last-edited">Recently Edited (Default)</option>
              <option value="default">Custom First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Popular</option>
            </select>
          </div>

          {/* Density Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Per view:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-purple-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={999}>All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {paginatedPages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedPages.map(page => (
            <div
              key={page.id}
              onClick={() => onSelectPage(page)}
              className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={page.thumbnailDataUrl || page.lineArtDataUrl}
                  alt={page.title}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="px-2.5 py-0.5 bg-slate-900/80 backdrop-blur text-purple-300 text-[10px] font-semibold rounded-full border border-slate-700">
                    {page.category}
                  </span>
                  {page.thumbnailDataUrl ? (
                    <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-700/60 shadow">
                      In Progress
                    </span>
                  ) : null}
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => handleFavoriteClick(e, page)}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur rounded-full text-slate-400 hover:text-rose-400 transition-all duration-200 transform active:scale-125 z-10"
                  title={isPageFavorite(page) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-4 h-4 transition-all duration-200 ${isPageFavorite(page) ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                </button>
              </div>

              {/* Card Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-purple-300 transition truncate">
                    {page.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {page.description}
                  </p>
                  
                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {page.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono">
                        #{tag}
                      </span>
                    ))}
                    {page.tags.length > 3 ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-800/60 text-slate-500 rounded-md font-mono">
                        +{page.tags.length - 3}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onPrintPage(page); }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                      title="Print Line Art"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDownload(e, page)}
                      className="p-1.5 text-slate-400 hover:text-purple-300 rounded-lg transition"
                      title="Download PNG Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTagsPage(page); }}
                      className="p-1.5 text-slate-400 hover:text-purple-300 rounded-lg transition"
                      title="Edit Tags"
                    >
                      <Tag className="w-4 h-4" />
                    </button>

                    {!page.isPreset ? (
                      <button
                        onClick={(e) => handleDeleteClick(e, page)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  <button
                    onClick={() => onSelectPage(page)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Color Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pagination Bar */}
      {totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-medium">
            Page <span className="font-bold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-200">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {filteredPages.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Palette className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Coloring Pages Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or create your own line art page from photos or text prompts.
          </p>
          <button
            onClick={onOpenCreator}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create New Line Art</span>
          </button>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingPage !== null}
        title="Delete Custom Line Art"
        itemTitle={deletingPage?.title}
        itemThumbnail={deletingPage?.lineArtDataUrl}
        message="Are you sure you want to delete this custom line art page from your library?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPage(null)}
      />

      {/* Edit Tags Modal */}
      {editingTagsPage ? (
        <EditTagsModal
          page={editingTagsPage}
          onClose={() => setEditingTagsPage(null)}
          onTagsUpdated={onRefresh}
        />
      ) : null}
    </div>
  );
};
