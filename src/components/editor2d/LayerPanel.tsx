import React from 'react';
import { fabric } from 'fabric';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import {
  Layers,
  Type,
  Square,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Group,
} from 'lucide-react';

interface LayerPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ isOpen, onToggle }) => {
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);

  if (!isOpen) return null;

  const objects = activeFabricCanvas ? activeFabricCanvas.getObjects().slice().reverse() : [];
  const activeObj = activeFabricCanvas?.getActiveObject();

  const syncAndCommit = () => {
    if (!activeFabricCanvas) return;
    activeFabricCanvas.renderAll();
    textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
    updateZoneCanvas(activeZoneId, JSON.stringify(activeFabricCanvas.toJSON()), true);
  };

  const handleSelect = (obj: fabric.Object) => {
    if (!activeFabricCanvas || !obj.selectable) return;
    activeFabricCanvas.setActiveObject(obj);
    activeFabricCanvas.renderAll();
  };

  const toggleVisibility = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    obj.visible = !obj.visible;
    syncAndCommit();
  };

  const toggleLock = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLocked = !obj.selectable;
    obj.selectable = isLocked;
    obj.evented = isLocked;
    obj.hasControls = isLocked;
    syncAndCommit();
  };

  const moveUp = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    obj.bringForward();
    syncAndCommit();
  };

  const moveDown = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    obj.sendBackwards();
    syncAndCommit();
  };

  const duplicateLayer = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFabricCanvas) return;
    obj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (obj.left || 0) + 15,
        top: (obj.top || 0) + 15,
      });
      activeFabricCanvas.add(cloned);
      activeFabricCanvas.setActiveObject(cloned);
      syncAndCommit();
    });
  };

  const deleteLayer = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFabricCanvas) return;
    activeFabricCanvas.remove(obj);
    activeFabricCanvas.discardActiveObject();
    syncAndCommit();
  };

  const getLayerIcon = (type?: string) => {
    switch (type) {
      case 'i-text':
      case 'text':
        return <Type className="w-3.5 h-3.5 text-indigo-400" />;
      case 'rect':
      case 'circle':
      case 'triangle':
      case 'path':
        return <Square className="w-3.5 h-3.5 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'group':
        return <Group className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getLayerName = (obj: fabric.Object, index: number) => {
    if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
      return (obj as fabric.IText).text?.slice(0, 16) || 'Text Layer';
    }
    if (obj.type === 'rect') return 'Rectangle';
    if (obj.type === 'circle') return 'Circle';
    if (obj.type === 'image') return 'Image Layer';
    if (obj.type === 'group') return `Group (${(obj as fabric.Group).size()} items)`;
    return `Layer ${objects.length - index}`;
  };

  return (
    <div className="w-64 bg-studio-900 border-r border-studio-800 flex flex-col h-full select-none text-slate-200 shrink-0 z-20">
      {/* Panel Header */}
      <div className="p-3 border-b border-studio-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Layers</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-studio-800 px-2 py-0.5 rounded-md">
          {objects.length} TOTAL
        </span>
      </div>

      {/* Layer Stack */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {objects.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No layers on this zone.
          </div>
        ) : (
          objects.map((obj, index) => {
            const isSelected = activeObj === obj;
            const isLocked = !obj.selectable;
            const isVisible = obj.visible !== false;

            return (
              <div
                key={index}
                onClick={() => handleSelect(obj)}
                className={`p-2 rounded-xl flex items-center justify-between group transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-white'
                    : 'bg-studio-850 border border-transparent hover:border-studio-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-1">
                  {getLayerIcon(obj.type)}
                  <span className="text-xs font-medium truncate max-w-[100px]">
                    {getLayerName(obj, index)}
                  </span>
                </div>

                {/* Layer Quick Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  {/* Visibility */}
                  <button
                    onClick={(e) => toggleVisibility(obj, e)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-studio-750 transition-colors"
                    title={isVisible ? 'Hide layer' : 'Show layer'}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                  </button>

                  {/* Lock */}
                  <button
                    onClick={(e) => toggleLock(obj, e)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-studio-750 transition-colors"
                    title={isLocked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>

                  {/* Move Up/Down */}
                  <button
                    onClick={(e) => moveUp(obj, e)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-studio-750 transition-colors"
                    title="Bring forward"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => moveDown(obj, e)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-studio-750 transition-colors"
                    title="Send backward"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => deleteLayer(obj, e)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
