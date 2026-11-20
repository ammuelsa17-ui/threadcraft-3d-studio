import { create } from 'zustand';
import { fabric } from 'fabric';
import { ProductConfig, ProductId, MaterialSettings, PRODUCT_CATALOG } from '../types/product';
import { ProjectRecord, HistoryEntry } from '../types/project';
import { db } from '../services/db';
import { textureBaker } from '../services/textureBaker';

interface ActiveObjectProps {
  type: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
  charSpacing?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
}

interface StudioState {
  currentProjectId: string;
  projectName: string;
  activeProduct: ProductConfig;
  activeZoneId: string;
  garmentColor: string;
  materialSettings: MaterialSettings;
  canvases: Record<string, string>;
  activeFabricCanvas: fabric.Canvas | null;

  // Selection
  activeObjectProps: ActiveObjectProps | null;

  // View & Camera
  viewMode: 'split' | '3d' | '2d';
  isWireframe: boolean;
  isAutoRotate: boolean;
  is3DOrbitLocked: boolean;

  // Undo / Redo
  historyPast: HistoryEntry[];
  historyFuture: HistoryEntry[];

  // Persistence
  isSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
  setProjectName: (name: string) => void;
  setProduct: (productId: ProductId | string) => void;
  setActiveZone: (zoneId: string) => void;
  setGarmentColor: (color: string) => void;
  updateMaterialSettings: (partial: Partial<MaterialSettings>) => void;
  updateZoneCanvas: (zoneId: string, jsonString: string, addToHistory?: boolean) => void;
  setActiveObjectProps: (props: ActiveObjectProps | null) => void;
  setViewMode: (mode: 'split' | '3d' | '2d') => void;
  toggleWireframe: () => void;
  toggleAutoRotate: () => void;
  setIs3DOrbitLocked: (locked: boolean) => void;
  undo: () => void;
  redo: () => void;
  saveCurrentProject: () => Promise<void>;
  loadProject: (project: ProjectRecord) => void;
  createNewProject: (productId?: ProductId) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  currentProjectId: 'project-' + Date.now(),
  projectName: 'Untitled Project',
  activeProduct: PRODUCT_CATALOG.tshirt,
  activeZoneId: 'front',
  garmentColor: PRODUCT_CATALOG.tshirt.defaultColor,
  materialSettings: PRODUCT_CATALOG.tshirt.defaultMaterial,
  canvases: {},
  activeFabricCanvas: null,
  activeObjectProps: null,

  viewMode: 'split',
  isWireframe: false,
  isAutoRotate: false,
  is3DOrbitLocked: false,

  historyPast: [],
  historyFuture: [],

  isSaving: false,
  lastSavedAt: null,

  setFabricCanvas: (canvas) => set({ activeFabricCanvas: canvas }),

  setProjectName: (name) => {
    set({ projectName: name });
    get().saveCurrentProject();
  },

  setProduct: async (productId) => {
    let nextProduct: ProductConfig | undefined = PRODUCT_CATALOG[productId as ProductId];
    if (!nextProduct) {
      const custom = await db.customProducts.get(productId);
      if (custom) nextProduct = custom;
    }
    if (!nextProduct) nextProduct = PRODUCT_CATALOG.tshirt;

    const defaultZone = nextProduct.zones[0]?.id || 'front';

    set({
      activeProduct: nextProduct,
      activeZoneId: defaultZone,
      garmentColor: nextProduct.defaultColor,
      materialSettings: nextProduct.defaultMaterial,
    });

    // Rebake textures for this product
    const { canvases } = get();
    for (const [zId, json] of Object.entries(canvases)) {
      if (json) {
        textureBaker.bakeFromSerializedJson(zId, json);
      }
    }
  },

  setActiveZone: (zoneId) => {
    const { activeFabricCanvas, activeZoneId, canvases } = get();
    // Before switching, serialize current zone
    if (activeFabricCanvas) {
      const currentJson = JSON.stringify(activeFabricCanvas.toJSON());
      canvases[activeZoneId] = currentJson;
      textureBaker.bakeFromSerializedJson(activeZoneId, currentJson);
    }
    set({ activeZoneId: zoneId, canvases: { ...canvases }, activeObjectProps: null });
  },

  setGarmentColor: (color) => {
    set({ garmentColor: color });
    get().saveCurrentProject();
  },

  updateMaterialSettings: (partial) => {
    set((state) => ({
      materialSettings: { ...state.materialSettings, ...partial },
    }));
    get().saveCurrentProject();
  },

  updateZoneCanvas: (zoneId, jsonString, addToHistory = true) => {
    const { canvases, historyPast, garmentColor, materialSettings } = get();
    const prevJson = canvases[zoneId] || '';

    if (addToHistory && prevJson !== jsonString) {
      const historyEntry: HistoryEntry = {
        zoneId,
        canvasJson: prevJson,
        garmentColor,
        materialSettings: { ...materialSettings },
      };
      set({
        historyPast: [...historyPast.slice(-30), historyEntry],
        historyFuture: [],
      });
    }

    set({
      canvases: {
        ...canvases,
        [zoneId]: jsonString,
      },
    });

    // Auto-save debounced
    get().saveCurrentProject();
  },

