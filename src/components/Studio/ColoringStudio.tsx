import React, { useRef, useState, useEffect } from 'react';
import { ColoringPage, SavedArtwork, StudioTool, SpeechBubbleOptions, PlacedSpeechBubble, PlacedLine, PlacedSpiral, PlacedCircle, PlacedSquare, PlacedStamp, PageAspectRatio, CanvasTransform, BrushStyle, ActiveStencilState, GradientOptions, DEFAULT_GRADIENT_OPTIONS, GridOptions, DEFAULT_GRID_OPTIONS } from '../../types/coloring';
import { Toolbar } from './Toolbar';
import { PaletteBar } from './PaletteBar';
import { CanvasContainer } from './CanvasContainer';
import { FloatingToolbar } from './FloatingToolbar';
import { FloatingFavoritesBar } from './FloatingFavoritesBar';
import { SpeechBubbleSettingsBar } from './SpeechBubbleSettingsBar';
import { TransformSettingsBar } from './TransformSettingsBar';
import { StencilPickerModal } from './StencilPickerModal';
import { StencilSettingsBar } from './StencilSettingsBar';
import { SvgPathCreatorModal } from './SvgPathCreatorModal';
import { BucketSettingsBar } from './BucketSettingsBar';
import { GridSettingsBar } from './GridSettingsBar';
import { LineArtExtractorModal } from './LineArtExtractorModal';
import { LayerManagerPanel } from './LayerManagerPanel';
import { StampPickerModal } from './StampPickerModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { renderBrushStroke, drawArchimedeanSpiral, drawCircleShape, drawSquareShape } from '../../services/brushEngine';
import { drawStampShape, getStampById } from '../../services/stampService';
import { RightSidebar } from './RightSidebar';
import { svgToDataUrl } from '../../services/presets';
import { drawSpeechBubble } from '../../services/speechBubble';
import { getStencilById, getInitialStencilState } from '../../services/stencilService';
import { saveArtwork, savePageProgress, saveCustomPage, updatePageDetails, deleteArtwork, isArtworkDeleted, DEFAULT_PALETTES } from '../../services/db';
import { deleteSingleColor } from '../../services/colorTransformService';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface ColoringStudioProps {
  page: ColoringPage;
  onBack: (updatedPage?: ColoringPage) => void;
  onPrintPage: (page: ColoringPage) => void;
}

