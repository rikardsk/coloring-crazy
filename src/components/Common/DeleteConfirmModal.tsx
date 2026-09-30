import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemTitle?: string;
  itemThumbnail?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemTitle,
  itemThumbnail,
  message,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
        {/* Top Header Glow Bar */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />

        <div className="p-6 space-y-5">
          {/* Close button & Icon Header */}
          <div className="flex items-start justify-between">
            <div className="p-3 bg-rose-950/60 border border-rose-800/50 rounded-2xl text-rose-400 shadow-lg shadow-rose-950/50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Text Content */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
          </div>

          {/* Optional Image Thumbnail Card */}
          {itemTitle || itemThumbnail ? (
            <div className="flex items-center space-x-3.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {itemThumbnail ? (
                <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
                  <img src={itemThumbnail} alt={itemTitle || 'Item'} className="max-w-full max-h-full object-contain" />
                </div>
              ) : null}
              {itemTitle ? (
                <div className="truncate flex-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Item to delete</p>
                  <p className="text-sm font-bold text-slate-200 truncate">{itemTitle}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Warning badge */}
          <div className="px-3.5 py-2 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>This action is permanent and cannot be undone.</span>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition"
            >
              Keep Item
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
