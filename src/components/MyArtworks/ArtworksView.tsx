import React, { useState } from 'react';
import { SavedArtwork } from '../../types/coloring';
import { deleteArtwork } from '../../services/db';
import { Download, Trash2, Image as ImageIcon, Calendar, Sparkles, Palette } from 'lucide-react';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';

interface ArtworksViewProps {
  artworks: SavedArtwork[];
  onRefresh: () => void;
  onContinueColoring: (artwork: SavedArtwork) => void;
}

export const ArtworksView: React.FC<ArtworksViewProps> = ({
  artworks,
  onRefresh,
  onContinueColoring
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<SavedArtwork | null>(null);
  const [deletingArtwork, setDeletingArtwork] = useState<SavedArtwork | null>(null);
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(new Set());

  const handleDeleteClick = (e: React.MouseEvent, art: SavedArtwork) => {
    e.stopPropagation();
    setDeletingArtwork(art);
  };

  const confirmDelete = () => {
    if (!deletingArtwork) return;
    const target = deletingArtwork;
    setOptimisticDeletedIds(prev => new Set([...prev, target.id]));
    if (selectedArtwork?.id === target.id) setSelectedArtwork(null);
    setDeletingArtwork(null);

    deleteArtwork(target.id).then(() => {
      onRefresh();
    });
  };

  const visibleArtworks = artworks.filter(art => !optimisticDeletedIds.has(art.id));

  const handleDownload = (artwork: SavedArtwork) => {
    const a = document.createElement('a');
    a.href = artwork.coloredDataUrl;
    a.download = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}-colored.png`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              <span>My Masterpieces</span>
            </h2>
            <span className="px-3 py-1 bg-purple-900/60 border border-purple-700/50 text-purple-300 text-xs font-bold rounded-full">
              {visibleArtworks.length} {visibleArtworks.length === 1 ? 'Artwork' : 'Artworks'} Saved
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Your completed colored artworks saved locally in IndexedDB.</p>
        </div>
      </div>

      {visibleArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleArtworks.map(art => (
            <div
              key={art.id}
              onClick={() => setSelectedArtwork(art)}
              className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-white p-3 flex items-center justify-center overflow-hidden">
                <img
                  src={art.coloredDataUrl}
                  alt={art.title}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-base truncate">{art.title}</h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(art.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-1.5">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleDeleteClick(e, art)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Delete Artwork"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(art); }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onContinueColoring(art)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold shadow-md transition transform hover:scale-105"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Continue Coloring</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Saved Masterpieces Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Choose a page from the library, color it in the studio, and click "Save Masterpiece"!
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingArtwork !== null}
        title="Delete Saved Masterpiece"
        itemTitle={deletingArtwork?.title}
        itemThumbnail={deletingArtwork?.coloredDataUrl}
        message="Are you sure you want to delete this completed artwork from your saved masterpieces?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingArtwork(null)}
      />
    </div>
  );
};
