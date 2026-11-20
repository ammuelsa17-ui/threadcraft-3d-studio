import { fabric } from 'fabric';

export interface UVCoordinate {
  u: number;
  v: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Surface Coordinate Mapper establishing canonical bijection between:
 * 1. Normalized UV coordinates (u in [0, 1], v in [0, 1])
 * 2. 2D Fabric.js canvas pixel coordinates (x in [0, canvasWidth], y in [0, canvasHeight])
 */
export class SurfaceMapper {
  /**
   * Converts Three.js UV coordinate (u: 0..1 left-to-right, v: 0..1 bottom-to-top)
   * to Fabric.js Canvas point (x: 0..width left-to-right, y: 0..height top-to-bottom)
   */
  static uvToCanvas(uv: UVCoordinate, canvasWidth: number, canvasHeight: number): CanvasPoint {
    const x = Math.max(0, Math.min(canvasWidth, uv.u * canvasWidth));
    const y = Math.max(0, Math.min(canvasHeight, (1.0 - uv.v) * canvasHeight));
    return { x, y };
  }

  /**
   * Converts Fabric.js Canvas point (x, y) to Three.js UV coordinate (u, v)
   */
  static canvasToUV(point: CanvasPoint, canvasWidth: number, canvasHeight: number): UVCoordinate {
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      throw new Error('Canvas dimensions must be greater than zero.');
    }
    const u = Math.max(0, Math.min(1.0, point.x / canvasWidth));
    const v = Math.max(0, Math.min(1.0, 1.0 - point.y / canvasHeight));
    return { u, v };
  }

  /**
   * Finds the topmost selectable Fabric.js object containing the given UV coordinate.
   */
  static findTargetAtUV(
    uv: UVCoordinate,
    fabricCanvas: fabric.Canvas
  ): fabric.Object | null {
    const canvasPoint = this.uvToCanvas(uv, fabricCanvas.getWidth(), fabricCanvas.getHeight());
    const point = new fabric.Point(canvasPoint.x, canvasPoint.y);

    const objects = fabricCanvas.getObjects().slice().reverse();
    for (const obj of objects) {
      if (!obj.visible || !obj.selectable) continue;
      if (obj.containsPoint(point)) {
        return obj;
      }
    }
    return null;
  }

  /**
   * Validates if a UV coordinate lies within the safe printable zone margin.
   */
  static isInsidePrintBoundary(uv: UVCoordinate, marginRatio = 0.04): boolean {
    return (
      uv.u >= marginRatio &&
      uv.u <= 1.0 - marginRatio &&
      uv.v >= marginRatio &&
      uv.v <= 1.0 - marginRatio
    );
  }
}
