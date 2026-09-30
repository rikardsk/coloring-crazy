import React, { useState, useEffect } from 'react';
import { ColoringPage } from '../../types/coloring';
import { Printer, Download, X, Check, FileText, Layout, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
import {
  PaperSize,
  PageOrientation,
  PrintMode,
  exportPrintablePdf,
  renderHighResPrintCanvas,
  downloadBlob
} from '../../services/pdfExportService';

interface PrintStationModalProps {
  page: ColoringPage;
  onClose: () => void;
}

export const PrintStationModal: React.FC<PrintStationModalProps> = ({
  page,
  onClose
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [printMode, setPrintMode] = useState<PrintMode>('lineart');
  const [includeSwatches, setIncludeSwatches] = useState<boolean>(true);
  const [includeFooter, setIncludeFooter] = useState<boolean>(true);
  const [cleanPaper, setCleanPaper] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const generatePreview = async () => {
      try {
        const canvas = await renderHighResPrintCanvas({
          page,
          paperSize,
          orientation,
          printMode,
          includeFooter,
          includePaletteSwatches: includeSwatches,
          cleanPaper
        });
        if (!active) return;
        setPreviewUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to generate preview', err);
      }
    };
    generatePreview();
    return () => {
      active = false;
    };
  }, [page, paperSize, orientation, printMode, includeSwatches, includeFooter, cleanPaper]);

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const { blob, filename } = await exportPrintablePdf({
        page,
        paperSize,
        orientation,
        printMode,
        includeFooter,
        includePaletteSwatches: includeSwatches,
        cleanPaper
      });
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintNow = async () => {
    if (!previewUrl) {
      window.print();
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - ${page.title}</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${previewUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Printable PDF Export & Studio Station</h3>
              <p className="text-xs text-slate-400">High-DPI 300 DPI vector-ready layout</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Controls, Right Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/50">
          {/* Controls */}
          <div className="md:col-span-5 space-y-5">
            {/* Clean Paper Toggle */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl border border-purple-500/30 space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanPaper}
                  onChange={(e) => setCleanPaper(e.target.checked)}
                  className="mt-0.5 rounded border-purple-500/50 bg-slate-800 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Clean Paper (Artwork Only)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No title, no header lines, no footer, and no surrounding box.
                  </p>
                </div>
              </label>
            </div>

            {/* Paper Size */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['A4', 'Letter'] as PaperSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                      paperSize === size
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{size === 'A4' ? 'A4 (210×297 mm)' : 'US Letter (8.5×11 in)'}</span>
                    {paperSize === size && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-400" />
                Orientation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['auto', 'portrait', 'landscape'] as PageOrientation[]).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => setOrientation(orient)}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium capitalize transition text-center ${
                      orientation === orient
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {orient}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Mode */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Print Content Mode
              </label>
              <div className="space-y-2">
                {[
                  { id: 'lineart', label: 'Line Art Only (Classic Coloring)' },
                  { id: 'lineart-shapes', label: 'Line Art + Vector Shapes' },
                  { id: 'full-colored', label: 'Full Colored Artwork' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPrintMode(mode.id as PrintMode)}
                    className={`w-full py-2 px-3 rounded-lg border text-xs font-medium transition text-left flex items-center justify-between ${
                      printMode === mode.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{mode.label}</span>
                    {printMode === mode.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras / Swatches / Branding */}
            {!cleanPaper && (
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Page Accessories
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSwatches}
                      onChange={(e) => setIncludeSwatches(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Include Color Test Swatches</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFooter}
                      onChange={(e) => setIncludeFooter(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Include Footer & Branding</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-950 border border-slate-800/80 rounded-xl p-4 min-h-[360px] relative overflow-hidden">
            {previewUrl ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                <img
                  src={previewUrl}
                  alt="High-Res PDF Preview"
                  className="max-h-[500px] w-auto object-contain rounded shadow-2xl border border-slate-700"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono">Generating high-res preview...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-sm font-semibold shadow-lg transition"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
          <button
            onClick={handlePrintNow}
            className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg transition transform hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
