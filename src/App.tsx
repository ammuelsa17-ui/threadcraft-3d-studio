import React, { useEffect, useState } from 'react';
import { useStudioStore } from './store/useStudioStore';
import { ensureInitialTemplates, db } from './services/db';
import { TopBar } from './components/header/TopBar';
import { StudioScene } from './components/viewport3d/StudioScene';
import { FabricCanvas } from './components/editor2d/FabricCanvas';
import { Toolbar2D } from './components/editor2d/Toolbar2D';
import { ObjectInspector } from './components/editor2d/ObjectInspector';
import { TransformBar } from './components/editor2d/TransformBar';
import { LayerPanel } from './components/editor2d/LayerPanel';
import { MaterialPanel } from './components/panels/MaterialPanel';
import { ProductSelectorModal } from './components/panels/ProductSelectorModal';
import { ExportModal } from './components/panels/ExportModal';
import { ProjectManagerModal } from './components/panels/ProjectManagerModal';
import { AssetStudioModal } from './components/panels/AssetStudioModal';

export const App: React.FC = () => {
  const viewMode = useStudioStore((s) => s.viewMode);
  const loadProject = useStudioStore((s) => s.loadProject);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAssetStudioOpen, setIsAssetStudioOpen] = useState(false);
  const [isMaterialPanelOpen, setIsMaterialPanelOpen] = useState(true);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);

  // Initialize DB and load starter project on first boot
  useEffect(() => {
    const initApp = async () => {
      await ensureInitialTemplates();
      const firstProject = await db.projects.orderBy('updatedAt').reverse().first();
      if (firstProject) {
        loadProject(firstProject);
      }
    };
    initApp();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen bg-studio-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <TopBar
        onOpenProductModal={() => setIsProductModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenAssetStudioModal={() => setIsAssetStudioOpen(true)}
        onToggleMaterialPanel={() => setIsMaterialPanelOpen((prev) => !prev)}
        isMaterialPanelOpen={isMaterialPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen((prev) => !prev)}
        isLayerPanelOpen={isLayerPanelOpen}
      />

      {/* Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Layer Stack Drawer */}
        {(viewMode === 'split' || viewMode === '2d') && (
          <LayerPanel
            isOpen={isLayerPanelOpen}
            onToggle={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
          />
        )}

        {/* 2D Canvas Workspace (Visible in 'split' or '2d' modes) */}
        {(viewMode === 'split' || viewMode === '2d') && (
          <div
            className={`flex flex-col border-r border-studio-800 transition-all ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Top 2D Toolbar */}
            <Toolbar2D />

            {/* Contextual Object Inspector */}
            <ObjectInspector />

            {/* Numeric Transform & Alignment Bar */}
            <TransformBar />

            {/* Interactive Canvas Artboard */}
            <div className="flex-1 relative">
              <FabricCanvas />
            </div>
          </div>
        )}

        {/* 3D WebGL Viewport (Visible in 'split' or '3d' modes) */}
        {(viewMode === 'split' || viewMode === '3d') && (
          <div
            className={`flex-1 relative transition-all ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <StudioScene />
          </div>
        )}

        {/* Blender-Style PBR Shader Dock */}
        {isMaterialPanelOpen && <MaterialPanel />}
      </div>

      {/* Product Selection Modal */}
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* Production Artwork & Mockup Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* IndexedDB Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      {/* Asset Studio: Custom GLB & UV Configuration Modal */}
      <AssetStudioModal
        isOpen={isAssetStudioOpen}
        onClose={() => setIsAssetStudioOpen(false)}
      />
    </div>
  );
};

export default App;
