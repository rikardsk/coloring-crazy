import React, { useEffect, useRef, useState } from 'react';
import { hslToHex, hexToHsl } from '../../services/colorUtils';
import { getColorHistory, pushColorHistory } from '../../services/colorHistory';
import { Disc, X, Check, History, Minus, Plus } from 'lucide-react';

interface ColorWheelModalProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

export const ColorWheelModal: React.FC<ColorWheelModalProps> = ({
  currentColor,
  onSelectColor,
  onClose
}) => {
  const initialHsl = hexToHsl(currentColor);
  const [hue, setHue] = useState(initialHsl.h);
  const [saturation, setSaturation] = useState(initialHsl.s);
  const [lightness, setLightness] = useState(initialHsl.l);
  const [history] = useState<string[]>(() => getColorHistory());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hexColor = hslToHex(hue, saturation, lightness);

  // Draw 360-degree color wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 220;
    canvas.width = size;
    canvas.height = size;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);

    // Draw color wheel pixel by pixel
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = -radius; y < radius; y++) {
      for (let x = -radius; x < radius; x++) {
        const d = Math.sqrt(x * x + y * y);
        if (d <= radius) {
          let angle = (Math.atan2(y, x) * 180) / Math.PI;
          if (angle < 0) angle += 360;
          const sat = (d / radius) * 100;
          const hex = hslToHex(angle, sat, lightness);
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);

          const idx = ((y + radius) * size + (x + radius)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw selection indicator handle ring
    const radAngle = (hue * Math.PI) / 180;
    const handleDist = (saturation / 100) * radius;
    const hx = radius + handleDist * Math.cos(radAngle);
    const hy = radius + handleDist * Math.sin(radAngle);

    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hue, saturation, lightness]);

  // Handle pointer picking on wheel
  const handlePointer = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - canvas.width / 2;
    const y = clientY - rect.top - canvas.height / 2;
    const d = Math.sqrt(x * x + y * y);
    const maxR = canvas.width / 2;

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const newSat = Math.min(100, Math.round((d / maxR) * 100));
    setHue(Math.round(angle));
    setSaturation(newSat);
  };

  const handleSelectHistoryColor = (hex: string) => {
    const hsl = hexToHsl(hex);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  };

  const handleApply = () => {
    pushColorHistory(hexColor);
    onSelectColor(hexColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Disc className="w-5 h-5 text-purple-400 animate-spin-slow" />
            <h3 className="text-lg font-bold text-slate-100">Color Wheel</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex flex-col items-center text-slate-200">
          {/* Wheel Canvas Container */}
          <div
            onMouseDown={(e) => { setIsDragging(true); handlePointer(e); }}
            onMouseMove={(e) => { if (isDragging) handlePointer(e); }}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={(e) => { setIsDragging(true); handlePointer(e); }}
            onTouchMove={(e) => { if (isDragging) handlePointer(e); }}
            onTouchEnd={() => setIsDragging(false)}
            className="relative cursor-crosshair rounded-full shadow-xl p-1 bg-slate-950 border border-slate-800"
          >
            <canvas ref={canvasRef} className="rounded-full block" />
          </div>

          {/* Lightness Slider */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Lightness / Brightness</span>
              <span className="font-mono text-purple-300 font-bold">{lightness}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLightness(Math.max(10, lightness - 5))}
                disabled={lightness <= 10}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                title="Decrease lightness"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="10"
                max="90"
                value={lightness}
                onChange={(e) => setLightness(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setLightness(Math.min(90, lightness + 5))}
                disabled={lightness >= 90}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shrink-0 disabled:opacity-40"
                title="Increase lightness"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Color Preview & Hex Display */}
          <div className="flex items-center space-x-3 w-full bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div
              style={{ backgroundColor: hexColor }}
              className="w-10 h-10 rounded-xl border-2 border-white/80 shadow-md flex-shrink-0"
            />
            <div className="flex-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Selected Hex</span>
              <p className="text-base font-mono font-bold text-purple-300 uppercase">{hexColor}</p>
            </div>
          </div>

          {/* Recent 2 Color History (Only shown if history exists) */}
          {history.length > 0 ? (
            <div className="w-full flex items-center justify-between bg-slate-950 p-2.5 px-3.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>Recent Colors:</span>
              </span>
              <div className="flex items-center space-x-2">
                {history.map((hColor, idx) => (
                  <button
                    key={`${hColor}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHistoryColor(hColor)}
                    style={{ backgroundColor: hColor }}
                    className="w-7 h-7 rounded-xl border border-slate-600 hover:border-purple-400 hover:scale-110 transition-all shadow-sm flex-shrink-0"
                    title={`Use recent color ${hColor}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-semibold shadow-lg transition transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Apply Color</span>
          </button>
        </div>
      </div>
    </div>
  );
};