  setActiveObjectProps: (props) => set({ activeObjectProps: props }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleWireframe: () => set((state) => ({ isWireframe: !state.isWireframe })),

  toggleAutoRotate: () => set((state) => ({ isAutoRotate: !state.isAutoRotate })),

  setIs3DOrbitLocked: (locked) => set({ is3DOrbitLocked: locked }),

  undo: () => {
    const { historyPast, historyFuture, canvases, activeFabricCanvas, activeZoneId, garmentColor, materialSettings } = get();
    if (historyPast.length === 0) return;

    const previousEntry = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    const currentEntry: HistoryEntry = {
      zoneId: activeZoneId,
      canvasJson: canvases[activeZoneId] || '',
      garmentColor,
      materialSettings: { ...materialSettings },
    };

    set({
      historyPast: newPast,
      historyFuture: [currentEntry, ...historyFuture],
      garmentColor: previousEntry.garmentColor,
      materialSettings: previousEntry.materialSettings,
      canvases: {
        ...canvases,
        [previousEntry.zoneId]: previousEntry.canvasJson,
      },
    });

    if (activeFabricCanvas && activeZoneId === previousEntry.zoneId) {
      if (previousEntry.canvasJson) {
        activeFabricCanvas.loadFromJSON(previousEntry.canvasJson, () => {
          activeFabricCanvas.renderAll();
          textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
        });
      } else {
        activeFabricCanvas.clear();
        textureBaker.clearZone(activeZoneId);
      }
    } else {
      textureBaker.bakeFromSerializedJson(previousEntry.zoneId, previousEntry.canvasJson);
    }
  },

  redo: () => {
    const { historyPast, historyFuture, canvases, activeFabricCanvas, activeZoneId, garmentColor, materialSettings } = get();
    if (historyFuture.length === 0) return;

    const nextEntry = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    const currentEntry: HistoryEntry = {
      zoneId: activeZoneId,
      canvasJson: canvases[activeZoneId] || '',
      garmentColor,
      materialSettings: { ...materialSettings },
    };

    set({
      historyPast: [...historyPast, currentEntry],
      historyFuture: newFuture,
      garmentColor: nextEntry.garmentColor,
      materialSettings: nextEntry.materialSettings,
      canvases: {
        ...canvases,
        [nextEntry.zoneId]: nextEntry.canvasJson,
      },
    });

    if (activeFabricCanvas && activeZoneId === nextEntry.zoneId) {
      if (nextEntry.canvasJson) {
        activeFabricCanvas.loadFromJSON(nextEntry.canvasJson, () => {
          activeFabricCanvas.renderAll();
          textureBaker.updateFromLiveCanvas(activeZoneId, activeFabricCanvas);
        });
      } else {
        activeFabricCanvas.clear();
        textureBaker.clearZone(activeZoneId);
      }
    } else {
      textureBaker.bakeFromSerializedJson(nextEntry.zoneId, nextEntry.canvasJson);
    }
  },

  saveCurrentProject: async () => {
    const state = get();
    set({ isSaving: true });

    try {
      const activeJson = state.activeFabricCanvas
        ? JSON.stringify(state.activeFabricCanvas.toJSON())
        : state.canvases[state.activeZoneId] || '';

      const updatedCanvases = {
        ...state.canvases,
        [state.activeZoneId]: activeJson,
      };

      const record: ProjectRecord = {
        id: state.currentProjectId,
        name: state.projectName,
        thumbnail: '',
        productType: state.activeProduct.id,
        garmentColor: state.garmentColor,
        materialSettings: state.materialSettings,
        canvases: updatedCanvases,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.projects.put(record);
      set({ lastSavedAt: Date.now(), isSaving: false });
    } catch (e) {
      console.error('Failed to auto-save project:', e);
      set({ isSaving: false });
    }
  },

  loadProject: (project: ProjectRecord) => {
    const product = PRODUCT_CATALOG[project.productType] || PRODUCT_CATALOG.tshirt;
    const initialZone = product.zones[0]?.id || 'front';

    set({
      currentProjectId: project.id,
      projectName: project.name,
      activeProduct: product,
      activeZoneId: initialZone,
      garmentColor: project.garmentColor,
      materialSettings: project.materialSettings,
      canvases: project.canvases || {},
      historyPast: [],
      historyFuture: [],
      lastSavedAt: project.updatedAt,
    });

    // Rebake all zones for 3D model
    for (const [zoneId, json] of Object.entries(project.canvases || {})) {
      if (json) {
        textureBaker.bakeFromSerializedJson(zoneId, json);
      }
    }

    // Load active zone into fabric canvas if mounted
    const { activeFabricCanvas } = get();
    if (activeFabricCanvas) {
      const zoneJson = project.canvases?.[initialZone];
      if (zoneJson) {
        activeFabricCanvas.loadFromJSON(zoneJson, () => {
          activeFabricCanvas.renderAll();
          textureBaker.updateFromLiveCanvas(initialZone, activeFabricCanvas);
        });
      } else {
        activeFabricCanvas.clear();
        textureBaker.clearZone(initialZone);
      }
    }
  },

  createNewProject: (productId = 'tshirt') => {
    const product = PRODUCT_CATALOG[productId] || PRODUCT_CATALOG.tshirt;
    const initialZone = product.zones[0]?.id || 'front';

    textureBaker.disposeAll();

    set({
      currentProjectId: 'project-' + Date.now(),
      projectName: 'New ' + product.name + ' Design',
      activeProduct: product,
      activeZoneId: initialZone,
      garmentColor: product.defaultColor,
      materialSettings: product.defaultMaterial,
      canvases: {},
      historyPast: [],
      historyFuture: [],
      lastSavedAt: null,
    });

    const { activeFabricCanvas } = get();
    if (activeFabricCanvas) {
      activeFabricCanvas.clear();
    }
  },
}));
