import React, { useState } from 'react';
import { fabric } from 'fabric';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  CaseUpper,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  FlipHorizontal,
  FlipVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
  Sliders,
  Sparkles,
} from 'lucide-react';

const FONT_OPTIONS = [
  { label: 'Inter (Clean Sans)', value: 'Inter' },
  { label: 'JetBrains Mono (Technical)', value: 'JetBrains Mono' },
  { label: 'Space Grotesk (Modern)', value: 'Space Grotesk' },
  { label: 'Bebas Neue (Bold Display)', value: 'Bebas Neue' },
  { label: 'Playfair Display (Editorial)', value: 'Playfair Display' },
  { label: 'Impact (Heavy Poster)', value: 'Impact' },
  { label: 'Arial (Neutral)', value: 'Arial' },
];

const COLOR_SWATCHES = [
  '#ffffff',
  '#090a0f',
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
];

export const ObjectInspector: React.FC = () => {
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const activeObjectProps = useStudioStore((s) => s.activeObjectProps);
  const setActiveObjectProps = useStudioStore((s) => s.setActiveObjectProps);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);

  const [showAdvancedText, setShowAdvancedText] = useState(false);

  if (!activeFabricCanvas || !activeObjectProps) {
    return null;
  }

  const activeObj = activeFabricCanvas.getActiveObject();
  if (!activeObj) return null;

  const isText = activeObj instanceof fabric.IText || activeObj instanceof fabric.Text;
  const textObj = isText ? (activeObj as fabric.IText) : null;

  const syncAndCommit = () => {
    activeObj.setCoords();
    activeFabricCanvas.renderAll();
    textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
    updateZoneCanvas(activeZoneId, JSON.stringify(activeFabricCanvas.toJSON()), true);
  };

  const handleColorChange = (newColor: string) => {
    activeObj.set('fill', newColor);
    setActiveObjectProps({ ...activeObjectProps, fill: newColor });
    syncAndCommit();
  };

  const handleOpacityChange = (val: number) => {
    activeObj.set('opacity', val);
    setActiveObjectProps({ ...activeObjectProps, opacity: val });
    syncAndCommit();
  };

  const handleFontSizeChange = (size: number) => {
    if (!textObj) return;
    textObj.set('fontSize', size);
    setActiveObjectProps({ ...activeObjectProps, fontSize: size });
    syncAndCommit();
  };

  const handleFontFamilyChange = (font: string) => {
    if (!textObj) return;
    textObj.set('fontFamily', font);
    setActiveObjectProps({ ...activeObjectProps, fontFamily: font });
    syncAndCommit();
  };

  const toggleBold = () => {
    if (!textObj) return;
    const isBold = textObj.fontWeight === 'bold' || textObj.fontWeight === '800';
    const nextWeight = isBold ? 'normal' : '800';
    textObj.set('fontWeight', nextWeight);
    setActiveObjectProps({ ...activeObjectProps, fontWeight: nextWeight });
    syncAndCommit();
  };

  const toggleItalic = () => {
    if (!textObj) return;
    const isItalic = textObj.fontStyle === 'italic';
    const nextStyle = isItalic ? 'normal' : 'italic';
    textObj.set('fontStyle', nextStyle);
    setActiveObjectProps({ ...activeObjectProps, fontStyle: nextStyle });
    syncAndCommit();
  };

  const toggleUnderline = () => {
    if (!textObj) return;
    textObj.set('underline', !textObj.underline);
    syncAndCommit();
  };

  const toggleLinethrough = () => {
    if (!textObj) return;
    textObj.set('linethrough', !textObj.linethrough);
    syncAndCommit();
  };

  const toggleUppercase = () => {
    if (!textObj || !textObj.text) return;
    const isAllUpper = textObj.text === textObj.text.toUpperCase();
    textObj.set('text', isAllUpper ? textObj.text.toLowerCase() : textObj.text.toUpperCase());
    syncAndCommit();
  };

  const handleCharSpacingChange = (val: number) => {
    if (!textObj) return;
    textObj.set('charSpacing', val);
    setActiveObjectProps({ ...activeObjectProps, charSpacing: val });
    syncAndCommit();
  };

  const handleLineHeightChange = (val: number) => {
    if (!textObj) return;
    textObj.set('lineHeight', val);
    syncAndCommit();
  };

  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    if (!textObj) return;
    textObj.set('textAlign', align);
    setActiveObjectProps({ ...activeObjectProps, textAlign: align });
    syncAndCommit();
  };

  const handleDuplicate = () => {
    activeObj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (activeObj.left || 0) + 20,
        top: (activeObj.top || 0) + 20,
      });
      activeFabricCanvas.add(cloned);
      activeFabricCanvas.setActiveObject(cloned);
      syncAndCommit();
    });
  };

  const handleDelete = () => {
    activeFabricCanvas.remove(activeObj);
    activeFabricCanvas.discardActiveObject();
    setActiveObjectProps(null);
    syncAndCommit();
  };

  const handleBringToFront = () => {
    activeObj.bringToFront();
    syncAndCommit();
  };

  const handleSendToBack = () => {
    activeObj.sendToBack();
    syncAndCommit();
  };

  const centerHorizontally = () => {
    activeObj.viewportCenterH();
    syncAndCommit();
  };

  const centerVertically = () => {
    activeObj.viewportCenterV();
    syncAndCommit();
  };

  const toggleFlipX = () => {
    activeObj.set('flipX', !activeObj.flipX);
    syncAndCommit();
  };

  const toggleFlipY = () => {
    activeObj.set('flipY', !activeObj.flipY);
    syncAndCommit();
  };

  return (
    <div className="flex flex-col bg-studio-850/95 border-b border-studio-750 text-slate-200 text-xs shadow-md">
      {/* Primary Contextual Row */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-2">
        {/* Typography Controls */}
        {isText && (
          <div className="flex items-center gap-2 pr-3 border-r border-studio-700">
            <select
              value={activeObjectProps.fontFamily || 'Inter'}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="bg-studio-800 text-slate-200 px-2.5 py-1 rounded-lg border border-studio-700 text-xs focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px]">Size</span>
              <input
                type="number"
                min={8}
                max={280}
                value={activeObjectProps.fontSize || 40}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 20)}
                className="w-14 bg-studio-800 text-white px-2 py-1 rounded-lg border border-studio-700 font-mono text-xs text-center"
              />
            </div>

            {/* Bold, Italic, Underline, Strikethrough, Uppercase */}
            <div className="flex items-center gap-0.5 bg-studio-800 rounded-lg p-0.5 border border-studio-700">
              <button
                onClick={toggleBold}
                className={`p-1 rounded transition-colors ${
                  activeObjectProps.fontWeight === 'bold' || activeObjectProps.fontWeight === '800'
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-studio-750 text-slate-400 hover:text-white'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleItalic}
                className={`p-1 rounded transition-colors ${
                  activeObjectProps.fontStyle === 'italic'
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-studio-750 text-slate-400 hover:text-white'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleUnderline}
                className={`p-1 rounded transition-colors ${
                  textObj?.underline
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-studio-750 text-slate-400 hover:text-white'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleLinethrough}
                className={`p-1 rounded transition-colors ${
                  textObj?.linethrough
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-studio-750 text-slate-400 hover:text-white'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleUppercase}
                className="p-1 rounded hover:bg-studio-750 text-slate-400 hover:text-white transition-colors"
                title="Toggle Uppercase"
              >
                <CaseUpper className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center gap-0.5 bg-studio-800 rounded-lg p-0.5 border border-studio-700">
              <button
                onClick={() => setTextAlign('left')}
                className={`p-1 rounded ${activeObjectProps.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Align Left"
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-1 rounded ${activeObjectProps.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Align Center"
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-1 rounded ${activeObjectProps.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Align Right"
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>

            {/* Toggle Advanced Typography Sliders */}
            <button
              onClick={() => setShowAdvancedText(!showAdvancedText)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                showAdvancedText
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-studio-800 border-studio-700 text-slate-400 hover:text-white'
              }`}
              title="Advanced Typography Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Color Swatches & Picker */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-studio-700">
          <input
            type="color"
            value={typeof activeObjectProps.fill === 'string' ? activeObjectProps.fill : '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-6 h-6 rounded-md cursor-pointer border border-studio-700 bg-transparent"
            title="Custom Color"
          />
          <div className="flex items-center gap-1">
            {COLOR_SWATCHES.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-4 h-4 rounded-full border border-slate-600 transition-transform hover:scale-125"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 pr-3 border-r border-studio-700">
          <span className="text-slate-400 font-mono text-[11px]">Opacity</span>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={activeObjectProps.opacity ?? 1}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-16 accent-indigo-500 cursor-pointer"
          />
          <span className="font-mono text-[11px] text-slate-400 w-8">
            {Math.round((activeObjectProps.opacity ?? 1) * 100)}%
          </span>
        </div>

        {/* Alignment Actions */}
        <div className="flex items-center gap-1 pr-3 border-r border-studio-700">
          <button
            onClick={centerHorizontally}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Center Horizontally"
          >
            <AlignCenterHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={centerVertically}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Center Vertically"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFlipX}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFlipY}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Flip Vertical"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layer Hierarchy & Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleBringToFront}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Bring to Front"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSendToBack}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Send to Back"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-studio-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
            title="Duplicate Object (Cmd + D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
            title="Delete Object (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Advanced Secondary Typography Bar */}
      {isText && showAdvancedText && (
        <div className="flex items-center gap-6 px-4 py-2 bg-studio-900 border-t border-studio-800 font-mono text-[11px] text-slate-300">
          {/* Letter Spacing */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Kerning / Spacing</span>
            <input
              type="range"
              min={-50}
              max={600}
              step={10}
              value={activeObjectProps.charSpacing || 0}
              onChange={(e) => handleCharSpacingChange(parseInt(e.target.value) || 0)}
              className="w-24 accent-indigo-500"
            />
            <span className="w-10 text-indigo-400">{activeObjectProps.charSpacing || 0}</span>
          </div>

          {/* Line Height */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Line Height</span>
            <input
              type="range"
              min={0.8}
              max={2.5}
              step={0.05}
              value={textObj?.lineHeight || 1.1}
              onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className="w-10 text-indigo-400">{(textObj?.lineHeight || 1.1).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
