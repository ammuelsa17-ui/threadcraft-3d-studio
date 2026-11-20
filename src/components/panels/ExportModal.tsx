import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import { calculatePrintResolution, PRINT_DPI_PRESETS } from '../../services/printResolution';
import {
  Download,
  Image as ImageIcon,
  FileCode,
  Layers,
  Sparkles,
  X,
  Check,
  Camera,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const canvases = useStudioStore((s) => s.canvases);
  const garmentColor = useStudioStore((s) => s.garmentColor);
  const materialSettings = useStudioStore((s) => s.materialSettings);
  const projectName = useStudioStore((s) => s.projectName);
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);

  const [selectedDpi, setSelectedDpi] = useState<number>(300);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeZone = activeProduct.zones.find((z) => z.id === activeZoneId) || activeProduct.zones[0];
  const activeRes = calculatePrintResolution(activeZone.physicalWidthCm, activeZone.physicalHeightCm, selectedDpi);

  // 1. Export High-Res Transparent Production Artwork using Exact Physical DPI
  const handleExportArtwork = async (selectedZoneId: string) => {
    setIsExporting(true);
    setDownloadSuccess(null);

    try {
      const zone = activeProduct.zones.find((z) => z.id === selectedZoneId) || activeZone;
      let jsonStr = canvases[selectedZoneId] || '';

      if (selectedZoneId === activeZoneId && activeFabricCanvas) {
        jsonStr = JSON.stringify(activeFabricCanvas.toJSON());
      }

      const { dataUrl, resolution } = await textureBaker.generateExactDpiArtwork(
        jsonStr,
        zone.physicalWidthCm,
        zone.physicalHeightCm,
        selectedDpi,
        zone.canvasWidth
      );

      const a = document.createElement('a');
      a.href = dataUrl;
      const fileSlug = projectName.toLowerCase().replace(/\s+/g, '-');
      a.download = `${fileSlug}-${selectedZoneId}-${selectedDpi}dpi-${resolution.widthPx}x${resolution.heightPx}px.png`;
      a.click();

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setDownloadSuccess(`Exported ${zone.name} (${resolution.widthPx} × ${resolution.heightPx} px @ ${selectedDpi} DPI)`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export 3D Viewport Render
  const handleExport3DPreview = () => {
    const canvas = document.querySelector('canvas.cursor-grab') as HTMLCanvasElement;
    if (!canvas) {
      alert('Could not find 3D viewport canvas');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-3d-mockup.png`;
    a.click();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setDownloadSuccess('Exported 3D Studio Mockup');
  };

  // 3. Export Vector SVG
  const handleExportSVG = () => {
    if (!activeFabricCanvas) return;
    const svgData = activeFabricCanvas.toSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${activeZoneId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Exported Vector SVG');
  };

  // 4. Export Complete Project File
  const handleExportProjectFile = () => {
    const projectData = {
      version: '1.0.0',
      name: projectName,
      productType: activeProduct.id,
      garmentColor,
      materialSettings,
      canvases: {
        ...canvases,
        [activeZoneId]: activeFabricCanvas ? JSON.stringify(activeFabricCanvas.toJSON()) : canvases[activeZoneId],
      },
      exportedAt: Date.now(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.threadcraft`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Exported .threadcraft Project');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-studio-900 border border-studio-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-studio-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              <span>Production Export Center</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical DPI calibrated export: Transparent production masters & 3D renders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-studio-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Check className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar max-h-[75vh]">
          {/* Section 1: Transparent Master Artwork */}
          <div className="p-4 rounded-xl bg-studio-850 border border-studio-750">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Transparent Production Artwork</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PHYSICAL DPI ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Outputs transparent PNG artwork without garment background, sized to exact printer specifications (formula: cm / 2.54 × DPI).
            </p>

            {/* DPI Target Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
              {PRINT_DPI_PRESETS.map((preset) => {
                const isSelected = selectedDpi === preset.dpi;
                return (
                  <button
                    key={preset.dpi}
                    onClick={() => setSelectedDpi(preset.dpi)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                        : 'bg-studio-800 border-studio-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{preset.dpi} DPI</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-studio-700 text-slate-300">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Live Print Dimension Spec Card */}
            <div className="bg-studio-900/80 p-3 rounded-xl border border-studio-750 flex items-center justify-between text-xs mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Target Print Spec for <strong>{activeZone.name}</strong> ({activeZone.physicalWidthCm} × {activeZone.physicalHeightCm} cm):
                </span>
              </div>
              <div className="font-mono font-bold text-indigo-400 text-right">
                {activeRes.widthPx} × {activeRes.heightPx} px ({activeRes.totalMegapixels} MP)
              </div>
            </div>

            {/* Export Buttons per Zone */}
            <div className="flex flex-wrap gap-2">
              {activeProduct.zones.map((zone) => {
                const zRes = calculatePrintResolution(zone.physicalWidthCm, zone.physicalHeightCm, selectedDpi);
                return (
                  <button
                    key={zone.id}
                    disabled={isExporting}
                    onClick={() => handleExportArtwork(zone.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-studio-800 hover:bg-studio-750 text-white text-xs font-medium rounded-xl border border-studio-700 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      Export {zone.name} ({zRes.widthPx} × {zRes.heightPx} px)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: 3D Studio Mockup */}
          <div className="p-4 rounded-xl bg-studio-850 border border-studio-750 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">3D Studio Mockup Render</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                High-fidelity 3D garment snapshot with studio lighting, realistic fabric folds, and contact shadows.
              </p>
            </div>
            <button
              onClick={handleExport3DPreview}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Capture 3D Render</span>
            </button>
          </div>

          {/* Section 3: Vector SVG & Project Backup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">Vector SVG Export</h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Crisp vector paths and typography curves for plotter / cutter machines.
                </p>
              </div>
              <button
                onClick={handleExportSVG}
                className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-studio-850 hover:bg-studio-750 border border-studio-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export SVG</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">Studio Project Backup</h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Save complete editable source file (.threadcraft) to reopen anytime.
                </p>
              </div>
              <button
                onClick={handleExportProjectFile}
                className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-studio-850 hover:bg-studio-750 border border-studio-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download .threadcraft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
