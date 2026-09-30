import React, { useState, useEffect } from 'react';
import { 
  ColoringResource, 
  getAllResources, 
  addCustomResource, 
  deleteCustomResource 
} from '../../services/resources';
import { 
  Globe, 
  ExternalLink, 
  Plus, 
  Trash2, 
  X, 
  Search, 
  Bookmark, 
  Check 
} from 'lucide-react';

interface ColoringResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColoringResourcesModal: React.FC<ColoringResourcesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [resources, setResources] = useState<ColoringResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<ColoringResource['category']>('Custom');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadResources();
    }
  }, [isOpen]);

  const loadResources = () => {
    setResources(getAllResources());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError('Please enter a title for the resource.');
      return;
    }
    if (!newUrl.trim()) {
      setFormError('Please enter a valid website URL.');
      return;
    }

    addCustomResource({
      title: newTitle,
      url: newUrl,
      category: newCategory,
      description: newDescription
    });

    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setShowAddForm(false);
    loadResources();
    showToast('Resource link added!');
  };

  const handleDelete = (id: string, title: string) => {
    deleteCustomResource(id);
    loadResources();
    showToast(`Removed "${title}"`);
  };

  if (!isOpen) return null;

  const categories = ['All', 'Free Line Art', 'Mandalas', 'Public Domain', 'Interactive Tools', 'My Custom Links'];

  const filteredResources = resources.filter(r => {
    const matchesCategory = 
      selectedCategory === 'All' ? true :
      selectedCategory === 'My Custom Links' ? !r.isPreset :
      r.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) || 
      r.url.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-900/50 border border-purple-700/50 rounded-xl">
                <Globe className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Coloring & Line Art Resources
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Curated links to free line art websites, mandala generators & public-domain archives. Add your own favorite links anytime!
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold shadow-md transition transform hover:scale-105 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel' : 'Add Link'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Custom Link Form */}
          {showAddForm ? (
            <form onSubmit={handleAddSubmit} className="bg-slate-950/90 border border-purple-800/60 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>Add Custom Resource Link</span>
                </div>
                <span className="text-[11px] text-slate-500">Saved to your browser</span>
              </div>

              {formError ? (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg">
                  {formError}
                </p>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Title / Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Free Line Art Gallery"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Website URL *</label>
                  <input
                    type="text"
                    placeholder="e.g. https://example.com/lineart"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Free Line Art">Free Line Art</option>
                    <option value="Mandalas">Mandalas</option>
                    <option value="Public Domain">Public Domain</option>
                    <option value="Interactive Tools">Interactive Tools</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Great collection of animal line art and printable vectors"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Save Resource Link
                </button>
              </div>
            </form>
          ) : null}

          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources by title, url or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Grid */}
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6 space-y-3">
              <Globe className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No matching resources found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or category filter, or click "Add Link" above to add your own resource.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(r => (
                <div
                  key={r.id}
                  className="bg-slate-950 border border-slate-800/80 hover:border-purple-600/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all hover:shadow-xl group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-purple-500/40 transition shrink-0">
                          <Globe className="w-4 h-4 text-purple-400" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition truncate">
                          {r.title}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.isPreset
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {r.isPreset ? r.category : 'Custom'}
                        </span>

                        {!r.isPreset ? (
                          <button
                            onClick={() => handleDelete(r.id, r.title)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Custom Resource Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {r.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                      {r.url.replace(/^https?:\/\//i, '')}
                    </span>

                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-xl font-semibold transition group-hover:bg-purple-600 shrink-0"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredResources.length} resource links</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-purple-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-purple-500/40 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-purple-300" />
          <span>{toastMessage}</span>
        </div>
      ) : null}
    </div>
  );
};
