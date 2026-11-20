import * as THREE from 'three';

export interface ModelValidationReport {
  isValid: boolean;
  meshCount: number;
  totalVertices: number;
  totalTriangles: number;
  hasUVs: boolean;
  hasNormals: boolean;
  detectedMaterials: string[];
  suggestedPrintZone: string;
  errors: string[];
  warnings: string[];
}

export class ModelValidator {
  /**
   * Validates a parsed Three.js GLTF/GLB object hierarchy for product customizability.
   */
  static validate(root: THREE.Object3D): ModelValidationReport {
    let meshCount = 0;
    let totalVertices = 0;
    let totalTriangles = 0;
    let hasUVs = true;
    let hasNormals = true;
    const detectedMaterials: Set<string> = new Set();
    const errors: string[] = [];
    const warnings: string[] = [];

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshCount++;
        const mesh = child as THREE.Mesh;
        const geo = mesh.geometry;

        if (geo) {
          const posAttr = geo.attributes.position;
          if (posAttr) {
            totalVertices += posAttr.count;
            totalTriangles += geo.index ? geo.index.count / 3 : posAttr.count / 3;
          }

          if (!geo.attributes.uv) {
            hasUVs = false;
            errors.push(`Mesh '${mesh.name || 'unnamed'}' lacks UV coordinates (attributes.uv). Texture mapping impossible.`);
          }

          if (!geo.attributes.normal) {
            hasNormals = false;
            warnings.push(`Mesh '${mesh.name || 'unnamed'}' has no normals. Recalculating vertex normals.`);
            geo.computeVertexNormals();
          }
        }

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => detectedMaterials.add(m.name || 'Unnamed Material'));
          } else {
            detectedMaterials.add(mesh.material.name || 'Unnamed Material');
          }
        }
      }
    });

    if (meshCount === 0) {
      errors.push('No 3D meshes detected in this model file.');
    }

    if (totalVertices > 500000) {
      warnings.push(`High polygon count (${totalVertices.toLocaleString()} vertices). May impact mobile or low-end laptop frame rates.`);
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      meshCount,
      totalVertices,
      totalTriangles: Math.round(totalTriangles),
      hasUVs,
      hasNormals,
      detectedMaterials: Array.from(detectedMaterials),
      suggestedPrintZone: 'front_body',
      errors,
      warnings,
    };
  }
}
