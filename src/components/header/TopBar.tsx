import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Undo,
  Redo,
  Download,
  FolderOpen,
  Layout,
  Box,
  PenTool,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface TopBarProps {
  onOpenProductModal: () => void;
  onOpenExportModal: () => void;
  onOpenProjectModal: () => void;
  onOpenAssetStudioModal: () => void;
  onToggleMaterialPanel: () => void;
  isMaterialPanelOpen: boolean;
  onToggleLayerPanel: () => void;
  isLayerPanelOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenProductModal,
  onOpenExportModal,
  onOpenProjectModal,
  onOpenAssetStudioModal,
  onToggleMaterialPanel,
  isMaterialPanelOpen,
  onToggleLayerPanel,
  isLayerPanelOpen,
}) => {
  const projectName = useStudioStore((s) => s.projectName);
  const setProjectName = useStudioStore((s) => s.setProjectName);
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const viewMode = useStudioStore((s) => s.viewMode);
  const setViewMode = useStudioStore((s) => s.setViewMode);
  const historyPast = useStudioStore((s) => s.historyPast);
  const historyFuture = useStudioStore((s) => s.historyFuture);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const isSaving = useStudioStore((s) => s.isSaving);
  const lastSavedAt = useStudioStore((s) => s.lastSavedAt);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectName);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      setProjectName(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 bg-studio-950 border-b border-studio-800 px-4 flex items-center justify-between select-none z-30">
      {/* Left: Brand + Product Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-studio-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-black tracking-wider text-white">THREADCRAFT</span>
            <span className="text-[10px] font-mono text-indigo-400 block -mt-1 font-semibold">3D STUDIO</span>
          </div>
        </div>

        {/* Product Model Trigger */}
        <button
          onClick={onOpenProductModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-studio-900 hover:bg-studio-850 border border-studio-750 text-slate-200 rounded-xl text-xs font-medium transition-colors"
        >
          <Box className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-white">{activeProduct.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Project Title Editor */}
        <div className="flex items-center gap-2 ml-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-studio-850 text-white font-medium text-xs px-2.5 py-1 rounded-lg border border-indigo-500 focus:outline-none"
            />
          ) : (
            <span
              onClick={() => {
                setTempTitle(projectName);
                setIsEditingTitle(true);
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-studio-900 transition-colors"
              title="Click to rename project"
            >
              {projectName}
            </span>
          )}

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <CheckCircle2 className={`w-3.5 h-3.5 ${isSaving ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span>{isSaving ? 'Saving...' : 'Saved to IndexedDB'}</span>
          </div>
        </div>
      </div>

      {/* Center: History & View Modes */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-studio-900 p-1 rounded-xl border border-studio-800">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className={`p-1.5 rounded-lg transition-colors ${
              historyPast.length > 0
                ? 'text-slate-200 hover:bg-studio-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className={`p-1.5 rounded-lg transition-colors ${
              historyFuture.length > 0
                ? 'text-slate-200 hover:bg-studio-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl/Cmd + Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Layout Switcher */}
        <div className="flex items-center gap-1 bg-studio-900 p-1 rounded-xl border border-studio-800">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-studio-800'
            }`}
            title="Split 2D Canvas + 3D Viewport"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Studio Split</span>
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-studio-800'
            }`}
            title="3D Render Viewport Only"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Only</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === '2d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-studio-800'
            }`}
            title="2D Vector Canvas Only"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>2D Only</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLayerPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isLayerPanelOpen
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-studio-900 hover:bg-studio-850 border-studio-750 text-slate-300 hover:text-white'
          }`}
          title="Toggle Layers Panel"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Layers</span>
        </button>

        <button
          onClick={onOpenAssetStudioModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-900 hover:bg-studio-850 text-purple-300 hover:text-white rounded-xl text-xs font-semibold border border-purple-500/30 transition-colors"
          title="Open Asset Studio (Configure Custom 3D Models & UVs)"
        >
          <Box className="w-3.5 h-3.5 text-purple-400" />
          <span>Asset Studio</span>
        </button>

        <button
          onClick={onOpenProjectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-900 hover:bg-studio-850 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-studio-750 transition-colors"
          title="Open Project Library"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Projects</span>
        </button>

        <button
          onClick={onToggleMaterialPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isMaterialPanelOpen
              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
              : 'bg-studio-900 hover:bg-studio-850 border-studio-750 text-slate-300 hover:text-white'
          }`}
          title="Toggle Blender-Style PBR Shader Panel"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Materials</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          title="Export Transparent Master Artwork & 3D Renders"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Artwork</span>
        </button>
      </div>
    </header>
  );
};
