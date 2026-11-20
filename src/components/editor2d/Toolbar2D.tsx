import React, { useRef } from 'react';
import { fabric } from 'fabric';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import { createCurvedTextGroup } from '../../services/curvedText';
import {
  Type,
  Square,
  Circle,
  Star,
  Triangle,
  Shield,
  Upload,
  Sparkles,
  Trash2,
  Minus,
  Stamp,
} from 'lucide-react';

export const Toolbar2D: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);

  const syncAndCommit = () => {
    if (!activeFabricCanvas) return;
    activeFabricCanvas.renderAll();
    textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
    updateZoneCanvas(activeZoneId, JSON.stringify(activeFabricCanvas.toJSON()), true);
  };

  // Add Text Handlers
  const handleAddText = (type: 'heading' | 'subheading' | 'body' | 'vintage') => {
    if (!activeFabricCanvas) return;

    let textStr = 'HEADLINE';
    let fontSize = 72;
    let fontFamily = 'Inter';
    let fontWeight: string | number = '800';
    let charSpacing = 100;
    let fill = '#ffffff';

    if (type === 'heading') {
      textStr = 'STUDIO';
      fontSize = 80;
      fontWeight = '800';
      fontFamily = 'Inter';
      charSpacing = 200;
    } else if (type === 'subheading') {
      textStr = 'CREATIVE COLLECTIVE';
      fontSize = 32;
      fontWeight = '600';
      fontFamily = 'Space Grotesk';
      charSpacing = 150;
    } else if (type === 'body') {
      textStr = 'SPEC: 100% COMBED COTTON // 2026';
      fontSize = 18;
      fontWeight = '500';
      fontFamily = 'JetBrains Mono';
      charSpacing = 250;
      fill = '#6366f1';
    } else if (type === 'vintage') {
      textStr = 'ORIGINALS';
      fontSize = 64;
      fontWeight = '700';
      fontFamily = 'Bebas Neue';
      charSpacing = 300;
    }

    const textObj = new fabric.IText(textStr, {
      left: activeFabricCanvas.getWidth() / 2,
      top: activeFabricCanvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      fontSize,
      fontFamily,
      fontWeight,
      fill,
      charSpacing,
      lineHeight: 1.1,
    });

    activeFabricCanvas.add(textObj);
    activeFabricCanvas.setActiveObject(textObj);
    syncAndCommit();
  };

  const handleAddCurvedText = () => {
    if (!activeFabricCanvas) return;
    const centerX = activeFabricCanvas.getWidth() / 2;
    const centerY = activeFabricCanvas.getHeight() / 2;

    const group = createCurvedTextGroup(
      {
        text: 'ATHLETICS // 1994',
        radius: 220,
        fontSize: 48,
        fontFamily: 'Bebas Neue',
        fill: '#f59e0b',
        letterSpacing: 1.1,
      },
      centerX,
      centerY
    );

    activeFabricCanvas.add(group);
    activeFabricCanvas.setActiveObject(group);
    syncAndCommit();
  };

  // Add Shape Handlers
  const handleAddShape = (shape: 'rect' | 'circle' | 'triangle' | 'star' | 'line' | 'shield') => {
    if (!activeFabricCanvas) return;

    const centerX = activeFabricCanvas.getWidth() / 2;
    const centerY = activeFabricCanvas.getHeight() / 2;

    let obj: fabric.Object | null = null;

    if (shape === 'rect') {
      obj = new fabric.Rect({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        width: 240,
        height: 240,
        fill: '#6366f1',
        rx: 12,
        ry: 12,
      });
    } else if (shape === 'circle') {
      obj = new fabric.Circle({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        radius: 120,
        fill: '#f59e0b',
      });
    } else if (shape === 'triangle') {
      obj = new fabric.Triangle({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        width: 220,
        height: 200,
        fill: '#ef4444',
      });
    } else if (shape === 'line') {
      obj = new fabric.Rect({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        width: 320,
        height: 4,
        fill: '#ffffff',
      });
    } else if (shape === 'star') {
      // 5-point star path
      const starPath =
        'M 0,-80 L 24,-24 L 84,-24 L 36,12 L 54,68 L 0,34 L -54,68 L -36,12 L -84,-24 L -24,-24 Z';
      obj = new fabric.Path(starPath, {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        fill: '#eab308',
      });
    } else if (shape === 'shield') {
      const shieldPath =
        'M 0,-90 Q 60,-90 90,-45 Q 90,45 0,110 Q -90,45 -90,-45 Q -60,-90 0,-90 Z';
      obj = new fabric.Path(shieldPath, {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        fill: '#3b82f6',
      });
    }

    if (obj) {
      activeFabricCanvas.add(obj);
      activeFabricCanvas.setActiveObject(obj);
      syncAndCommit();
    }
  };

  // Add Streetwear Graphic Preset
  const handleAddPresetGraphic = (type: 'stamp' | 'kanji' | 'barcode') => {
    if (!activeFabricCanvas) return;
    const centerX = activeFabricCanvas.getWidth() / 2;
    const centerY = activeFabricCanvas.getHeight() / 2;

    if (type === 'stamp') {
      const group = new fabric.Group(
        [
          new fabric.Circle({
            radius: 110,
            fill: 'transparent',
            stroke: '#ffffff',
            strokeWidth: 4,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Circle({
            radius: 96,
            fill: 'transparent',
            stroke: '#6366f1',
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Text('★ VERIFIED ★', {
            fontSize: 22,
            fontFamily: 'Inter',
            fontWeight: '700',
            fill: '#ffffff',
            originX: 'center',
            originY: 'center',
            charSpacing: 200,
          }),
        ],
        {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
        }
      );
      activeFabricCanvas.add(group);
      activeFabricCanvas.setActiveObject(group);
      syncAndCommit();
    } else if (type === 'kanji') {
      const kanji = new fabric.Text('創造', {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        fontSize: 130,
        fill: '#ef4444',
        fontWeight: '900',
      });
      activeFabricCanvas.add(kanji);
      activeFabricCanvas.setActiveObject(kanji);
      syncAndCommit();
    } else if (type === 'barcode') {
      const barcodeGroup = new fabric.Group(
        [
          new fabric.Rect({ left: -100, top: 0, width: 6, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: -88, top: 0, width: 14, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: -68, top: 0, width: 4, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: -56, top: 0, width: 18, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: -30, top: 0, width: 8, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: -16, top: 0, width: 12, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: 4, top: 0, width: 16, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: 26, top: 0, width: 6, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: 40, top: 0, width: 14, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: 62, top: 0, width: 8, height: 60, fill: '#fff' }),
          new fabric.Rect({ left: 78, top: 0, width: 12, height: 60, fill: '#fff' }),
          new fabric.Text('TC-3D-99824', {
            left: 0,
            top: 75,
            originX: 'center',
            fontSize: 16,
            fontFamily: 'JetBrains Mono',
            fill: '#fff',
            charSpacing: 250,
          }),
        ],
        {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
        }
      );
      activeFabricCanvas.add(barcodeGroup);
      activeFabricCanvas.setActiveObject(barcodeGroup);
      syncAndCommit();
    }
  };

  // Upload Custom Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      fabric.Image.fromURL(
        imgUrl,
        (img) => {
          if (!activeFabricCanvas) return;

          // Scale image sensibly so it fits inside 50% of the canvas
          const maxWidth = activeFabricCanvas.getWidth() * 0.65;
          const maxHeight = activeFabricCanvas.getHeight() * 0.65;
          let scale = 1;

          if (img.width && img.height) {
            scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          }

          img.set({
            left: activeFabricCanvas.getWidth() / 2,
            top: activeFabricCanvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
          });

          activeFabricCanvas.add(img);
          activeFabricCanvas.setActiveObject(img);
          syncAndCommit();
        },
        { crossOrigin: 'anonymous' }
      );
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearZone = () => {
    if (!activeFabricCanvas) return;
    if (confirm('Clear all artwork on this zone?')) {
      activeFabricCanvas.clear();
      textureBaker.clearZone(activeZoneId);
      updateZoneCanvas(activeZoneId, '', true);
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-studio-900 border-b border-studio-800 text-slate-300 overflow-x-auto no-scrollbar">
      {/* Typography Menu */}
      <div className="flex items-center gap-1 pr-2 border-r border-studio-800">
        <button
          onClick={() => handleAddText('heading')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-studio-800 hover:bg-studio-750 text-white rounded-lg text-xs font-semibold transition-colors"
          title="Add Large Headline"
        >
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Headline</span>
        </button>
        <button
          onClick={() => handleAddText('subheading')}
          className="px-2.5 py-1.5 bg-studio-800 hover:bg-studio-750 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          title="Add Subheading"
        >
          Subheading
        </button>
        <button
          onClick={() => handleAddText('body')}
          className="px-2.5 py-1.5 bg-studio-800 hover:bg-studio-750 text-indigo-300 rounded-lg text-xs font-mono transition-colors"
          title="Add Monospace Spec Text"
        >
          Spec/Mono
        </button>
        <button
          onClick={() => handleAddText('vintage')}
          className="px-2.5 py-1.5 bg-studio-800 hover:bg-studio-750 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors"
          title="Add Bold Condensed Text"
        >
          Vintage
        </button>
        <button
          onClick={handleAddCurvedText}
          className="px-2.5 py-1.5 bg-studio-800 hover:bg-studio-750 text-purple-300 rounded-lg text-xs font-bold uppercase transition-colors"
          title="Add Circular / Arched Text Banner"
        >
          Arched
        </button>
      </div>

      {/* Shapes Menu */}
      <div className="flex items-center gap-1 px-2 border-r border-studio-800">
        <button
          onClick={() => handleAddShape('rect')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Add Rounded Rectangle"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddShape('circle')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Add Circle"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddShape('star')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
          title="Add 5-Point Star"
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddShape('triangle')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Add Triangle"
        >
          <Triangle className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddShape('shield')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
          title="Add Crest Shield"
        >
          <Shield className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddShape('line')}
          className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Add Horizontal Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Graphics / Badges Presets */}
      <div className="flex items-center gap-1 px-2 border-r border-studio-800">
        <button
          onClick={() => handleAddPresetGraphic('stamp')}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-studio-800 hover:bg-studio-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          title="Add Circular Emblem Stamp"
        >
          <Stamp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stamp</span>
        </button>
        <button
          onClick={() => handleAddPresetGraphic('kanji')}
          className="px-2 py-1.5 bg-studio-800 hover:bg-studio-750 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-bold transition-colors"
          title="Add Kanji Creation Stamp"
        >
          創造
        </button>
        <button
          onClick={() => handleAddPresetGraphic('barcode')}
          className="px-2 py-1.5 bg-studio-800 hover:bg-studio-750 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
          title="Add Streetwear Barcode Spec"
        >
          Barcode
        </button>
      </div>

      {/* Image Upload */}
      <div className="flex items-center gap-1 pl-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          title="Upload Transparent PNG / Vector Artwork"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={handleClearZone}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-studio-800 rounded-lg ml-auto transition-colors"
          title="Clear Zone Artwork"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
