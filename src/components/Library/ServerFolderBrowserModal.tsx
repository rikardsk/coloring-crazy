import React, { useState, useEffect } from 'react';
import { ColoringPage } from '../../types/coloring';
import {
  ServerFolderInfo,
  getServerFolders,
  getServerFolderPages,
  importPagesToLibrary
} from '../../services/serverFolderApi';
import {
  Folder,
  ArrowLeft,
  CheckSquare,
  Square,
  Download,
  Sparkles,
  X,
  Search,
  Palette,
  Check,
  Layers
} from 'lucide-react';

interface ServerFolderBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshLibrary: () => void;
  onSelectStudioPage: (page: ColoringPage) => void;
}

export const ServerFolderBrowserModal: React.FC<ServerFolderBrowserModalProps> = ({
  isOpen,
  onClose,
  onRefreshLibrary,
  onSelectStudioPage
}) => {
  const [folders, setFolders] = useState<ServerFolderInfo[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ServerFolderInfo | null>(null);
  const [folderPages, setFolderPages] = useState<ColoringPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadFolders = async () => {
    const data = await getServerFolders();
    setFolders(data);
  };

  const loadFolderPages = async (folder: ServerFolderInfo) => {
    const pages = await getServerFolderPages(folder.path);
    setFolderPages(pages);
    setSelectedPageIds(new Set());
  };

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      setSelectedFolder(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedFolder) {
      loadFolderPages(selectedFolder);
    }
  }, [selectedFolder]);

  if (!isOpen) return null;

  const handleSelectFolder = (folder: ServerFolderInfo) => {
    setSelectedFolder(folder);
    setSearchQuery('');
  };

  const handleToggleSelectPage = (id: string) => {
    setSelectedPageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPageIds.size === filteredPages.length) {
      setSelectedPageIds(new Set());
    } else {
      setSelectedPageIds(new Set(filteredPages.map(p => p.id)));
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImportEntireFolder = async (folder: ServerFolderInfo) => {
    setImporting(true);
    const pages = await getServerFolderPages(folder.path);
    const count = await importPagesToLibrary(pages, folder.name);
    setImporting(false);
    showNotification(`Successfully imported entire "${folder.name}" folder (${count} images) as a category!`);
    onRefreshLibrary();
  };

  const handleImportSelected = async () => {
    if (selectedPageIds.size === 0 || !selectedFolder) return;
    setImporting(true);
    const toImport = folderPages.filter(p => selectedPageIds.has(p.id));
    const count = await importPagesToLibrary(toImport, selectedFolder.name);
    setImporting(false);
    showNotification(`Successfully imported ${count} selected image(s) into category "${selectedFolder.name}"!`);
    setSelectedPageIds(new Set());
    onRefreshLibrary();
  };

  const filteredPages = folderPages.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            {selectedFolder ? (
              <button
                onClick={() => setSelectedFolder(null)}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
                title="Back to folders"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 bg-purple-900/50 border border-purple-700/50 rounded-xl text-purple-400">
                <Folder className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>{selectedFolder ? selectedFolder.name : 'Server Image Folders'}</span>
                {selectedFolder ? (
                  <span className="text-xs bg-purple-900/60 border border-purple-700/50 text-purple-300 px-2.5 py-0.5 rounded-full">
                    {folderPages.length} images
                  </span>
                ) : null}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedFolder
                  ? `Browsing server/custom_pages/${selectedFolder.path}`
                  : 'Browse server folders (dinosaurs, unicorns, custom) & import as categories'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="bg-emerald-950/80 border-b border-emerald-800 px-6 py-2.5 flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedFolder ? (
            /* FOLDER LIST VIEW */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-slate-300">
                  Select a server template folder (e.g. Dinosaurs, Unicorns) to browse its images, or import an entire folder as a category into your library.
                </p>
              </div>

              {/* Folder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    className="group bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/60 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl"
                  >
                    <div
                      onClick={() => handleSelectFolder(folder)}
                      className="cursor-pointer space-y-3"
                    >
                      {/* Cover Thumbnail / Folder Icon */}
                      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700/50">
                        {folder.coverDataUrl ? (
                          <img
                            src={folder.coverDataUrl}
                            alt={folder.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Folder className="w-12 h-12 text-purple-400 opacity-60" />
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 text-purple-300 text-[10px] font-bold rounded-full border border-slate-700">
                          {folder.count} files
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition flex items-center space-x-2">
                          <Folder className="w-5 h-5 text-purple-400" />
                          <span>{folder.name}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          server/custom_pages/{folder.path}
                        </p>
                      </div>
                    </div>

                    {/* Folder Actions */}
                    <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSelectFolder(folder)}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition text-center"
                      >
                        Browse Folder
                      </button>
                      <button
                        onClick={() => handleImportEntireFolder(folder)}
                        disabled={importing || folder.count === 0}
                        className="py-1.5 px-3 bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white disabled:opacity-40 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                        title="Import all images in folder as category"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Import Category</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* FOLDER DETAIL & IMAGE BROWSER VIEW */
            <div className="space-y-6">
              {/* Filter & Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search images in ${selectedFolder.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    {selectedPageIds.size === filteredPages.length && filteredPages.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedPageIds.size === filteredPages.length && filteredPages.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                    </span>
                  </button>

                  <button
                    onClick={handleImportSelected}
                    disabled={importing || selectedPageIds.size === 0}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Import Selected ({selectedPageIds.size})</span>
                  </button>

                  <button
                    onClick={() => handleImportEntireFolder(selectedFolder)}
                    disabled={importing || folderPages.length === 0}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-pink-600/20 border border-pink-500/40 text-pink-300 hover:bg-pink-600 hover:text-white disabled:opacity-40 rounded-xl text-xs font-semibold transition"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Import Folder as Category</span>
                  </button>
                </div>
              </div>

              {/* Image Grid */}
              {filteredPages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredPages.map(page => {
                    const isSelected = selectedPageIds.has(page.id);
                    return (
                      <div
                        key={page.id}
                        onClick={() => handleToggleSelectPage(page.id)}
                        className={`group bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col relative ${
                          isSelected
                            ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-950/20'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Checkbox Overlay */}
                        <div className="absolute top-3 left-3 z-10">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-400 fill-purple-900 bg-slate-900 rounded-md" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 bg-slate-900/80 rounded-md" />
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative aspect-square bg-white p-3 flex items-center justify-center overflow-hidden">
                          <img
                            src={page.lineArtDataUrl}
                            alt={page.title}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm truncate">{page.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                              {page.relativePath}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectStudioPage(page);
                                onClose();
                              }}
                              className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-semibold transition"
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>Color Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-slate-600" />
                  <p>No images found in this folder matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
