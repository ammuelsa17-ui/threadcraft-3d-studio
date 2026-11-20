import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useStudioStore } from '../../store/useStudioStore';
import { db } from '../../services/db';
import { ModelValidator, ModelValidationReport } from '../../services/modelValidator';
import { CustomProductRecord, FabricPreset, PrintZoneConfig } from '../../types/product';
import {
  Upload,
  Box,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  Sparkles,
  Maximize2,
  Grid,
  Save,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssetStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetStudioModal: React.FC<AssetStudioModalProps> = ({ isOpen, onClose }) => {
  const setProduct = useStudioStore((s) => s.setProduct);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState('Custom Designer Garment');
  const [category, setCategory] = useState<'Apparel' | 'Drinkware' | 'Accessories'>('Apparel');
  const [defaultColor, setDefaultColor] = useState('#1e212d');
  const [fabricType, setFabricType] = useState<FabricPreset>('cotton');
  const [validationReport, setValidationReport] = useState<ModelValidationReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active Zone configuration in UV space [0, 1]
  const [zoneId, setZoneId] = useState('front');
  const [zoneName, setZoneName] = useState('Front Primary Surface');
  const [physWidthCm, setPhysWidthCm] = useState(35);
  const [physHeightCm, setPhysHeightCm] = useState(42);
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(1200);

  // Interactive UV bounding box in percent [0..100]
  const [uvX, setUvX] = useState(20);
  const [uvY, setUvY] = useState(15);
  const [uvW, setUvW] = useState(60);
  const [uvH, setUvH] = useState(70);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setValidationReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const loader = new GLTFLoader();

      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          const report = ModelValidator.validate(gltf.scene);
          setValidationReport(report);
          setProductName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          setIsProcessing(false);
        },
        (error) => {
          console.error('Failed to parse GLTF:', error);
          alert('Could not parse 3D model file.');
          setIsProcessing(false);
        }
      );
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleSaveCustomTemplate = async () => {
    const newZone: PrintZoneConfig = {
      id: zoneId,
      name: zoneName,
      description: `Configured in Asset Studio (${physWidthCm} × ${physHeightCm} cm)`,
      canvasWidth,
      canvasHeight,
      physicalWidthCm: physWidthCm,
      physicalHeightCm: physHeightCm,
      cameraPosition: [0, 0.1, 3.2],
      cameraTarget: [0, 0, 0],
    };

    const customRecord: CustomProductRecord = {
      id: 'custom-' + Date.now(),
      name: productName,
      subtitle: `${category} • Custom Configured Template`,
      category,
      defaultColor,
      colorPalette: [defaultColor, '#ffffff', '#18181b', '#3b82f6', '#ef4444', '#10b981'],
      defaultMaterial: {
        roughness: fabricType === 'ceramic' ? 0.18 : 0.85,
        metalness: 0.05,
        normalScale: 1.2,
        fabricType,
        clearcoat: fabricType === 'ceramic' ? 0.85 : 0.0,
        bumpScale: 0.08,
        ambientIntensity: 0.95,
        environmentPreset: 'studio',
      },
      zones: [newZone],
      initialCamera: {
        position: [0, 0.1, 3.2],
        target: [0, 0, 0],
        fov: 38,
      },
      isCustom: true,
      createdAt: Date.now(),
    };

    await db.customProducts.put(customRecord);
    setSaveSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setProduct(customRecord.id as any);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-studio-900 border border-studio-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-studio-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-500/30">
              <Box className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Asset Studio: UV & Product Configuration</span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect 3D meshes, validate UV maps, and configure editable print surfaces.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-studio-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Custom Product Template Saved and Activated! Loading...</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: 3D Model Importer & Validation Report */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Import Blender / GLTF Model</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Upload a binary glTF (.glb) file with UV coordinates to configure a custom product.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Validating Geometry...' : 'Upload .GLB 3D Model'}</span>
              </button>
            </div>

            {/* Validation Metrics */}
            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Geometry & UV Audit</span>
              </h3>

              {validationReport ? (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-studio-750">
                    <span className="text-slate-400">Validation Status</span>
                    {validationReport.isValid ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> VALID
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> INVALID
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mesh Count</span>
                    <span className="text-white font-bold">{validationReport.meshCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Vertices</span>
                    <span className="text-white">{validationReport.totalVertices.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">UV Coordinates (attributes.uv)</span>
                    <span className={validationReport.hasUVs ? 'text-emerald-400' : 'text-rose-400'}>
                      {validationReport.hasUVs ? 'PRESENT (Mapped)' : 'MISSING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vertex Normals</span>
                    <span className={validationReport.hasNormals ? 'text-emerald-400' : 'text-amber-400'}>
                      {validationReport.hasNormals ? 'VALID' : 'GENERATED'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  Using calibrated reference mesh geometry (Crewneck T-Shirt).
                </div>
              )}
            </div>

            {/* Template Metadata Form */}
            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Product Template Details
              </h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-studio-800 text-white px-3 py-1.5 rounded-lg border border-studio-700 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-studio-800 text-white px-2.5 py-1.5 rounded-lg border border-studio-700 text-xs focus:outline-none"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Drinkware">Drinkware</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Fabric Preset</label>
                  <select
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value as any)}
                    className="w-full bg-studio-800 text-white px-2.5 py-1.5 rounded-lg border border-studio-700 text-xs focus:outline-none"
                  >
                    <option value="cotton">Combed Cotton</option>
                    <option value="french_terry">French Terry</option>
                    <option value="canvas">Duck Canvas</option>
                    <option value="twill">Chino Twill</option>
                    <option value="ceramic">Glazed Ceramic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 2D UV Inspector & Zone Boundary Editor */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-studio-850 border border-studio-750">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Interactive UV Space [0..1]</span>
                </h3>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  PRINT REGION
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Drag and adjust the editable surface bounding box over the normalized UV unwrap.
              </p>

              {/* Interactive UV Canvas Preview Box */}
              <div className="relative w-full aspect-square bg-studio-950 rounded-xl border border-studio-750 overflow-hidden select-none">
                {/* UV Coordinate Grid Lines */}
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
                    backgroundSize: '10% 10%',
                  }}
                />

                {/* Simulated T-Shirt Seam Wireframe Silhouette */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100">
                  <path d="M 30,10 Q 50,22 70,10 L 88,25 L 78,38 L 72,32 L 74,90 L 26,90 L 28,32 L 22,38 L 12,25 Z" fill="none" stroke="#818cf8" strokeWidth="1.5" />
                </svg>

                {/* Printable Design Zone Bounding Box */}
                <div
                  className="absolute border-2 border-indigo-500 bg-indigo-500/20 rounded cursor-move transition-all flex flex-col justify-between p-1.5"
                  style={{
                    left: `${uvX}%`,
                    top: `${uvY}%`,
                    width: `${uvW}%`,
                    height: `${uvH}%`,
                  }}
                >
                  <span className="text-[9px] font-mono text-white bg-indigo-600 px-1 rounded max-w-fit">
                    {zoneName}
                  </span>

                  {/* 5% Safe Design Inset Margin */}
                  <div className="absolute inset-2 border border-dashed border-emerald-400/50 pointer-events-none" />

                  <span className="text-[8px] font-mono text-indigo-200 self-end">
                    {physWidthCm} × {physHeightCm} cm
                  </span>
                </div>
              </div>

              {/* UV Bounding Sliders */}
              <div className="grid grid-cols-2 gap-3 mt-3 font-mono text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400">Position X (U): {uvX}%</span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={uvX}
                    onChange={(e) => setUvX(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Position Y (V): {uvY}%</span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={uvY}
                    onChange={(e) => setUvY(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Width: {uvW}%</span>
                  <input
                    type="range"
                    min={20}
                    max={90}
                    value={uvW}
                    onChange={(e) => setUvW(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Height: {uvH}%</span>
                  <input
                    type="range"
                    min={20}
                    max={90}
                    value={uvH}
                    onChange={(e) => setUvH(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Template Action Button */}
            <button
              onClick={handleSaveCustomTemplate}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Activate Custom Product Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
