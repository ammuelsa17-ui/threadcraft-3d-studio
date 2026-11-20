import * as THREE from 'three';
import { fabric } from 'fabric';
import { calculatePrintResolution } from './printResolution';

class TextureBakerService {
  private textures: Map<string, THREE.CanvasTexture> = new Map();
  private offscreenCanvases: Map<string, HTMLCanvasElement> = new Map();
  private dirtyZones: Set<string> = new Set();
  private activeFabricCanvases: Map<string, fabric.Canvas> = new Map();
  private rafId: number | null = null;

  /**
   * Returns or creates a THREE.CanvasTexture for a specific zone.
   */
  getOrCreateTexture(zoneId: string, width = 1024, height = 1024): THREE.CanvasTexture {
    if (this.textures.has(zoneId)) {
      return this.textures.get(zoneId)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    this.textures.set(zoneId, texture);
    this.offscreenCanvases.set(zoneId, canvas);

    return texture;
  }

  /**
   * Schedules a 60fps-throttled update from a live Fabric.js canvas instance using requestAnimationFrame.
   */
  updateFromLiveCanvas(zoneId: string, fabricCanvas: fabric.Canvas, immediate = false): void {
    this.activeFabricCanvases.set(zoneId, fabricCanvas);
    this.dirtyZones.add(zoneId);

    if (immediate) {
      this.flushDirtyZones();
      return;
    }

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.flushDirtyZones();
        this.rafId = null;
      });
    }
  }

  /**
   * Flushes any dirty zone textures to the GPU.
   */
  private flushDirtyZones(): void {
    for (const zoneId of this.dirtyZones) {
      const texture = this.textures.get(zoneId);
      const fabricCanvas = this.activeFabricCanvases.get(zoneId);

      if (texture && fabricCanvas) {
        const sourceCanvas = fabricCanvas.getElement();
        if (sourceCanvas) {
          const destCanvas = texture.image as HTMLCanvasElement;
          if (destCanvas) {
            if (destCanvas.width !== sourceCanvas.width || destCanvas.height !== sourceCanvas.height) {
              destCanvas.width = sourceCanvas.width;
              destCanvas.height = sourceCanvas.height;
            }

            const ctx = destCanvas.getContext('2d')!;
            ctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
            ctx.drawImage(sourceCanvas, 0, 0);

            texture.needsUpdate = true;
          }
        }
      }
    }
    this.dirtyZones.clear();
  }

  /**
   * Bakes a serialized Fabric.js JSON state into an offscreen canvas texture.
   */
  async bakeFromSerializedJson(zoneId: string, jsonString: string, width = 1000, height = 1200): Promise<THREE.CanvasTexture> {
    const texture = this.getOrCreateTexture(zoneId, width, height);
    if (!jsonString) {
      const destCanvas = texture.image as HTMLCanvasElement;
      const ctx = destCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
      texture.needsUpdate = true;
      return texture;
    }

    return new Promise((resolve) => {
      const offCanvasEl = document.createElement('canvas');
      offCanvasEl.width = width;
      offCanvasEl.height = height;

      const staticCanvas = new fabric.StaticCanvas(offCanvasEl, {
        width,
        height,
        backgroundColor: 'transparent',
      });

      staticCanvas.loadFromJSON(jsonString, () => {
        staticCanvas.renderAll();
        const destCanvas = texture.image as HTMLCanvasElement;
        destCanvas.width = width;
        destCanvas.height = height;
        const ctx = destCanvas.getContext('2d')!;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(offCanvasEl, 0, 0);

        texture.needsUpdate = true;
        staticCanvas.dispose();
        resolve(texture);
      });
    });
  }

  /**
   * Generates a high-resolution transparent production artwork image based on exact physical DPI math.
   * e.g. For 35cm x 42cm @ 300 DPI, renders exactly 4134 x 4961 pixels!
   */
  async generateExactDpiArtwork(
    jsonString: string,
    physicalWidthCm: number,
    physicalHeightCm: number,
    dpi: number = 300,
    sourceCanvasWidth: number = 1000
  ): Promise<{ dataUrl: string; resolution: ReturnType<typeof calculatePrintResolution> }> {
    const resolution = calculatePrintResolution(physicalWidthCm, physicalHeightCm, dpi);
    const { widthPx, heightPx } = resolution;

    // Calculate exact zoom ratio from source virtual canvas to target print pixels
    const zoomRatio = widthPx / sourceCanvasWidth;

    return new Promise((resolve) => {
      const offCanvasEl = document.createElement('canvas');
      offCanvasEl.width = widthPx;
      offCanvasEl.height = heightPx;

      const staticCanvas = new fabric.StaticCanvas(offCanvasEl, {
        width: widthPx,
        height: heightPx,
        backgroundColor: 'transparent',
      });

      if (!jsonString) {
        const dataUrl = offCanvasEl.toDataURL('image/png');
        staticCanvas.dispose();
        resolve({ dataUrl, resolution });
        return;
      }

      staticCanvas.loadFromJSON(jsonString, () => {
        staticCanvas.setZoom(zoomRatio);
        staticCanvas.renderAll();
        const dataUrl = offCanvasEl.toDataURL('image/png');
        staticCanvas.dispose();
        resolve({ dataUrl, resolution });
      });
    });
  }

  clearZone(zoneId: string): void {
    const texture = this.textures.get(zoneId);
    if (texture) {
      const destCanvas = texture.image as HTMLCanvasElement;
      const ctx = destCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
      texture.needsUpdate = true;
    }
  }

  disposeAll(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const texture of this.textures.values()) {
      texture.dispose();
    }
    this.textures.clear();
    this.offscreenCanvases.clear();
    this.dirtyZones.clear();
    this.activeFabricCanvases.clear();
  }
}

export const textureBaker = new TextureBakerService();
