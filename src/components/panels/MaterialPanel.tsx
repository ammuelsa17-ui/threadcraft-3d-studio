import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { FabricPreset } from '../../types/product';
import {
  Palette,
  Sliders,
  Sun,
  Layers,
  Sparkles,
  Droplet,
  ShieldAlert,
} from 'lucide-react';

const FABRIC_PRESETS: { id: FabricPreset; name: string; desc: string; defaultRoughness: number; defaultNormal: number }[] = [
  { id: 'cotton', name: 'Combed Cotton', desc: 'Fine interlaced knit for high-end tees', defaultRoughness: 0.85, defaultNormal: 1.2 },
  { id: 'french_terry', name: 'French Terry', desc: 'Heavy diagonal loop knit for streetwear hoodies', defaultRoughness: 0.92, defaultNormal: 1.5 },
  { id: 'canvas', name: 'Duck Canvas', desc: 'Rugged cross-hatched basket weave for totes', defaultRoughness: 0.95, defaultNormal: 1.8 },
  { id: 'twill', name: 'Chino Twill', desc: '45-degree diagonal ribs for caps & jackets', defaultRoughness: 0.88, defaultNormal: 1.3 },
  { id: 'ceramic', name: 'Glazed Ceramic', desc: 'Ultra-smooth reflective glaze for drinkware', defaultRoughness: 0.18, defaultNormal: 0.2 },
];

const ENVIRONMENT_PRESETS = [
  { id: 'studio', label: 'Studio Softbox', desc: 'Clean commercial soft lighting' },
  { id: 'sunset', label: 'Sunset Warmth', desc: 'Golden hour dramatic warmth' },
  { id: 'cyber', label: 'Cyber Neon', desc: 'Cyan & magenta rim highlights' },
  { id: 'neutral', label: 'Neutral Daylight', desc: 'Crisp balanced catalog lighting' },
];

export const MaterialPanel: React.FC = () => {
  const [showAdvancedPhysics, setShowAdvancedPhysics] = React.useState(false);
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const garmentColor = useStudioStore((s) => s.garmentColor);
  const setGarmentColor = useStudioStore((s) => s.setGarmentColor);
  const materialSettings = useStudioStore((s) => s.materialSettings);
  const updateMaterialSettings = useStudioStore((s) => s.updateMaterialSettings);

  const handleFabricPresetChange = (preset: typeof FABRIC_PRESETS[0]) => {
    updateMaterialSettings({
      fabricType: preset.id,
      roughness: preset.defaultRoughness,
      normalScale: preset.defaultNormal,
      clearcoat: preset.id === 'ceramic' ? 0.85 : 0.0,
    });
  };

  return (
    <div className="w-80 h-full bg-studio-900 border-l border-studio-800 flex flex-col overflow-y-auto no-scrollbar select-none text-slate-200 shrink-0 z-20">
      {/* Panel Header */}
      <div className="p-4 border-b border-studio-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">PBR Shader Studio</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          PHYSICAL
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* 1. Base Garment / Surface Color */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Garment Base Color</span>
            </label>
            <span className="font-mono text-xs text-slate-400">{garmentColor.toUpperCase()}</span>
          </div>

          {/* Color Swatch Grid */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {activeProduct.colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => setGarmentColor(color)}
                className={`w-full aspect-square rounded-lg border transition-all ${
                  garmentColor.toLowerCase() === color.toLowerCase()
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                    : 'border-studio-700 hover:border-slate-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom Hex Picker Input */}
          <div className="flex items-center gap-2 bg-studio-850 p-2 rounded-xl border border-studio-750">
            <input
              type="color"
              value={garmentColor}
              onChange={(e) => setGarmentColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-studio-700"
            />
            <input
              type="text"
              value={garmentColor}
              onChange={(e) => setGarmentColor(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 uppercase w-full focus:outline-none"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* 2. Fabric Weave Presets */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fabric Weave Preset</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {FABRIC_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleFabricPresetChange(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  materialSettings.fabricType === preset.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                    : 'bg-studio-850 border-studio-750 text-slate-300 hover:border-studio-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{preset.name}</span>
                  {materialSettings.fabricType === preset.id && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Advanced PBR Sliders (Collapsible) */}
        <div className="pt-2 border-t border-studio-800">
          <button
            onClick={() => setShowAdvancedPhysics(!showAdvancedPhysics)}
            className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fine-Tune Shader Physics</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {showAdvancedPhysics ? '▲ Hide' : '▼ Adjust'}
            </span>
          </button>

          {showAdvancedPhysics && (
            <div className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Surface Roughness</span>
                <span className="font-mono text-xs text-indigo-400">
                  {materialSettings.roughness.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.01}
                value={materialSettings.roughness}
                onChange={(e) => updateMaterialSettings({ roughness: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Metallic / Specular</span>
                <span className="font-mono text-xs text-indigo-400">
                  {materialSettings.metalness.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.01}
                value={materialSettings.metalness}
                onChange={(e) => updateMaterialSettings({ metalness: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Weave Normal Depth</span>
                <span className="font-mono text-xs text-indigo-400">
                  {materialSettings.normalScale.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={3.0}
                step={0.1}
                value={materialSettings.normalScale}
                onChange={(e) => updateMaterialSettings({ normalScale: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Clearcoat Glaze</span>
                <span className="font-mono text-xs text-indigo-400">
                  {materialSettings.clearcoat.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.05}
                value={materialSettings.clearcoat}
                onChange={(e) => updateMaterialSettings({ clearcoat: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 4. Studio Environment Lighting */}
        <div className="pt-2 border-t border-studio-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Environment Lighting</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ENVIRONMENT_PRESETS.map((env) => (
              <button
                key={env.id}
                onClick={() =>
                  updateMaterialSettings({ environmentPreset: env.id as any })
                }
                className={`p-2 rounded-xl border text-left transition-all ${
                  materialSettings.environmentPreset === env.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-studio-850 border-studio-750 text-slate-300 hover:border-studio-600'
                }`}
              >
                <div className="text-xs font-medium">{env.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
