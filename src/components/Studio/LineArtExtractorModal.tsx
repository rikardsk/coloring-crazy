import React, { useState, useEffect } from 'react';
import { PageAspectRatio, ProcessingSettings, CanvasTransform, LineArtMethod } from '../../types/coloring';
import { processPhotoToLineArt } from '../../services/imageProcessor';
import { 
  X, 
  Sliders, 
  Check, 
  Move, 
  ZoomIn, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Focus,
  Sparkles
} from 'lucide-react';

interface LineArtExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageSrc: string;
  targetRatio?: PageAspectRatio;
  initialTransform?: CanvasTransform;
  onApplyLineArt: (newLineArtDataUrl: string, newTransform: CanvasTransform) => void;
}

export const LineArtExtractorModal: React.FC<LineArtExtractorModalProps> = ({
  isOpen,
  onClose,
  currentImageSrc,
  targetRatio = '1:1',
  initialTransform,
  onApplyLineArt
}) => {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<ProcessingSettings>({
    method: 'sobel',
    contrast: 5,
    thickness: 2,
    invert: false,
    cleanNoise: true,
    scale: initialTransform?.scale ?? 1,
    rotation: initialTransform?.rotation ?? 0,
    flipH: initialTransform?.flipH ?? false,
    flipV: initialTransform?.flipV ?? false,
    offsetX: initialTransform?.offsetX ?? 0,
    offsetY: initialTransform?.offsetY ?? 0
  });

  // Load target image element
  useEffect(() => {
    if (!isOpen || !currentImageSrc) return;
    setErrorMsg(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      updatePreview(img, settings);
    };
    img.onerror = () => {
      // Retry without CORS header
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setLoadedImage(fallbackImg);
        updatePreview(fallbackImg, settings);
      };
      fallbackImg.onerror = () => {
        setErrorMsg('Failed to load colorful image for line extraction.');
      };
      fallbackImg.src = currentImageSrc;
    };
    img.src = currentImageSrc;
  }, [isOpen, currentImageSrc]);

  const updatePreview = (
    img: HTMLImageElement, 
    setts: ProcessingSettings, 
    ratio: PageAspectRatio = targetRatio
  ) => {
    try {
      const dataUrl = processPhotoToLineArt(img, setts, ratio);
      setPreviewDataUrl(dataUrl);
      setErrorMsg(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Line art conversion failed.';
      setErrorMsg(msg);
    }
  };

  const handleSettingsChange = (partial: Partial<ProcessingSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    if (loadedImage) {
      updatePreview(loadedImage, next, targetRatio);
    }
  };

  const handleReset = () => {
    const resetSetts: ProcessingSettings = {
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
    };
    setSettings(resetSetts);
    if (loadedImage) {
      updatePreview(loadedImage, resetSetts, targetRatio);
    }
  };

  const handleApply = () => {
    if (!previewDataUrl) return;
    const finalTransform: CanvasTransform = {
      scale: settings.scale ?? 1,
      rotation: settings.rotation ?? 0,
      flipH: Boolean(settings.flipH),
      flipV: Boolean(settings.flipV),
      offsetX: settings.offsetX ?? 0,
      offsetY: settings.offsetY ?? 0
    };
    onApplyLineArt(previewDataUrl, finalTransform);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-950/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-300 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Extract Line Art from Colorful Image</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close line extractor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Split View (Preview Left, Controls Right) */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-start">
          {/* Left: Real-time Line Art Preview Box */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Line Art Extraction Preview</span>
              <span className="text-purple-400 font-mono">{targetRatio}</span>
            </div>

            <div className="relative bg-white rounded-xl p-2 border border-slate-700 flex items-center justify-center h-72 shadow-inner overflow-hidden">
              {previewDataUrl ? (
                <img src={previewDataUrl} alt="Extracted Line Art Preview" className="max-h-full object-contain" />
              ) : errorMsg ? (
                <div className="text-center p-4 text-xs text-rose-400 space-y-1">
                  <p className="font-semibold">{errorMsg}</p>
                  <p className="text-slate-500">Adjust contrast or line thickness sliders.</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400 animate-pulse">Processing line art...</span>
              )}
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div className="space-y-4">
            {/* 1. Line Extraction Fine-Tuning */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 font-semibold text-purple-400">
                <Sliders className="w-4 h-4" />
                <span>Line Extraction Parameters</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Extraction Algorithm</label>
                <select
                  value={settings.method || 'sobel'}
                  onChange={(e) => handleSettingsChange({ method: e.target.value as LineArtMethod })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="sobel">Sobel Edge (Standard Baseline)</option>
                  <option value="imagemagick-lat">ImageMagick Adaptive (-lat)</option>
                  <option value="imagemagick-dog">ImageMagick Cartoon (DoG Outline)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
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
                <div className="flex justify-between text-slate-400 mb-1">
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

              <div className="flex items-center space-x-4 pt-1 text-slate-300">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cleanNoise}
                    onChange={(e) => handleSettingsChange({ cleanNoise: e.target.checked })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Smooth Noise</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.invert}
                    onChange={(e) => handleSettingsChange({ invert: e.target.checked })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Invert Lines</span>
                </label>
              </div>
            </div>

            {/* 2. Transforms & Adjustments */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-semibold text-purple-400">
                <div className="flex items-center space-x-2">
                  <Move className="w-4 h-4" />
                  <span>Transform & Adjustments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSettingsChange({ offsetX: 0, offsetY: 0 })}
                    className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center space-x-1 transition"
                    title="Center drawing position"
                  >
                    <Focus className="w-3 h-3 text-purple-400" />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center space-x-1 transition"
                    title="Reset all settings"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Scale / Zoom */}
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

              {/* Rotation */}
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

              {/* Flips */}
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
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950/90 px-5 py-3 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!previewDataUrl}
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs shadow flex items-center space-x-2 transition ${
              !previewDataUrl ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Apply Line Art to Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
