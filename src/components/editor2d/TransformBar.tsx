import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  Layers,
  Group,
  Ungroup,
  Sliders,
  Move,
  RotateCw,
} from 'lucide-react';

export const TransformBar: React.FC = () => {
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const activeObjectProps = useStudioStore((s) => s.activeObjectProps);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);

  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [w, setW] = useState<number>(0);
  const [h, setH] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(100);
  const [isMulti, setIsMulti] = useState<boolean>(false);
  const [isGroup, setIsGroup] = useState<boolean>(false);

  useEffect(() => {
    if (!activeFabricCanvas) return;
    const activeObj = activeFabricCanvas.getActiveObject();
    if (!activeObj) return;

    const currentW = Math.round((activeObj.width || 0) * (activeObj.scaleX || 1));
    const currentH = Math.round((activeObj.height || 0) * (activeObj.scaleY || 1));

    setX(Math.round(activeObj.left || 0));
    setY(Math.round(activeObj.top || 0));
    setW(currentW);
    setH(currentH);
    setAngle(Math.round(activeObj.angle || 0));
    setOpacity(Math.round((activeObj.opacity ?? 1) * 100));

    setIsMulti(activeObj.type === 'activeSelection');
    setIsGroup(activeObj.type === 'group');
  }, [activeObjectProps, activeFabricCanvas]);

  if (!activeFabricCanvas || !activeFabricCanvas.getActiveObject()) {
    return null;
  }

  const activeObj = activeFabricCanvas.getActiveObject();
  if (!activeObj) return null;

  const syncAndCommit = () => {
    activeObj.setCoords();
    activeFabricCanvas.renderAll();
    textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
    updateZoneCanvas(activeZoneId, JSON.stringify(activeFabricCanvas.toJSON()), true);
  };

  const handleXChange = (val: number) => {
    setX(val);
    activeObj.set('left', val);
    syncAndCommit();
  };

  const handleYChange = (val: number) => {
    setY(val);
    activeObj.set('top', val);
    syncAndCommit();
  };

  const handleWChange = (val: number) => {
    if (val <= 0 || !activeObj.width) return;
    setW(val);
    activeObj.set('scaleX', val / activeObj.width);
    syncAndCommit();
  };

  const handleHChange = (val: number) => {
    if (val <= 0 || !activeObj.height) return;
    setH(val);
    activeObj.set('scaleY', val / activeObj.height);
    syncAndCommit();
  };

  const handleAngleChange = (deg: number) => {
    setAngle(deg);
    activeObj.set('angle', deg);
    syncAndCommit();
  };

  const handleOpacityChange = (pct: number) => {
    setOpacity(pct);
    activeObj.set('opacity', pct / 100);
    syncAndCommit();
  };

  // Alignment to Canvas
  const alignLeft = () => {
    activeObj.set('left', 24);
    syncAndCommit();
    setX(24);
  };

  const alignCenterH = () => {
    activeObj.viewportCenterH();
    syncAndCommit();
    setX(Math.round(activeObj.left || 0));
  };

  const alignRight = () => {
    const canvasW = activeFabricCanvas.getWidth();
    const objW = (activeObj.width || 0) * (activeObj.scaleX || 1);
    const newX = canvasW - objW - 24;
    activeObj.set('left', newX);
    syncAndCommit();
    setX(Math.round(newX));
  };

  const alignTop = () => {
    activeObj.set('top', 24);
    syncAndCommit();
    setY(24);
  };

  const alignCenterV = () => {
    activeObj.viewportCenterV();
    syncAndCommit();
    setY(Math.round(activeObj.top || 0));
  };

  const alignBottom = () => {
    const canvasH = activeFabricCanvas.getHeight();
    const objH = (activeObj.height || 0) * (activeObj.scaleY || 1);
    const newY = canvasH - objH - 24;
    activeObj.set('top', newY);
    syncAndCommit();
    setY(Math.round(newY));
  };

  // Group / Ungroup
  const handleGroup = () => {
    if (!activeFabricCanvas) return;
    const active = activeFabricCanvas.getActiveObject();
    if (active && active.type === 'activeSelection') {
      const activeSelection = active as fabric.ActiveSelection;
      const group = activeSelection.toGroup();
      activeFabricCanvas.setActiveObject(group);
      syncAndCommit();
      setIsGroup(true);
      setIsMulti(false);
    }
  };

  const handleUngroup = () => {
    if (!activeFabricCanvas) return;
    const active = activeFabricCanvas.getActiveObject();
    if (active && active.type === 'group') {
      const group = active as fabric.Group;
      const selection = group.toActiveSelection();
      activeFabricCanvas.setActiveObject(selection);
      syncAndCommit();
      setIsGroup(false);
      setIsMulti(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 bg-studio-900/90 border-b border-studio-800 text-slate-300 text-[11px] font-mono select-none">
      {/* Position X / Y */}
      <div className="flex items-center gap-1 pr-2 border-r border-studio-800">
        <span className="text-slate-500">X</span>
        <input
          type="number"
          value={x}
          onChange={(e) => handleXChange(parseInt(e.target.value) || 0)}
          className="w-14 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
        <span className="text-slate-500 ml-1">Y</span>
        <input
          type="number"
          value={y}
          onChange={(e) => handleYChange(parseInt(e.target.value) || 0)}
          className="w-14 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
      </div>

      {/* Dimensions W / H */}
      <div className="flex items-center gap-1 pr-2 border-r border-studio-800">
        <span className="text-slate-500">W</span>
        <input
          type="number"
          min={1}
          value={w}
          onChange={(e) => handleWChange(parseInt(e.target.value) || 1)}
          className="w-14 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
        <span className="text-slate-500 ml-1">H</span>
        <input
          type="number"
          min={1}
          value={h}
          onChange={(e) => handleHChange(parseInt(e.target.value) || 1)}
          className="w-14 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
      </div>

      {/* Rotation Angle & Opacity */}
      <div className="flex items-center gap-1 pr-2 border-r border-studio-800">
        <span className="text-slate-500">∠</span>
        <input
          type="number"
          value={angle}
          onChange={(e) => handleAngleChange(parseInt(e.target.value) || 0)}
          className="w-12 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
        <span className="text-slate-400">°</span>

        <span className="text-slate-500 ml-2">α</span>
        <input
          type="number"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value) || 0)}
          className="w-12 bg-studio-800 text-white px-1.5 py-0.5 rounded border border-studio-700 text-center font-mono"
        />
        <span className="text-slate-400">%</span>
      </div>

      {/* Alignment Presets */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-studio-800">
        <button
          onClick={alignLeft}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={alignCenterH}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Center Horizontally"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={alignRight}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={alignTop}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Align Top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={alignCenterV}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Center Vertically"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={alignBottom}
          className="p-1 hover:bg-studio-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Align Bottom"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group / Ungroup Actions */}
      <div className="flex items-center gap-1">
        {isMulti && (
          <button
            onClick={handleGroup}
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-sans font-semibold transition-colors"
            title="Group Objects (Cmd + G)"
          >
            <Group className="w-3 h-3" />
            <span>Group</span>
          </button>
        )}
        {isGroup && (
          <button
            onClick={handleUngroup}
            className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-sans font-semibold transition-colors"
            title="Ungroup (Cmd + Shift + G)"
          >
            <Ungroup className="w-3 h-3" />
            <span>Ungroup</span>
          </button>
        )}
      </div>
    </div>
  );
};
