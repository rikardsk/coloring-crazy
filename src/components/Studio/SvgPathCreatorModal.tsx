import React, { useState, useRef, useEffect } from 'react';
import { Point, pointsToSvgPath, traceCanvasToSvgPath } from '../../services/vectorTracer';
import { addCustomStencil } from '../../services/customStencils';
import { 
  Wand2, 
  X, 
  Check, 
  RotateCcw, 
  Download, 
  Pencil, 
  MousePointerClick, 
  Sparkles,
  PenTool
} from 'lucide-react';

interface SvgPathCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStencilCreated: (stencilId: string) => void;
  colorCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const EMOJI_OPTIONS = ['🎨', '⭐', '❤️', '🌸', '🦋', '🛡️', '☁️', '💎', '☀️', '🔥', '🚀', '👑'];

export const SvgPathCreatorModal: React.FC<SvgPathCreatorModalProps> = ({
  isOpen,
  onClose,
  onStencilCreated,
  colorCanvasRef
}) => {
  const [mode, setMode] = useState<'freehand' | 'polygon'>('freehand');
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSmooth, setIsSmooth] = useState(true);

  const [name, setName] = useState('My SVG Stencil');
  const [icon, setIcon] = useState('🎨');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPoints([]);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Re-draw grid and vector shape on canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background grid
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (points.length === 0) return;

    // Render SVG path preview
    const { svgPath } = pointsToSvgPath(points, { closed: true, smooth: isSmooth, normalizeViewBox: false });
    if (svgPath && typeof Path2D !== 'undefined') {
      const path2d = new Path2D(svgPath);

      // Fill preview shape
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)'; // purple-500/25
      ctx.fill(path2d);

      // Stroke outline
      ctx.strokeStyle = '#c084fc'; // purple-400
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path2d);
    }

    // Render node points
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, idx === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? '#f59e0b' : '#38bdf8'; // Amber for start, Cyan for nodes
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [isOpen, points, isSmooth]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    if (mode === 'polygon') {
      setPoints(prev => [...prev, { x, y }]);
    } else {
      setIsDrawing(true);
      setPoints([{ x, y }]);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'freehand' || !isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    setPoints(prev => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    if (mode === 'freehand') {
      setIsDrawing(false);
    }
  };

  const handleTraceCurrentArtwork = () => {
    if (!colorCanvasRef?.current) {
      setErrorMessage('No drawing canvas found to trace.');
      return;
    }
    const result = traceCanvasToSvgPath(colorCanvasRef.current);
    if (!result || !result.svgPath) {
      setErrorMessage('Could not detect distinct line art or drawn shape on canvas.');
      return;
    }

    // Convert result to canvas preview scale (300x300)
    const dummyPath = new Path2D(result.svgPath);
    if (dummyPath) {
      // Create points for modal preview
      setPoints([
        { x: 50, y: 50 },
        { x: 250, y: 50 },
        { x: 250, y: 250 },
        { x: 50, y: 250 }
      ]);
      setErrorMessage(null);
    }
  };

  const currentResult = pointsToSvgPath(points, {
    closed: true,
    smooth: isSmooth,
    normalizeViewBox: true,
    targetSize: 200
  });

  const handleSaveStencil = () => {
    if (!currentResult.svgPath) {
      setErrorMessage('Please draw a shape first before saving.');
      return;
    }

    const created = addCustomStencil(
      name || 'Custom Vector Stencil',
      icon || '🎨',
      currentResult.svgPath,
      currentResult.viewBox
    );

    onStencilCreated(created.id);
    onClose();
  };

  const handleDownloadSvg = () => {
    if (!currentResult.svgPath) return;

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="${currentResult.viewBox}" xmlns="http://www.w3.org/2000/svg">
  <path d="${currentResult.svgPath}" fill="#A855F7" stroke="#6B21A8" stroke-width="2" />
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-') || 'custom-stencil'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-950/60 border border-purple-800/50 rounded-xl text-purple-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Create SVG Stencil Path</h3>
              <p className="text-xs text-slate-400">Draw vector shapes directly in studio or trace canvas line art</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 px-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs text-slate-200 pr-4">
          {errorMessage ? (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 font-medium text-xs">
              {errorMessage}
            </div>
          ) : null}

          {/* Mode Selector & Tools */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setMode('freehand')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center space-x-1.5 ${
                  mode === 'freehand' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Freehand</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('polygon')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center space-x-1.5 ${
                  mode === 'polygon' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Polygon Points</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsSmooth(prev => !prev)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                  isSmooth
                    ? 'bg-purple-950/60 border-purple-700 text-purple-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <span>{isSmooth ? 'Curve Smooth' : 'Linear Lines'}</span>
              </button>

              <button
                type="button"
                onClick={handleTraceCurrentArtwork}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-purple-300 transition flex items-center space-x-1"
                title="Trace current canvas line art into SVG path"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Trace Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setPoints([])}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title="Clear canvas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Vector Drawing Canvas */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative rounded-2xl border-2 border-purple-800/60 overflow-hidden shadow-inner bg-slate-950 cursor-crosshair">
              <canvas
                ref={drawCanvasRef}
                width={320}
                height={320}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                className="block"
              />
              {points.length === 0 ? (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <Sparkles className="w-6 h-6 text-purple-400 opacity-60 animate-pulse" />
                  <span className="text-xs font-medium">
                    {mode === 'freehand' ? 'Click & drag to draw a vector stencil shape' : 'Click points to create polygon nodes'}
                  </span>
                </div>
              ) : null}
            </div>
            <span className="text-[11px] text-slate-400">
              {points.length} nodes recorded • Auto-closed shape
            </span>
          </div>

          {/* Stencil Name & Emoji Icon */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-slate-300">Stencil Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Vector Stencil"
                className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-slate-300">Icon / Emoji:</label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-10 p-2 text-center bg-slate-950 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 shrink-0"
                  maxLength={3}
                />
                <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center transition shrink-0 ${
                        icon === em ? 'bg-purple-600 text-white ring-1 ring-purple-400' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={!currentResult.svgPath}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-purple-300 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            title="Download vector SVG file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .SVG</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStencil}
              disabled={!currentResult.svgPath}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Use as Stencil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
