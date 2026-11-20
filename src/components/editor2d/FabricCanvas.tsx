import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStudioStore } from '../../store/useStudioStore';
import { textureBaker } from '../../services/textureBaker';
import { ZoomIn, ZoomOut, RotateCcw, Magnet, Grid } from 'lucide-react';

export const FabricCanvas: React.FC = () => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const activeProduct = useStudioStore((s) => s.activeProduct);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const canvases = useStudioStore((s) => s.canvases);
  const garmentColor = useStudioStore((s) => s.garmentColor);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);
  const setActiveObjectProps = useStudioStore((s) => s.setActiveObjectProps);
  const setFabricCanvas = useStudioStore((s) => s.setFabricCanvas);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(true);
  const [activeSnapGuideH, setActiveSnapGuideH] = useState<number | null>(null);
  const [activeSnapGuideV, setActiveSnapGuideV] = useState<number | null>(null);

  const activeZone = activeProduct.zones.find((z) => z.id === activeZoneId) || activeProduct.zones[0];
  const targetWidth = activeZone.canvasWidth;
  const targetHeight = activeZone.canvasHeight;

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: targetWidth,
      height: targetHeight,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selectionColor: 'rgba(99, 102, 241, 0.2)',
      selectionBorderColor: '#6366f1',
      selectionLineWidth: 1.5,
    });

    fabricRef.current = canvas;
    setFabricCanvas(canvas);

    // Style standard control handles for a sleek modern look
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = '#ffffff';
    fabric.Object.prototype.cornerStrokeColor = '#6366f1';
    fabric.Object.prototype.borderColor = '#6366f1';
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.borderScaleFactor = 1.5;

    // Load saved zone JSON if available
    const zoneJson = canvases[activeZoneId];
    if (zoneJson) {
      canvas.loadFromJSON(zoneJson, () => {
        canvas.renderAll();
        textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
      });
    } else {
      canvas.clear();
      textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
    }

    const syncTo3D = () => {
      textureBaker.updateFromLiveCanvas(activeZoneId, canvas, false);
    };

    const commitChange = () => {
      textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
      const serialized = JSON.stringify(canvas.toJSON());
      updateZoneCanvas(activeZoneId, serialized, true);
    };

    const updateSelectionProps = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj) {
        setActiveObjectProps(null);
        return;
      }

      const isText = activeObj instanceof fabric.IText || activeObj instanceof fabric.Text;
      const textObj = activeObj as fabric.IText;

      setActiveObjectProps({
        type: activeObj.type || 'object',
        fill: (activeObj.fill as string) || '#ffffff',
        stroke: (activeObj.stroke as string) || '',
        strokeWidth: activeObj.strokeWidth || 0,
        opacity: activeObj.opacity !== undefined ? activeObj.opacity : 1,
        angle: Math.round(activeObj.angle || 0),
        scaleX: activeObj.scaleX || 1,
        scaleY: activeObj.scaleY || 1,
        text: isText ? textObj.text : undefined,
        fontSize: isText ? textObj.fontSize : undefined,
        fontFamily: isText ? textObj.fontFamily : undefined,
        fontWeight: isText ? textObj.fontWeight : undefined,
        fontStyle: isText ? textObj.fontStyle : undefined,
        textAlign: isText ? textObj.textAlign : undefined,
        charSpacing: isText ? textObj.charSpacing : undefined,
      });
    };

    // Magnetic Snapping logic
    canvas.on('object:moving', (e) => {
      syncTo3D();
      if (!isSnappingEnabled || !e.target) return;

      const obj = e.target;
      const snapThreshold = 10;
      const centerX = targetWidth / 2;
      const centerY = targetHeight / 2;

      const objCenter = obj.getCenterPoint();

      let snappedV = null;
      let snappedH = null;

      // Snap to Center X
      if (Math.abs(objCenter.x - centerX) < snapThreshold) {
        obj.setPositionByOrigin(new fabric.Point(centerX, objCenter.y), 'center', 'center');
        snappedV = centerX;
      }

      // Snap to Center Y
      if (Math.abs(objCenter.y - centerY) < snapThreshold) {
        obj.setPositionByOrigin(new fabric.Point(obj.getCenterPoint().x, centerY), 'center', 'center');
        snappedH = centerY;
      }

      setActiveSnapGuideV(snappedV);
      setActiveSnapGuideH(snappedH);
    });

    canvas.on('object:modified', () => {
      setActiveSnapGuideV(null);
      setActiveSnapGuideH(null);
      commitChange();
    });

    canvas.on('object:scaling', syncTo3D);
    canvas.on('object:rotating', syncTo3D);
    canvas.on('text:changed', () => {
      syncTo3D();
      commitChange();
    });

    canvas.on('object:added', syncTo3D);
    canvas.on('object:removed', commitChange);

    canvas.on('selection:created', updateSelectionProps);
    canvas.on('selection:updated', updateSelectionProps);
    canvas.on('selection:cleared', () => {
      setActiveObjectProps(null);
      setActiveSnapGuideV(null);
      setActiveSnapGuideH(null);
    });

    const resizeHandler = () => {
      if (!containerRef.current) return;
      const cWidth = containerRef.current.clientWidth - 56;
      const cHeight = containerRef.current.clientHeight - 56;
      const scale = Math.min(cWidth / targetWidth, cHeight / targetHeight, 0.72);
      setZoomLevel(Math.max(0.2, scale));
    };

    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      canvas.dispose();
      fabricRef.current = null;
      setFabricCanvas(null);
    };
  }, [activeZoneId, activeProduct.id, targetWidth, targetHeight, isSnappingEnabled]);

  // Global key bindings for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const activeObj = canvas.getActiveObject();
      const isEditingText = activeObj instanceof fabric.IText && (activeObj as fabric.IText).isEditing;

      if (isEditingText) return;

      // Select All (Cmd+A / Ctrl+A)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
        return;
      }

      // Group (Cmd+G / Ctrl+G)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const active = canvas.getActiveObject();
        if (active && active.type === 'activeSelection') {
          const group = (active as fabric.ActiveSelection).toGroup();
          canvas.setActiveObject(group);
          canvas.requestRenderAll();
          textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
          updateZoneCanvas(activeZoneId, JSON.stringify(canvas.toJSON()), true);
        }
        return;
      }

      // Ungroup (Cmd+Shift+G / Ctrl+Shift+G)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const active = canvas.getActiveObject();
        if (active && active.type === 'group') {
          const sel = (active as fabric.Group).toActiveSelection();
          canvas.setActiveObject(sel);
          canvas.requestRenderAll();
          textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
          updateZoneCanvas(activeZoneId, JSON.stringify(canvas.toJSON()), true);
        }
        return;
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate (Cmd+D / Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (activeObj.left || 0) + 20,
              top: (activeObj.top || 0) + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
            updateZoneCanvas(activeZoneId, JSON.stringify(canvas.toJSON()), true);
          });
        }
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeObj) {
          e.preventDefault();
          if (activeObj.type === 'activeSelection') {
            (activeObj as fabric.ActiveSelection).forEachObject((obj) => {
              canvas.remove(obj);
            });
          } else {
            canvas.remove(activeObj);
          }
          canvas.discardActiveObject();
          canvas.renderAll();
          textureBaker.updateFromLiveCanvas(activeZoneId, canvas, true);
          updateZoneCanvas(activeZoneId, JSON.stringify(canvas.toJSON()), true);
        }
      }

      // Nudge with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && activeObj) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowUp') activeObj.top = (activeObj.top || 0) - step;
        if (e.key === 'ArrowDown') activeObj.top = (activeObj.top || 0) + step;
        if (e.key === 'ArrowLeft') activeObj.left = (activeObj.left || 0) - step;
        if (e.key === 'ArrowRight') activeObj.left = (activeObj.left || 0) + step;
        activeObj.setCoords();
        canvas.renderAll();
        textureBaker.updateFromLiveCanvas(activeZoneId, canvas, false);
        updateZoneCanvas(activeZoneId, JSON.stringify(canvas.toJSON()), true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeZoneId, undo, redo, updateZoneCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-studio-900 overflow-hidden select-none"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #6366f1 1px, transparent 1px), radial-gradient(circle, #475569 1px, transparent 1px)',
          backgroundSize: '24px 24px, 120px 120px',
        }}
      />

      {/* Print Zone Spec Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-studio-850/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-studio-750 text-xs font-mono text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="font-semibold text-white">{activeZone.name}</span>
        <span className="text-slate-500">|</span>
        <span>
          {activeZone.physicalWidthCm} × {activeZone.physicalHeightCm} cm ({targetWidth} × {targetHeight} px)
        </span>
      </div>

      {/* Snapping Toggle & Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-studio-850/90 backdrop-blur-md p-1 rounded-xl border border-studio-750 shadow-lg">
        <button
          onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
          className={`p-1.5 rounded-lg transition-colors ${
            isSnappingEnabled
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Magnetic Snapping (Center & Edges)"
        >
          <Magnet className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-studio-700" />

        <button
          onClick={() => setZoomLevel((z) => Math.max(0.2, z - 0.1))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-studio-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs font-mono text-slate-300 min-w-[50px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-studio-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (!containerRef.current) return;
            const cWidth = containerRef.current.clientWidth - 56;
            const cHeight = containerRef.current.clientHeight - 56;
            setZoomLevel(Math.min(cWidth / targetWidth, cHeight / targetHeight, 0.72));
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-studio-800 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centered Scalable Artboard Container */}
      <div
        className="transition-transform duration-75 ease-out shadow-2xl relative"
        style={{
          width: targetWidth,
          height: targetHeight,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Simulated Garment Background under print zone */}
        <div
          className="absolute inset-0 rounded-sm border border-dashed border-indigo-400/40 pointer-events-none transition-colors duration-300"
          style={{
            backgroundColor: garmentColor,
            opacity: 0.95,
          }}
        />

        {/* Dynamic Magnetic Guides */}
        {activeSnapGuideH !== null && (
          <div
            className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-sm shadow-indigo-500/80 z-20 pointer-events-none"
            style={{ top: activeSnapGuideH }}
          />
        )}
        {activeSnapGuideV !== null && (
          <div
            className="absolute inset-y-0 w-0.5 bg-indigo-500 shadow-sm shadow-indigo-500/80 z-20 pointer-events-none"
            style={{ left: activeSnapGuideV }}
          />
        )}

        {/* Center Crosshair Alignment Guides */}
        <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-indigo-500/25 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-indigo-500/25 pointer-events-none" />

        {/* Safe Print Zone Inset Margin */}
        <div className="absolute inset-6 border border-emerald-500/20 pointer-events-none rounded-sm">
          <span className="absolute top-1 left-2 text-[10px] font-mono text-emerald-500/50 uppercase">
            Print Safety Boundary
          </span>
        </div>

        {/* Interactive Fabric Canvas */}
        <div className="relative z-10 w-full h-full">
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
};