export const ColoringStudio: React.FC<ColoringStudioProps> = ({
  page,
  onBack,
  onPrintPage
}) => {
  const [isLayerManagerOpen, setIsLayerManagerOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<StudioTool>('brush');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('solid');
  const [activeStencil, setActiveStencil] = useState<ActiveStencilState | null>(null);
  const [showStencilControls, setShowStencilControls] = useState<boolean>(true);
  const [showStencilPickerModal, setShowStencilPickerModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showSvgCreatorModal, setShowSvgCreatorModal] = useState<boolean>(false);
  const [showFloatingFavorites, setShowFloatingFavorites] = useState<boolean>(true);
  const [activeColor, setActiveColor] = useState<string>(DEFAULT_PALETTES[0].colors[0]);
  const [aspectRatio, setAspectRatio] = useState<PageAspectRatio>(page.aspectRatio || '1:1');

  const [gradientOptions, setGradientOptions] = useState<GradientOptions>(DEFAULT_GRADIENT_OPTIONS);
  const [gridOptions, setGridOptions] = useState<GridOptions>(DEFAULT_GRID_OPTIONS);
  const [showGridSettings, setShowGridSettings] = useState<boolean>(false);
  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);

  useEffect(() => {
    if (activeTool === 'stencil' && activeStencil) {
      setShowStencilControls(true);
    }
  }, [activeTool, activeStencil]);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [tolerance, setTolerance] = useState<number>(32);
  const [bubbleOptions, setBubbleOptions] = useState<SpeechBubbleOptions>({
    text: 'Hello!',
    shape: 'speech',
    fontSize: 18,
    textColor: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2
  });
  const [placedBubbles, setPlacedBubbles] = useState<PlacedSpeechBubble[]>(page.placedBubbles || []);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  const [placedLines, setPlacedLines] = useState<PlacedLine[]>(page.placedLines || []);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const [placedSpirals, setPlacedSpirals] = useState<PlacedSpiral[]>(page.placedSpirals || []);
  const [selectedSpiralId, setSelectedSpiralId] = useState<string | null>(null);

  const [placedCircles, setPlacedCircles] = useState<PlacedCircle[]>(page.placedCircles || []);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

  const [placedSquares, setPlacedSquares] = useState<PlacedSquare[]>(page.placedSquares || []);
  const [selectedSquareId, setSelectedSquareId] = useState<string | null>(null);

  const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>(page.placedStamps || []);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [activeStampId, setActiveStampId] = useState<string>('star');
  const [isStampPickerOpen, setIsStampPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    setPlacedBubbles(page.placedBubbles || []);
    setPlacedLines(page.placedLines || []);
    setPlacedSpirals(page.placedSpirals || []);
    setPlacedCircles(page.placedCircles || []);
    setPlacedSquares(page.placedSquares || []);
    setPlacedStamps(page.placedStamps || []);
    setSelectedBubbleId(null);
    setSelectedLineId(null);
    setSelectedSpiralId(null);
    setSelectedCircleId(null);
    setSelectedSquareId(null);
    setSelectedStampId(null);
  }, [page.id]);

  const handleDeleteSelectedBubble = () => {
    if (!selectedBubbleId) return;
    setPlacedBubbles(prev => prev.filter(b => b.id !== selectedBubbleId));
    setSelectedBubbleId(null);
    showToast('Speech bubble deleted');
  };

  const handleDeleteSelectedLine = () => {
    if (!selectedLineId) return;
    setPlacedLines(prev => prev.filter(l => l.id !== selectedLineId));
    setSelectedLineId(null);
    showToast('Line deleted');
  };

  const handleDeleteSelectedSpiral = () => {
    if (!selectedSpiralId) return;
    setPlacedSpirals(prev => prev.filter(s => s.id !== selectedSpiralId));
    setSelectedSpiralId(null);
    showToast('Spiral deleted');
  };

  const handleDeleteSelectedCircle = () => {
    if (!selectedCircleId) return;
    setPlacedCircles(prev => prev.filter(c => c.id !== selectedCircleId));
    setSelectedCircleId(null);
    showToast('Circle deleted');
  };

  const handleDeleteSelectedSquare = () => {
    if (!selectedSquareId) return;
    setPlacedSquares(prev => prev.filter(sq => sq.id !== selectedSquareId));
    setSelectedSquareId(null);
    showToast('Square deleted');
  };

  const handleDeleteSelectedStamp = () => {
    if (!selectedStampId) return;
    setPlacedStamps(prev => prev.filter(st => st.id !== selectedStampId));
    setSelectedStampId(null);
    showToast('Stamp deleted');
  };
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>(() => {
    return page.transform || {
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      offsetX: 0,
      offsetY: 0
    };
  });
  const [title, setTitle] = useState(page.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLineArtExtractorModal, setShowLineArtExtractorModal] = useState(false);
  const [showBrushPreview, setShowBrushPreview] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coloring_crazy_show_brush_preview');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [showFloatingToolbar, setShowFloatingToolbar] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coloring_crazy_show_floating_toolbar');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [showShapeSelectPanel, setShowShapeSelectPanel] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coloring_crazy_show_shape_select_panel');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleBrushPreview = () => {
    setShowBrushPreview(prev => {
      const next = !prev;
      try {
        localStorage.setItem('coloring_crazy_show_brush_preview', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleFloatingToolbar = () => {
    setShowFloatingToolbar(prev => {
      const next = !prev;
      try {
        localStorage.setItem('coloring_crazy_show_floating_toolbar', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleShapeSelectPanel = () => {
    setShowShapeSelectPanel(prev => {
      const next = !prev;
      try {
        localStorage.setItem('coloring_crazy_show_shape_select_panel', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coloring_crazy_show_right_sidebar');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleRightSidebar = () => {
    setShowRightSidebar(prev => {
      const next = !prev;
      try {
        localStorage.setItem('coloring_crazy_show_right_sidebar', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    const trimmed = title.trim();
    if (!trimmed || trimmed === page.title) return;
    page.title = trimmed;
    await updatePageDetails(page.id, { title: trimmed });
    showToast('Title updated!');
  };

  const handleUndo = () => {
    window.dispatchEvent(new CustomEvent('canvas-history', { detail: 'undo' }));
  };

  const handleRedo = () => {
    window.dispatchEvent(new CustomEvent('canvas-history', { detail: 'redo' }));
  };

  const handleClear = () => {
    const hasPlacedElements = placedLines.length > 0 || placedCircles.length > 0 || placedSquares.length > 0 || placedSpirals.length > 0 || placedBubbles.length > 0;
    if (!canUndo && !hasPlacedElements) {
      showToast('Canvas is already clean!');
      return;
    }
    setShowClearConfirm(true);
  };

  const handleShortcutAction = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 's') {
      e.preventDefault();
      handleSave();
    } else if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
    } else if (key === 'y') {
      e.preventDefault();
      handleRedo();
    } else if (key === 'p') {
      e.preventDefault();
      onPrintPage(page);
    } else if (key === '=' || key === '+') {
      e.preventDefault();
      setZoom(z => Math.min(5, Number((z + 0.2).toFixed(2))));
    } else if (key === '-') {
      e.preventDefault();
      setZoom(z => Math.max(0.4, Number((z - 0.2).toFixed(2))));
    } else if (key === '0') {
      e.preventDefault();
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleToolShortcut = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'b') setActiveTool('brush');
    else if (key === 'e') setActiveTool('eraser');
    else if (key === 'g' || key === 'f' || key === 'k') setActiveTool('bucket');
    else if (key === 'i') setActiveTool('picker');
    else if (key === 't') {
      setActiveTool('stamp');
      setIsStampPickerOpen(true);
    } else if (key === 'w') setActiveTool('bubble');
    else if (key === 'v' || key === 's') setActiveTool('select');
    else if (key === 'l') setActiveTool('line');
    else if (key === 'c') setActiveTool('circle');
    else if (key === 'q' || key === 'r') setActiveTool('square');
    else if (key === 'h' || key === 'p') setActiveTool('pan');
    else if (key === 'm') setShowStencilPickerModal(true);
    else if (key === '[') setBrushSize(s => Math.max(2, s - 2));
    else if (key === ']') setBrushSize(s => Math.min(60, s + 2));
    else if (key === '0') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStampId) {
          e.preventDefault();
          handleDeleteSelectedStamp();
          return;
        }
        if (selectedSquareId) {
          e.preventDefault();
          handleDeleteSelectedSquare();
          return;
        }
        if (selectedCircleId) {
          e.preventDefault();
          handleDeleteSelectedCircle();
          return;
        }
        if (selectedSpiralId) {
          e.preventDefault();
          handleDeleteSelectedSpiral();
          return;
        }
        if (selectedLineId) {
          e.preventDefault();
          handleDeleteSelectedLine();
          return;
        }
        if (selectedBubbleId) {
          e.preventDefault();
          handleDeleteSelectedBubble();
          return;
        }
        if (activeStencil) {
          e.preventDefault();
          setActiveStencil(null);
          showToast('Stencil removed');
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        handleShortcutAction(e);
      } else if (!e.altKey) {
        handleToolShortcut(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, page, selectedBubbleId, selectedLineId, selectedSpiralId, selectedCircleId, selectedSquareId, selectedStampId, activeStencil]);

  // Merge color layer & line art layer for export
  const exportMergedDataUrl = (): string => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return '';
    
    const width = colorCanvas.width;
    const height = colorCanvas.height;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return '';

    // Paper white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const { scale = 1, rotation = 0, flipH = false, flipV = false, offsetX = 0, offsetY = 0 } = canvasTransform;

    ctx.save();
    ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * (flipH ? -1 : 1), scale * (flipV ? -1 : 1));

    const renderVectorLayer = (behind: boolean) => {
      for (const b of placedBubbles) {
        if (!b.isHidden && Boolean(b.isBehindPaint) === behind) {
          ctx.save();
          if (b.opacity !== undefined) ctx.globalAlpha = b.opacity;
          const rawTx = b.tailX !== undefined ? b.tailX : (b.options.tailX !== undefined ? b.options.tailX : undefined);
          const rawTy = b.tailY !== undefined ? b.tailY : (b.options.tailY !== undefined ? b.options.tailY : undefined);
          const shiftedTx = rawTx !== undefined ? rawTx - width / 2 : undefined;
          const shiftedTy = rawTy !== undefined ? rawTy - height / 2 : undefined;
          drawSpeechBubble(ctx, b.x - width / 2, b.y - height / 2, b.options, shiftedTx, shiftedTy);
          ctx.restore();
        }
      }
      for (const line of placedLines) {
        if (!line.isHidden && Boolean(line.isBehindPaint) === behind) {
          ctx.save();
          if (line.opacity !== undefined) ctx.globalAlpha = line.opacity;
          renderBrushStroke(
            ctx,
            { x: line.x1 - width / 2, y: line.y1 - height / 2 },
            { x: line.x2 - width / 2, y: line.y2 - height / 2 },
            line.color,
            line.size,
            line.style
          );
          ctx.restore();
        }
      }
      for (const s of placedSpirals) {
        if (!s.isHidden && Boolean(s.isBehindPaint) === behind) {
          ctx.save();
          if (s.opacity !== undefined) ctx.globalAlpha = s.opacity;
          drawArchimedeanSpiral(
            ctx,
            s.cx - width / 2,
            s.cy - height / 2,
            s.radius,
            s.turns ?? 3,
            s.color,
            s.size,
            s.style
          );
          ctx.restore();
        }
      }
      for (const c of placedCircles) {
        if (!c.isHidden && Boolean(c.isBehindPaint) === behind) {
          ctx.save();
          if (c.opacity !== undefined) ctx.globalAlpha = c.opacity;
          drawCircleShape(
            ctx,
            c.cx - width / 2,
            c.cy - height / 2,
            c.radius,
            c.color,
            c.size,
            c.style,
            c.fillColor
          );
          ctx.restore();
        }
      }
      for (const sq of placedSquares) {
        if (!sq.isHidden && Boolean(sq.isBehindPaint) === behind) {
          ctx.save();
          if (sq.opacity !== undefined) ctx.globalAlpha = sq.opacity;
          drawSquareShape(
            ctx,
            sq.x - width / 2,
            sq.y - height / 2,
            sq.width,
            sq.height,
            sq.color,
            sq.size,
            sq.style,
            sq.fillColor
          );
          ctx.restore();
        }
      }
      for (const st of placedStamps) {
        if (!st.isHidden && Boolean(st.isBehindPaint) === behind) {
          const def = getStampById(st.stampId);
          if (def) {
            ctx.save();
            if (st.opacity !== undefined) ctx.globalAlpha = st.opacity;
            drawStampShape(
              ctx,
              def,
              st.cx - width / 2,
              st.cy - height / 2,
              st.size,
              st.rotation ?? 0,
              st.color,
              st.fillColor
            );
            ctx.restore();
          }
        }
      }
    };

    // Draw back shapes behind paint
    renderVectorLayer(true);

    // Draw color canvas centered
    ctx.drawImage(colorCanvas, -width / 2, -height / 2, width, height);

    // Draw front shapes in front of paint
    renderVectorLayer(false);

    // Draw line art overlay with multiply blend mode
    if (lineCanvasRef.current) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(lineCanvasRef.current, -width / 2, -height / 2, width, height);
    }

    ctx.restore();
    return exportCanvas.toDataURL('image/png');
  };

  const saveCurrentProgress = async (isExplicitSave: boolean = false): Promise<void> => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;

    const colorDataUrl = colorCanvas.toDataURL('image/png');
    const mergedDataUrl = exportMergedDataUrl() || colorDataUrl;

    const now = Date.now();
    const updatedPage: ColoringPage = {
      ...page,
      aspectRatio,
      initialColorDataUrl: colorDataUrl,
      thumbnailDataUrl: mergedDataUrl,
      transform: canvasTransform,
      placedLines,
      placedCircles,
      placedSquares,
      placedSpirals,
      placedBubbles,
      placedStamps,
      lastEditedAt: now
    };

    await savePageProgress(updatedPage);

    const artworkId = page.artworkId || `artwork-${page.id}`;
    if (isExplicitSave || !isArtworkDeleted(artworkId)) {
      const artwork: SavedArtwork = {
        id: artworkId,
        pageId: page.id,
        title: page.title,
        coloredDataUrl: mergedDataUrl,
        lineArtDataUrl: page.lineArtDataUrl,
        completedAt: Date.now(),
        paletteUsed: DEFAULT_PALETTES[0].colors,
        category: page.category,
        aspectRatio,
        transform: canvasTransform,
        placedLines,
        placedCircles,
        placedSquares,
        placedSpirals,
        placedBubbles,
        placedStamps
      };

      await saveArtwork(artwork);
    }
  };

  const handleConfirmClear = async () => {
    window.dispatchEvent(new CustomEvent('canvas-history', { detail: 'clear' }));
    setShowClearConfirm(false);

    setPlacedLines([]);
    setSelectedLineId(null);
    setPlacedCircles([]);
    setSelectedCircleId(null);
    setPlacedSquares([]);
    setSelectedSquareId(null);
    setPlacedSpirals([]);
    setSelectedSpiralId(null);
    setPlacedBubbles([]);
    setSelectedBubbleId(null);
    setPlacedStamps([]);
    setSelectedStampId(null);

    const clearedPage: ColoringPage = {
      ...page,
      initialColorDataUrl: undefined,
      thumbnailDataUrl: undefined,
      transform: undefined,
      placedLines: [],
      placedCircles: [],
      placedSquares: [],
      placedSpirals: [],
      placedBubbles: [],
      placedStamps: []
    };
    await savePageProgress(clearedPage);
    const artworkId = page.artworkId || `artwork-${page.id}`;
    await deleteArtwork(artworkId);
    showToast('Canvas cleared! Started over.');
  };

  const handleBack = () => {
    const colorCanvas = colorCanvasRef.current;
    let updatedPage: ColoringPage | undefined = undefined;

    if (colorCanvas) {
      const colorDataUrl = colorCanvas.toDataURL('image/png');
      const mergedDataUrl = exportMergedDataUrl() || colorDataUrl;
      const now = Date.now();
      updatedPage = {
        ...page,
        aspectRatio,
        initialColorDataUrl: colorDataUrl,
        thumbnailDataUrl: mergedDataUrl,
        transform: canvasTransform,
        placedLines,
        placedCircles,
        placedSquares,
        placedSpirals,
        placedBubbles,
        placedStamps,
        lastEditedAt: now
      };
    }

    onBack(updatedPage);
    saveCurrentProgress(false);
  };

  const handleBlankCanvas = async () => {
    window.dispatchEvent(new CustomEvent('canvas-history', { detail: 'clear' }));
    setPlacedLines([]);
    setSelectedLineId(null);
    setPlacedCircles([]);
    setSelectedCircleId(null);
    setPlacedSquares([]);
    setSelectedSquareId(null);
    setPlacedSpirals([]);
    setSelectedSpiralId(null);
    setPlacedBubbles([]);
    setSelectedBubbleId(null);
    setPlacedStamps([]);
    setSelectedStampId(null);
    const blankSvgDataUrl = svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#FFFFFF"/>
      </svg>
    `);

    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newBlankPage: ColoringPage = {
      id: `custom-blank-${now}`,
      title: `Blank Canvas ${timeStr}`,
      description: 'A fresh blank white canvas for freehand painting and drawing.',
      category: 'Custom',
      tags: ['blank', 'custom'],
      lineArtDataUrl: blankSvgDataUrl,
      createdAt: now,
      isPreset: false,
      difficulty: 'Easy',
      aspectRatio: aspectRatio || '1:1'
    };

    await saveCustomPage(newBlankPage);

    page.id = newBlankPage.id;
    page.title = newBlankPage.title;
    page.lineArtDataUrl = newBlankPage.lineArtDataUrl;
    page.initialColorDataUrl = undefined;
    page.thumbnailDataUrl = undefined;
    page.artworkId = undefined;
    setTitle(newBlankPage.title);

    showToast('Created new Blank Canvas!');
  };

  const handleDeleteTargetColor = () => {
    const canvas = colorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const srcData = ctx.getImageData(0, 0, width, height);
    const targetColor = canvasTransform.targetColor || activeColor;
    const tolerance = canvasTransform.colorTolerance ?? 20;

    const erased = deleteSingleColor(srcData, width, height, targetColor, tolerance);
    ctx.putImageData(erased, 0, 0);

    setCanvasTransform(prev => ({
      ...prev,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      offsetX: 0,
      offsetY: 0
    }));
    showToast('Deleted target color from canvas');
  };

  const handleSave = async () => {
    await saveCurrentProgress(true);
    showToast('Saved progress to library & My Masterpieces!');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Single Top Bar (Header + Tools + Controls) */}
      <Toolbar
        onBack={handleBack}
        title={title}
        setTitle={setTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        onSaveTitle={handleSaveTitle}
        category={page.category}
        aspectRatio={aspectRatio}
        onAspectRatioChange={(newRatio) => {
          setAspectRatio(newRatio);
          showToast(`Canvas size updated to ${newRatio}`);
        }}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        tolerance={tolerance}
        setTolerance={setTolerance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        setZoom={setZoom}
        onResetZoom={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        showBrushPreview={showBrushPreview}
        onToggleBrushPreview={toggleBrushPreview}
        onExtractLineArt={() => setShowLineArtExtractorModal(true)}
        brushStyle={brushStyle}
        setBrushStyle={setBrushStyle}
        onOpenStencilPicker={() => setShowStencilPickerModal(true)}
        onOpenStampPicker={() => setIsStampPickerOpen(true)}
        showGridSettings={showGridSettings}
        onToggleGridSettings={() => setShowGridSettings(prev => !prev)}
        isLayerManagerOpen={isLayerManagerOpen}
        onToggleLayerManager={() => setIsLayerManagerOpen(prev => !prev)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
      />

      {/* Main Canvas Area */}
      <CanvasContainer
        lineArtDataUrl={page.lineArtDataUrl}
        initialColorDataUrl={page.initialColorDataUrl}
        thumbnailDataUrl={page.thumbnailDataUrl}
        targetRatio={aspectRatio}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        brushSize={brushSize}
        tolerance={tolerance}
        onStateChange={(u, r) => { setCanUndo(u); setCanRedo(r); }}
        colorCanvasRef={colorCanvasRef}
        lineCanvasRef={lineCanvasRef}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        transform={canvasTransform}
        setTransform={setCanvasTransform}
        showBrushPreview={showBrushPreview}
        bubbleOptions={bubbleOptions}
        setBubbleOptions={setBubbleOptions}
        placedBubbles={placedBubbles}
        setPlacedBubbles={setPlacedBubbles}
        selectedBubbleId={selectedBubbleId}
        setSelectedBubbleId={setSelectedBubbleId}
        placedLines={placedLines}
        setPlacedLines={setPlacedLines}
        selectedLineId={selectedLineId}
        setSelectedLineId={setSelectedLineId}
        placedSpirals={placedSpirals}
        setPlacedSpirals={setPlacedSpirals}
        selectedSpiralId={selectedSpiralId}
        setSelectedSpiralId={setSelectedSpiralId}
        placedCircles={placedCircles}
        setPlacedCircles={setPlacedCircles}
        selectedCircleId={selectedCircleId}
        setSelectedCircleId={setSelectedCircleId}
        placedSquares={placedSquares}
        setPlacedSquares={setPlacedSquares}
        selectedSquareId={selectedSquareId}
        setSelectedSquareId={setSelectedSquareId}
        placedStamps={placedStamps}
        setPlacedStamps={setPlacedStamps}
        selectedStampId={selectedStampId}
        setSelectedStampId={setSelectedStampId}
        activeStampId={activeStampId}
        brushStyle={brushStyle}
        activeStencil={activeStencil}
        stencilDef={activeStencil ? getStencilById(activeStencil.stencilId) : undefined}
        gradientOptions={gradientOptions}
        gridOptions={gridOptions}
        setStencilState={setActiveStencil}
        isPickingColor={isPickingColor}
        setIsPickingColor={setIsPickingColor}
        showShapeSelectPanel={showShapeSelectPanel}
      />

      {/* Floating Gradient & Texture Bucket Settings Panel */}
      {activeTool === 'bucket' ? (
        <BucketSettingsBar
          options={gradientOptions}
          setOptions={setGradientOptions}
          activeColor={activeColor}
          onClose={() => setActiveTool('brush')}
        />
      ) : null}

      {/* Collapsible Actions Right Sidebar */}
      <RightSidebar
        isOpen={showRightSidebar}
        onToggle={toggleRightSidebar}
        onBlankCanvas={handleBlankCanvas}
        canUndo={canUndo}
        onUndo={handleUndo}
        onClear={handleClear}
        showFloatingToolbar={showFloatingToolbar}
        onToggleFloatingToolbar={toggleFloatingToolbar}
        showShapeSelectPanel={showShapeSelectPanel}
        onToggleShapeSelectPanel={toggleShapeSelectPanel}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onPrint={() => onPrintPage({ ...page, aspectRatio })}
        onSave={handleSave}
      />

      {/* Floating Toolbar Window */}
      <FloatingToolbar
        isOpen={showFloatingToolbar}
        onClose={() => setShowFloatingToolbar(false)}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        tolerance={tolerance}
        setTolerance={setTolerance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        zoom={zoom}
        setZoom={setZoom}
        onResetZoom={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        showBrushPreview={showBrushPreview}
        onToggleBrushPreview={toggleBrushPreview}
        onExtractLineArt={() => setShowLineArtExtractorModal(true)}
        brushStyle={brushStyle}
        setBrushStyle={setBrushStyle}
        onOpenStencilPicker={() => setShowStencilPickerModal(true)}
        onOpenStampPicker={() => setIsStampPickerOpen(true)}
        showGridSettings={showGridSettings}
        onToggleGridSettings={() => setShowGridSettings(prev => !prev)}
      />

      {/* Stamp Picker Modal */}
      <StampPickerModal
        isOpen={isStampPickerOpen}
        onClose={() => setIsStampPickerOpen(false)}
        activeStampId={activeStampId}
        onSelectStamp={(stampId) => {
          setActiveStampId(stampId);
          setActiveTool('stamp');
          setIsStampPickerOpen(false);
        }}
      />

      {/* Floating Line & Dot Grid Overlay Settings Bar */}
      {showGridSettings ? (
        <GridSettingsBar
          options={gridOptions}
          setOptions={setGridOptions}
          onClose={() => setShowGridSettings(false)}
        />
      ) : null}

      {/* Floating Speech Bubble Settings Panel */}
      {activeTool === 'bubble' || (activeTool === 'select' && selectedBubbleId) ? (
        <SpeechBubbleSettingsBar
          options={bubbleOptions}
          setOptions={(newOptions) => {
            setBubbleOptions(prev => {
              const next = typeof newOptions === 'function' ? newOptions(prev) : newOptions;
              if (selectedBubbleId) {
                setPlacedBubbles(pbs => pbs.map(b => b.id === selectedBubbleId ? { ...b, options: next } : b));
              }
              return next;
            });
          }}
          activeColor={activeColor}
          onClose={() => {
            setSelectedBubbleId(null);
            setActiveTool('brush');
          }}
          selectedBubbleId={selectedBubbleId}
          onDeleteSelected={handleDeleteSelectedBubble}
          onMoveSelected={() => setActiveTool('select')}
          isMoveActive={activeTool === 'select'}
          onResetTail={() => {
            if (selectedBubbleId) {
              setPlacedBubbles(pbs => pbs.map(b => b.id === selectedBubbleId ? { ...b, tailX: undefined, tailY: undefined, options: { ...b.options, tailX: undefined, tailY: undefined } } : b));
            }
          }}
        />
      ) : null}

      {/* Floating Canvas Transform Settings Bar */}
      {activeTool === 'transform' ? (
        <TransformSettingsBar
          transform={canvasTransform}
          setTransform={setCanvasTransform}
          onClose={() => setActiveTool('brush')}
          activeColor={activeColor}
          isPickingColor={isPickingColor}
          setIsPickingColor={setIsPickingColor}
          onDeleteColor={handleDeleteTargetColor}
        />
      ) : null}

      {/* Floating Stencil Settings Bar (Draggable) */}
      {activeStencil && showStencilControls ? (
        <StencilSettingsBar
          stencilState={activeStencil}
          setStencilState={setActiveStencil}
          stencilDef={getStencilById(activeStencil.stencilId) || { id: activeStencil.stencilId, name: 'Custom Stencil', category: 'Custom', icon: '🎨', svgPath: '' }}
          onOpenPicker={() => setShowStencilPickerModal(true)}
          onClose={() => setShowStencilControls(false)}
          onMove={() => setActiveTool('stencil')}
          isMoveActive={activeTool === 'stencil'}
          onOutline={() => {
            window.dispatchEvent(new CustomEvent('canvas-outline-stencil'));
            showToast('Stencil outline painted!');
          }}
        />
      ) : null}

      {/* Stencil Picker Modal */}
      <StencilPickerModal
        isOpen={showStencilPickerModal}
        onClose={() => setShowStencilPickerModal(false)}
        selectedStencilId={activeStencil?.stencilId || null}
        onSelectStencil={(id) => {
          const w = colorCanvasRef.current?.width || 800;
          const h = colorCanvasRef.current?.height || 800;
          setActiveStencil(getInitialStencilState(id, w, h));
          setShowStencilControls(true);
          setActiveTool('stencil');
        }}
        onClearStencil={() => {
          setActiveStencil(null);
          setShowStencilControls(false);
        }}
        onOpenSvgCreator={() => {
          setShowStencilPickerModal(false);
          setShowSvgCreatorModal(true);
        }}
      />

      {/* SVG Path Vector Creator Modal */}
      <SvgPathCreatorModal
        isOpen={showSvgCreatorModal}
        onClose={() => setShowSvgCreatorModal(false)}
        onStencilCreated={(id) => {
          const w = colorCanvasRef.current?.width || 800;
          const h = colorCanvasRef.current?.height || 800;
          setActiveStencil(getInitialStencilState(id, w, h));
          setShowStencilControls(true);
          setActiveTool('stencil');
          showToast('Custom SVG Stencil Created & Active!');
        }}
        colorCanvasRef={colorCanvasRef}
      />

      {/* Floating Favorites Bar */}
      <FloatingFavoritesBar
        isOpen={showFloatingFavorites}
        onClose={() => setShowFloatingFavorites(false)}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
      />

      {/* Bottom Palette Swatches */}
      <PaletteBar
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        showFloatingFavorites={showFloatingFavorites}
        onToggleFloatingFavorites={() => setShowFloatingFavorites(prev => !prev)}
      />

      {/* Start Over Confirmation Modal */}
      {showClearConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/60 border border-rose-800/50 rounded-2xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Start Over?</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to clear all colored paint, lines, shapes, and spirals? You can still use Undo if you change your mind.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Keep Painting
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast notification */}
      {toastMessage ? (
        <div className="absolute top-16 right-6 bg-purple-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-bounce z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      ) : null}

      {/* Studio Line Art Extractor Modal */}
      <LineArtExtractorModal
        isOpen={showLineArtExtractorModal}
        onClose={() => setShowLineArtExtractorModal(false)}
        currentImageSrc={page.lineArtDataUrl}
        targetRatio={aspectRatio}
        initialTransform={canvasTransform}
        onApplyLineArt={(newLineArtDataUrl, newTransform) => {
          page.lineArtDataUrl = newLineArtDataUrl;
          setCanvasTransform(newTransform);
          showToast('Line art extracted and updated!');
          saveCurrentProgress(true);
        }}
      />

      {/* Visual Layer Manager Panel */}
      <LayerManagerPanel
        isOpen={isLayerManagerOpen}
        onClose={() => setIsLayerManagerOpen(false)}
        placedLines={placedLines}
        setPlacedLines={setPlacedLines}
        placedCircles={placedCircles}
        setPlacedCircles={setPlacedCircles}
        placedSquares={placedSquares}
        setPlacedSquares={setPlacedSquares}
        placedSpirals={placedSpirals}
        setPlacedSpirals={setPlacedSpirals}
        placedBubbles={placedBubbles}
        setPlacedBubbles={setPlacedBubbles}
        placedStamps={placedStamps}
        setPlacedStamps={setPlacedStamps}
        selectedLineId={selectedLineId}
        setSelectedLineId={setSelectedLineId}
        selectedCircleId={selectedCircleId}
        setSelectedCircleId={setSelectedCircleId}
        selectedSquareId={selectedSquareId}
        setSelectedSquareId={setSelectedSquareId}
        selectedSpiralId={selectedSpiralId}
        setSelectedSpiralId={setSelectedSpiralId}
        selectedBubbleId={selectedBubbleId}
        setSelectedBubbleId={setSelectedBubbleId}
        selectedStampId={selectedStampId}
        setSelectedStampId={setSelectedStampId}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
};
