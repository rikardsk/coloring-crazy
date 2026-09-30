import React, { useState } from 'react';
import { CategoryType, ColoringPage } from '../../types/coloring';
import { updatePageDetails } from '../../services/db';
import { Plus, X, Check, Sparkles, FolderPen } from 'lucide-react';

interface EditTagsModalProps {
  page: ColoringPage;
  onClose: () => void;
  onTagsUpdated: () => void;
}

const PRESET_CATEGORIES: CategoryType[] = [
  'Mandalas',
  'Cute Animals',
  'Castle & Dragons',
  'Fantasy & Space',
  'Nature & Botanical',
  'Custom'
];

const SUGGESTED_TAGS = [
  'mandala', 'animals', 'cute', 'fantasy', 'botanical', 
  'space', 'castle', 'relaxing', 'patterns', 'detailed', 'kids'
];

export const EditTagsModal: React.FC<EditTagsModalProps> = ({
  page,
  onClose,
  onTagsUpdated
}) => {
  const [title, setTitle] = useState(page.title);
  const [tags, setTags] = useState<string[]>([...page.tags]);
  const [category, setCategory] = useState<CategoryType>(page.category);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTagInput);
    }
  };

  const handleSave = async () => {
    const finalCategory = (category === 'Custom' && customCategoryInput.trim()) 
      ? customCategoryInput.trim() 
      : category;
    const finalTitle = title.trim() || page.title;
    await updatePageDetails(page.id, { title: finalTitle, tags, category: finalCategory });
    onTagsUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderPen className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-100">Edit Details & Category</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-slate-200">
          {/* Item Meta Header */}
          <div className="flex items-center space-x-3.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
              <img src={page.lineArtDataUrl} alt={title} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="truncate flex-1">
              <h4 className="text-sm font-bold text-slate-200 truncate">{title}</h4>
              <p className="text-xs text-purple-400 font-medium">{category}</p>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter page title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={PRESET_CATEGORIES.includes(category) ? category : 'Custom'}
              onChange={(e) => {
                const val = e.target.value as CategoryType;
                setCategory(val);
                if (val !== 'Custom') setCustomCategoryInput('');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRESET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(!PRESET_CATEGORIES.includes(category) || category === 'Custom') ? (
              <input
                type="text"
                placeholder="Enter custom category name (e.g. Fantasy & Space)"
                value={customCategoryInput || (!PRESET_CATEGORIES.includes(category) ? category : '')}
                onChange={(e) => {
                  setCustomCategoryInput(e.target.value);
                  setCategory('Custom');
                }}
                className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : null}
          </div>

          {/* Current Tags Chips Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Current Tags</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 min-h-[56px] items-center">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-xl text-xs font-semibold text-purple-300 shadow-sm"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 hover:text-rose-400 transition rounded-full"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No tags added yet.</span>
              )}
            </div>
          </div>

          {/* Add Custom Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Add New Tag</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a tag name and press Enter..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleAddTag(newTagInput)}
                disabled={!newTagInput.trim()}
                className={`px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                  !newTagInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Suggested Tag Pills */}
          <div>
            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Suggested Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map(sTag => (
                <button
                  key={sTag}
                  onClick={() => handleAddTag(sTag)}
                  disabled={tags.includes(sTag)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                    tags.includes(sTag)
                      ? 'bg-slate-800 text-slate-600 cursor-default opacity-50'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  +{sTag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg transition transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Save Tags</span>
          </button>
        </div>
      </div>
    </div>
  );
};
