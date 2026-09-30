import React, { useEffect, useState } from 'react';
import { ColoringPage, SavedArtwork } from './types/coloring';
import { getAllPages, getAllArtworks, saveCustomPage } from './services/db';
import { Navbar } from './components/Navbar';
import { LibraryView } from './components/Library/LibraryView';
import { ColoringStudio } from './components/Studio/ColoringStudio';
import { ArtworksView } from './components/MyArtworks/ArtworksView';
import { PageCreatorModal } from './components/Creator/PageCreatorModal';
import { PrintStationModal } from './components/Print/PrintStationModal';
import { ServerFolderBrowserModal } from './components/Library/ServerFolderBrowserModal';
import { ColoringResourcesModal } from './components/Library/ColoringResourcesModal';

import { PRESET_PAGES, svgToDataUrl } from './services/presets';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'artworks' | 'favorites'>('library');
  const [pages, setPages] = useState<ColoringPage[]>(PRESET_PAGES);
  const [artworks, setArtworks] = useState<SavedArtwork[]>([]);
  
  const [selectedStudioPage, setSelectedStudioPage] = useState<ColoringPage | null>(null);
  const [printModalPage, setPrintModalPage] = useState<ColoringPage | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isServerFoldersOpen, setIsServerFoldersOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const loadData = async () => {
    try {
      const loadedPages = await getAllPages();
      const loadedArtworks = await getAllArtworks();
      if (loadedPages && loadedPages.length > 0) {
        setPages(loadedPages);
      }
      setArtworks(loadedArtworks || []);
    } catch (err) {
      console.error('Failed to load database content:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBlankStudio = async () => {
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
      aspectRatio: '1:1'
    };

    await saveCustomPage(newBlankPage);
    await loadData();
    setSelectedStudioPage(newBlankPage);
  };

  const handlePageCreated = (newPage: ColoringPage) => {
    loadData();
    setSelectedStudioPage(newPage);
  };

  const handleContinueColoring = (art: SavedArtwork) => {
    const page: ColoringPage = {
      id: art.pageId,
      artworkId: art.id,
      title: art.title,
      description: 'Continued masterpiece coloring.',
      category: art.category,
      tags: ['masterpiece'],
      lineArtDataUrl: art.lineArtDataUrl,
      initialColorDataUrl: art.coloredDataUrl,
      createdAt: art.completedAt,
      isPreset: false,
      difficulty: 'Medium',
      aspectRatio: art.aspectRatio,
      transform: art.transform,
      placedLines: art.placedLines,
      placedCircles: art.placedCircles,
      placedSquares: art.placedSquares,
      placedSpirals: art.placedSpirals,
      placedBubbles: art.placedBubbles
    };
    setSelectedStudioPage(page);
  };

  const handleBackFromStudio = (updatedPage?: ColoringPage) => {
    if (updatedPage) {
      setPages(prev => [updatedPage, ...prev.filter(p => p.id !== updatedPage.id)]);
    }
    setSelectedStudioPage(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {selectedStudioPage ? (
        <ColoringStudio
          page={selectedStudioPage}
          onBack={handleBackFromStudio}
          onPrintPage={(p) => setPrintModalPage(p)}
        />
      ) : (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCreator={() => setIsCreatorOpen(true)}
            onOpenBlankStudio={handleOpenBlankStudio}
          />

          <main className="flex-1">
            {activeTab === 'library' || activeTab === 'favorites' ? (
              <LibraryView
                pages={pages}
                onRefresh={loadData}
                onSelectPage={(page) => setSelectedStudioPage(page)}
                onPrintPage={(page) => setPrintModalPage(page)}
                onOpenCreator={() => setIsCreatorOpen(true)}
                onOpenBlankStudio={handleOpenBlankStudio}
                onOpenServerFolders={() => setIsServerFoldersOpen(true)}
                onOpenResources={() => setIsResourcesOpen(true)}
                onlyFavorites={activeTab === 'favorites'}
              />
            ) : (
              <ArtworksView
                artworks={artworks}
                onRefresh={loadData}
                onContinueColoring={handleContinueColoring}
              />
            )}
          </main>
        </>
      )}

      {/* Creator Modal */}
      {isCreatorOpen ? (
        <PageCreatorModal
          onClose={() => setIsCreatorOpen(false)}
          onPageCreated={handlePageCreated}
        />
      ) : null}

      {/* Server Folder Browser Modal */}
      <ServerFolderBrowserModal
        isOpen={isServerFoldersOpen}
        onClose={() => setIsServerFoldersOpen(false)}
        onRefreshLibrary={loadData}
        onSelectStudioPage={(page) => setSelectedStudioPage(page)}
      />

      {/* Coloring Resources Modal */}
      <ColoringResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />

      {/* Print Station Modal */}
      {printModalPage ? (
        <PrintStationModal
          page={printModalPage}
          onClose={() => setPrintModalPage(null)}
        />
      ) : null}
    </div>
  );
};

export default App;

