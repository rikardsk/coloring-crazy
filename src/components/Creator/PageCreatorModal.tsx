import React, { useState } from 'react';
import { CategoryType, ColoringPage, ProcessingSettings, PageAspectRatio, LineArtMethod } from '../../types/coloring';
import { processPhotoToLineArt, getCanvasDimensionsForRatio } from '../../services/imageProcessor';
import { 
  generateProceduralMandala, 
  generateProceduralSpaceArt, 
  generateProceduralBotanicalArt, 
  generateProceduralUnicornArt,
  generateProceduralAnimalArt,
  getFreeAILineArtUrl, 
  convertImageUrlToDataUrlViaImage,
  generateGeminiLineArtSvg 
} from '../../services/lineArtGenerator';
import { saveCustomPage } from '../../services/db';
import { X, Upload, Sparkles, Sliders, Wand2, Image as ImageIcon, Check, AlertCircle, Key, Cpu, Minus, Plus, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Move, ZoomIn, Focus } from 'lucide-react';

interface PageCreatorModalProps {
  onClose: () => void;
  onPageCreated: (page: ColoringPage) => void;
}

export const PageCreatorModal: React.FC<PageCreatorModalProps> = ({
  onClose,
  onPageCreated
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'prompt'>('photo');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Custom');
  const [aspectRatio, setAspectRatio] = useState<PageAspectRatio>('1:1');

  // Photo tab states
  const [selectedPhoto, setSelectedPhoto] = useState<HTMLImageElement | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [settings, setSettings] = useState<ProcessingSettings>({
    method: 'sobel',
    contrast: 5,
    thickness: 2,
    invert: false,
    cleanNoise: true,
    scale: 1,
    rotation: 0,
    flipH: false,
    flipV: false,
    offsetX: 0,
    offsetY: 0
  });

  const [isPanningImage, setIsPanningImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffsets, setInitialOffsets] = useState({ x: 0, y: 0 });

  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPanningImage(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffsets({ x: settings.offsetX ?? 0, y: settings.offsetY ?? 0 });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningImage) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    handleSettingsChange({
      offsetX: Math.round(initialOffsets.x + dx),
      offsetY: Math.round(initialOffsets.y + dy)
    });
  };

  const handleImageMouseUp = () => {
    setIsPanningImage(false);
  };

  const handleResetTransforms = () => {
    handleSettingsChange({
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      offsetX: 0,
      offsetY: 0
    });
  };

  // Prompt tab states
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLineArtUrl, setGeneratedLineArtUrl] = useState<string | null>(null);

  // Helper to process uploaded or dropped image file
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSelectedPhoto(img);
        updatePhotoPreview(img, settings);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle Drag & Drop Events
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const updatePhotoPreview = (img: HTMLImageElement, setts: ProcessingSettings, ratio: PageAspectRatio = aspectRatio) => {
    const dataUrl = processPhotoToLineArt(img, setts, ratio);
    setPhotoPreviewUrl(dataUrl);
  };

  const handleAspectRatioChange = (newRatio: PageAspectRatio) => {
    setAspectRatio(newRatio);
    if (selectedPhoto) {
      updatePhotoPreview(selectedPhoto, settings, newRatio);
    }
  };

  const handleSettingsChange = (newSettings: Partial<ProcessingSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (selectedPhoto) {
      updatePhotoPreview(selectedPhoto, updated, aspectRatio);
    }
  };

  const tryDecodeDataUrl = (dataUrl: string): string => {
    try {
      if (dataUrl.includes('base64,')) {
        const base64Str = dataUrl.split('base64,')[1];
        return decodeURIComponent(escape(atob(base64Str)));
      }
      return decodeURIComponent(dataUrl);
    } catch {
      return dataUrl;
    }
  };

  const [promptStatus, setPromptStatus] = useState<string | null>(null);
  const [apiErrorDetail, setApiErrorDetail] = useState<string | null>(null);
  const [forceOnlineAi, setForceOnlineAi] = useState(false);
  const [aiProvider, setAiProvider] = useState<'free' | 'gemini'>('free');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [showRawSvg, setShowRawSvg] = useState(false);
  const [useDirectVectorSvg, setUseDirectVectorSvg] = useState(true);

  const handleApiKeyChange = (val: string) => {
    setGeminiApiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  // Handle Free AI / Gemini / Procedural Prompt Generation
  const handleGeneratePrompt = async () => {
    const query = promptText.trim().toLowerCase();
    if (!query) return;
    setIsGenerating(true);
    setApiErrorDetail(null);

    // 1. Google Gemini Vector SVG or Image Conversion Mode
    if (aiProvider === 'gemini') {
      if (!geminiApiKey.trim()) {
        setApiErrorDetail('Please enter your Google Gemini API Key below to prompt Gemini.');
        setIsGenerating(false);
        return;
      }

      if (useDirectVectorSvg) {
        try {
          setPromptStatus(`Prompting Gemini (${geminiModel}) for vector SVG line art...`);
          const geminiSvgDataUrl = await generateGeminiLineArtSvg(promptText, geminiApiKey, geminiModel);
          setGeneratedLineArtUrl(geminiSvgDataUrl);
          setPromptStatus(null);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setApiErrorDetail(errorMsg);
          setPromptStatus(null);
        } finally {
          setIsGenerating(false);
        }
        return;
      }
    }

    // 2. Image Generation & Conversion to Line Art Mode
    setPromptStatus('Connecting to AI generator for image conversion...');

    // If direct vector is enabled for free mode, check local vector engines
    if (useDirectVectorSvg && !forceOnlineAi && aiProvider === 'free') {
      if (query.includes('unicorn') || query.includes('pegasus') || query.includes('pony') || query.includes('horse') || query.includes('horn')) {
        setGeneratedLineArtUrl(generateProceduralUnicornArt());
        setPromptStatus(null);
        setIsGenerating(false);
        return;
      }

      if (query.includes('animal') || query.includes('cat') || query.includes('dog') || query.includes('owl') || query.includes('bear') || query.includes('rabbit') || query.includes('fox') || query.includes('cute')) {
        setGeneratedLineArtUrl(generateProceduralAnimalArt());
        setPromptStatus(null);
        setIsGenerating(false);
        return;
      }

      if (query.includes('space') || query.includes('galaxy') || query.includes('star') || query.includes('planet') || query.includes('cosmos') || query.includes('astro')) {
        setGeneratedLineArtUrl(generateProceduralSpaceArt());
        setPromptStatus(null);
        setIsGenerating(false);
        return;
      }

      if (query.includes('flower') || query.includes('botanical') || query.includes('rose') || query.includes('leaf') || query.includes('plant') || query.includes('garden')) {
        setGeneratedLineArtUrl(generateProceduralBotanicalArt());
        setPromptStatus(null);
        setIsGenerating(false);
        return;
      }

      if (query.includes('mandala') || query.includes('pattern') || query.includes('geometric') || query.includes('symmetry')) {
        setGeneratedLineArtUrl(generateProceduralMandala(8, 5));
        setPromptStatus(null);
        setIsGenerating(false);
        return;
      }
    }

    // 3. Online AI Image Generator Endpoint (Returns raw generated image when direct vector SVG is unchecked)
    const aiUrl = getFreeAILineArtUrl(promptText);
    try {
      const timeoutMs = forceOnlineAi ? 15000 : 8000;
      const { dataUrl } = await convertImageUrlToDataUrlViaImage(aiUrl, timeoutMs);
      
      // Return normal generated image directly without Sobel binarization conversion
      setGeneratedLineArtUrl(dataUrl);
      setPromptStatus(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setApiErrorDetail(`AI Conversion Notice: ${errorMsg}. Loaded clean vector fallback.`);

      if (query.includes('space') || query.includes('galaxy') || query.includes('star') || query.includes('planet')) {
        setGeneratedLineArtUrl(generateProceduralSpaceArt());
      } else if (query.includes('flower') || query.includes('botanical') || query.includes('rose') || query.includes('plant')) {
        setGeneratedLineArtUrl(generateProceduralBotanicalArt());
      } else if (query.includes('mandala') || query.includes('pattern') || query.includes('geometric')) {
        setGeneratedLineArtUrl(generateProceduralMandala(8, 5));
      } else if (query.includes('animal') || query.includes('cat') || query.includes('dog') || query.includes('owl')) {
        setGeneratedLineArtUrl(generateProceduralAnimalArt());
      } else {
        setGeneratedLineArtUrl(generateProceduralUnicornArt());
      }
      setPromptStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const [tagsInput, setTagsInput] = useState('');

  // Save Created Page
  const handleSavePage = async () => {
    const lineArt = activeTab === 'photo' ? photoPreviewUrl : generatedLineArtUrl;
    if (!lineArt) return;

    const userTags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const finalTags = Array.from(new Set(['custom', activeTab, ...userTags]));

    const { width, height } = getCanvasDimensionsForRatio(
      aspectRatio, 
      selectedPhoto?.naturalWidth, 
      selectedPhoto?.naturalHeight
    );

    const newPage: ColoringPage = {
      id: `custom-${Date.now()}`,
      title: title.trim() || (activeTab === 'photo' ? 'My Custom Photo Line Art' : promptText.slice(0, 24) || 'AI Line Art'),
      description: activeTab === 'photo' ? 'Converted from uploaded photo.' : `Generated from prompt: ${promptText}`,
      category,
      tags: finalTags,
      lineArtDataUrl: lineArt,
      createdAt: Date.now(),
      isPreset: false,
      difficulty: 'Medium',
      author: 'You',
      aspectRatio,
      width,
      height
    };

    await saveCustomPage(newPage);
    onPageCreated(newPage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-100">Create Line Art Page</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === 'photo'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>From Personal Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === 'prompt'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>From Text Prompt (Free AI)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Title, Category, Page Size & Tags Input */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Page Title</label>
              <input
                type="text"
                placeholder="e.g. My Dog / Flying Dragon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Mandalas">Mandalas</option>
                <option value="Cute Animals">Cute Animals</option>
                <option value="Castle & Dragons">Castle & Dragons</option>
                <option value="Fantasy & Space">Fantasy & Space</option>
                <option value="Nature & Botanical">Nature & Botanical</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span>Page Size</span>
                <span className="text-[10px] text-purple-400 font-normal">Ratio</span>
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => handleAspectRatioChange(e.target.value as PageAspectRatio)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1:1">Square (800×800)</option>
                <option value="4:5">Portrait / A4 (800×1000)</option>
                <option value="5:4">Landscape (1000×800)</option>
                <option value="16:9">Widescreen (1200×675)</option>
                <option value="auto">Auto / Original</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tags</label>
              <input
                type="text"
                placeholder="e.g. cute, pet, dog"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {activeTab === 'photo' ? (
            <div className="space-y-4">
              {/* File Upload & Drag-and-Drop Box */}
              {!selectedPhoto ? (
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-purple-400 bg-purple-950/60 ring-4 ring-purple-500/30 scale-[1.01]'
                      : 'border-slate-700 hover:border-purple-500 bg-slate-950/40 hover:bg-slate-950'
                  }`}
                >
                  <Upload className={`w-8 h-8 mb-2 transition-transform duration-200 ${isDragging ? 'text-purple-300 scale-125' : 'text-purple-400'}`} />
                  <span className="text-sm font-semibold text-slate-300">
                    {isDragging ? 'Drop photo here to upload!' : 'Click to Upload or Drag & Drop a Photo'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Photo Preview Result & Drag Area */}
                  <div
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    onMouseLeave={handleImageMouseUp}
                    className={`relative bg-white rounded-xl p-2 border border-slate-700 flex items-center justify-center h-60 select-none ${
                      isPanningImage ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    {photoPreviewUrl ? (
                      <img src={photoPreviewUrl} alt="Line Art Preview" className="max-h-full object-contain pointer-events-none" />
                    ) : null}

                    {/* Drag instruction overlay badge */}
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-700/80 flex items-center space-x-1 pointer-events-none">
                      <Move className="w-3 h-3 text-purple-400" />
                      <span>Drag to move position</span>
                    </div>

                    <label className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-purple-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow border border-slate-700 cursor-pointer transition flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Two Column Control Panel: Line Extraction & Image Transforms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Line Extraction Controls */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
                        <Sliders className="w-4 h-4" />
                        <span>Line Extraction Controls</span>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Extraction Algorithm</label>
                        <select
                          value={settings.method || 'sobel'}
                          onChange={(e) => handleSettingsChange({ method: e.target.value as LineArtMethod })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="sobel">Sobel Edge (Standard Baseline)</option>
                          <option value="imagemagick-lat">ImageMagick Adaptive (-lat)</option>
                          <option value="imagemagick-dog">ImageMagick Cartoon (DoG Outline)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Contrast Detail</span>
                          <span className="font-mono text-purple-300 font-bold">{settings.contrast}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={settings.contrast}
                          onChange={(e) => handleSettingsChange({ contrast: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Line Thickness</span>
                          <span className="font-mono text-purple-300 font-bold">{settings.thickness}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={settings.thickness}
                          onChange={(e) => handleSettingsChange({ thickness: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={settings.cleanNoise}
                          onChange={(e) => handleSettingsChange({ cleanNoise: e.target.checked })}
                          className="accent-purple-500 rounded"
                        />
                        <span>Smooth Noise Reduction</span>
                      </label>
                    </div>

                    {/* Image Transform Controls */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-purple-400 mb-1">
                        <div className="flex items-center space-x-2">
                          <Move className="w-4 h-4" />
                          <span>Transform & Adjustments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSettingsChange({ offsetX: 0, offsetY: 0 })}
                            className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center space-x-1 transition"
                            title="Center drawing position (X: 0, Y: 0)"
                          >
                            <Focus className="w-3 h-3 text-purple-400" />
                            <span>Center</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleResetTransforms}
                            className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center space-x-1 transition"
                            title="Reset scale, rotation, flips, and position"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      {/* Scale / Zoom Slider */}
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="flex items-center space-x-1">
                            <ZoomIn className="w-3 h-3 text-purple-400" />
                            <span>Scale / Zoom</span>
                          </span>
                          <span className="font-mono text-purple-300 font-bold">
                            {Math.round((settings.scale ?? 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.05"
                          value={settings.scale ?? 1}
                          onChange={(e) => handleSettingsChange({ scale: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* Rotation Slider & +90deg Button */}
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="flex items-center space-x-1">
                            <RotateCw className="w-3 h-3 text-purple-400" />
                            <span>Rotation</span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-purple-300 font-bold">{settings.rotation ?? 0}°</span>
                            <button
                              type="button"
                              onClick={() => handleSettingsChange({ rotation: ((settings.rotation ?? 0) + 90) % 360 })}
                              className="bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] transition"
                              title="Rotate 90° clockwise"
                            >
                              +90°
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={settings.rotation ?? 0}
                          onChange={(e) => handleSettingsChange({ rotation: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* Flip Horizontally & Vertically */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400 font-medium">Flip Image:</span>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSettingsChange({ flipH: !settings.flipH })}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                              settings.flipH
                                ? 'bg-purple-600 text-white border-purple-500 shadow'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                            }`}
                          >
                            <FlipHorizontal className="w-3.5 h-3.5" />
                            <span>Flip H</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSettingsChange({ flipV: !settings.flipV })}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                              settings.flipV
                                ? 'bg-purple-600 text-white border-purple-500 shadow'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                            }`}
                          >
                            <FlipVertical className="w-3.5 h-3.5" />
                            <span>Flip V</span>
                          </button>
                        </div>
                      </div>

                      {/* Move Position Sliders (X & Y) */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                            <span>Move X</span>
                            <span className="font-mono text-purple-300">{settings.offsetX ?? 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-300"
                            max="300"
                            step="5"
                            value={settings.offsetX ?? 0}
                            onChange={(e) => handleSettingsChange({ offsetX: Number(e.target.value) })}
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                            <span>Move Y</span>
                            <span className="font-mono text-purple-300">{settings.offsetY ?? 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-300"
                            max="300"
                            step="5"
                            value={settings.offsetY ?? 0}
                            onChange={(e) => handleSettingsChange({ offsetY: Number(e.target.value) })}
                            className="w-full accent-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Prompt Tab */
            <div className="space-y-4">
              {/* AI Engine Provider Selector */}
              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 px-2 font-medium">AI Model:</span>
                <button
                  onClick={() => setAiProvider('free')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    aiProvider === 'free'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free AI & Vector Engine</span>
                </button>

                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    aiProvider === 'gemini'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-pink-300" />
                  <span>Google Gemini 3.6 (SVG AI)</span>
                </button>
              </div>

              {/* Gemini API Key & Model Selector (if Gemini is selected) */}
              {aiProvider === 'gemini' ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/50 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                    <div className="flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-400" />
                      <span>Google Gemini API Key</span>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline text-[11px]"
                    >
                      Get Free Key at Google AI Studio &rarr;
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    value={geminiApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400 font-medium">Model Endpoint:</span>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-purple-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                      <option value="gemini-flash">gemini-flash</option>
                      <option value="gemini-3.6-pro">gemini-3.6-pro</option>
                    </select>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Describe what you want to draw
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Fantasy & Space planet / Magical owl / Flower mandala"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && promptText.trim() && !isGenerating) {
                        e.preventDefault();
                        handleGeneratePrompt();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !promptText.trim()}
                    className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl text-sm transition flex items-center space-x-2 ${
                      isGenerating || !promptText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-slate-500 font-medium">Try:</span>
                {['Fantasy & Space Galaxy', 'Cosmic Planet', 'Botanical Rose Flower', 'Intricate Mandala Pattern'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setPromptText(sug);
                    }}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-lg text-xs text-slate-300 hover:text-white transition"
                  >
                    +{sug}
                  </button>
                ))}
              </div>

              {/* Checkboxes & Mode Options */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDirectVectorSvg}
                    onChange={(e) => setUseDirectVectorSvg(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Generate Direct Vector SVG Line Art</span>
                </label>

                {aiProvider === 'free' ? (
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceOnlineAi}
                      onChange={(e) => setForceOnlineAi(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <span>Force Online AI Call (Bypass fast local vector engines)</span>
                  </label>
                ) : null}
              </div>

              {/* Line Art Conversion Settings Sliders (if not direct SVG) */}
              {!useDirectVectorSvg && generatedLineArtUrl ? (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Line Art Fine-Tuning Controls</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Extraction Algorithm</label>
                    <select
                      value={settings.method || 'sobel'}
                      onChange={(e) => handleSettingsChange({ method: e.target.value as LineArtMethod })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="sobel">Sobel Edge (Standard Baseline)</option>
                      <option value="imagemagick-lat">ImageMagick Adaptive (-lat)</option>
                      <option value="imagemagick-dog">ImageMagick Cartoon (DoG Outline)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Contrast Detail</span>
                        <span className="font-mono text-purple-300 font-bold">{settings.contrast}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ contrast: Math.max(1, settings.contrast - 1) })}
                          disabled={settings.contrast <= 1}
                          className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                          title="Decrease contrast"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={settings.contrast}
                          onChange={(e) => handleSettingsChange({ contrast: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ contrast: Math.min(10, settings.contrast + 1) })}
                          disabled={settings.contrast >= 10}
                          className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                          title="Increase contrast"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Line Thickness</span>
                        <span className="font-mono text-purple-300 font-bold">{settings.thickness}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ thickness: Math.max(1, settings.thickness - 1) })}
                          disabled={settings.thickness <= 1}
                          className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                          title="Decrease thickness"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={settings.thickness}
                          onChange={(e) => handleSettingsChange({ thickness: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ thickness: Math.min(5, settings.thickness + 1) })}
                          disabled={settings.thickness >= 5}
                          className="w-5 h-5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                          title="Increase thickness"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={settings.cleanNoise}
                      onChange={(e) => handleSettingsChange({ cleanNoise: e.target.checked })}
                      className="accent-purple-500 rounded"
                    />
                    <span>Smooth Noise Reduction</span>
                  </label>
                </div>
              ) : null}

              {/* Status Message */}
              {promptStatus ? (
                <div className="px-3.5 py-2 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs text-purple-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 animate-spin" />
                  <span>{promptStatus}</span>
                </div>
              ) : null}

              {/* API Response & Error Diagnostics Banner */}
              {apiErrorDetail ? (
                <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between font-semibold text-amber-300">
                    <div className="flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Online AI Response / Error Diagnostics</span>
                    </div>
                    <button
                      onClick={() => setApiErrorDetail(null)}
                      className="text-amber-400 hover:text-white text-[11px] font-mono underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <pre className="font-mono bg-slate-950/80 p-2.5 rounded-lg border border-amber-900/40 text-amber-200/90 whitespace-pre-wrap break-all text-[11px] leading-relaxed max-h-36 overflow-y-auto">
                    {apiErrorDetail}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Falling back to high-quality vector line art preview below so you can keep coloring without interruption.
                  </p>
                </div>
              ) : null}

              {/* Preview Result */}
              {generatedLineArtUrl ? (
                <div className="space-y-2">
                  <div className="bg-white rounded-xl p-2 border border-slate-700 flex items-center justify-center h-52 relative">
                    <img
                      src={generatedLineArtUrl}
                      alt="Generated Line Art"
                      className="max-h-full object-contain"
                    />
                  </div>
                  {generatedLineArtUrl.startsWith('data:image/svg+xml') ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowRawSvg(!showRawSvg)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-mono underline"
                      >
                        {showRawSvg ? 'Hide Raw SVG' : 'Inspect SVG Code'}
                      </button>
                    </div>
                  ) : null}
                  {showRawSvg && generatedLineArtUrl.startsWith('data:image/svg+xml') ? (
                    <pre className="font-mono bg-slate-950 p-2.5 rounded-lg border border-purple-900/40 text-purple-200 whitespace-pre-wrap break-all text-[10px] max-h-36 overflow-y-auto">
                      {tryDecodeDataUrl(generatedLineArtUrl)}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePage}
            disabled={activeTab === 'photo' ? !photoPreviewUrl : !generatedLineArtUrl}
            className={`flex items-center space-x-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg transition ${
              (activeTab === 'photo' && !photoPreviewUrl) || (activeTab === 'prompt' && !generatedLineArtUrl)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save & Color Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
