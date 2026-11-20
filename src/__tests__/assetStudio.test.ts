import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { db } from '../services/db';
import { useStudioStore } from '../store/useStudioStore';
import { ModelValidator } from '../services/modelValidator';
import { CustomProductRecord } from '../types/product';

describe('Asset Studio & Custom Product Engine', () => {
  beforeEach(async () => {
    await db.customProducts.clear();
    useStudioStore.getState().createNewProject('tshirt');
  });

  it('validates a complete 3D garment model with UVs and normals', () => {
    const root = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32);
    const mat = new THREE.MeshStandardMaterial({ name: 'BodyFabric' });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'TorsoMesh';
    root.add(mesh);

    const report = ModelValidator.validate(root);
    expect(report.isValid).toBe(true);
    expect(report.hasUVs).toBe(true);
    expect(report.meshCount).toBe(1);
    expect(report.detectedMaterials).toContain('BodyFabric');
  });

  it('saves and activates a custom product template in IndexedDB', async () => {
    const customTemplate: CustomProductRecord = {
      id: 'custom-bomber-jacket',
      name: 'Custom Street Bomber',
      subtitle: 'Apparel • Custom Configured Template',
      category: 'Apparel',
      defaultColor: '#1e3a8a',
      colorPalette: ['#1e3a8a', '#18181b', '#f4f4f5'],
      defaultMaterial: {
        roughness: 0.8,
        metalness: 0.1,
        normalScale: 1.4,
        fabricType: 'cotton',
        clearcoat: 0.0,
        bumpScale: 0.08,
        ambientIntensity: 0.95,
        environmentPreset: 'studio',
      },
      zones: [
        {
          id: 'front',
          name: 'Front Chest',
          description: 'Front custom print zone',
          canvasWidth: 1000,
          canvasHeight: 1200,
          physicalWidthCm: 32,
          physicalHeightCm: 38,
          cameraPosition: [0, 0.1, 3.2],
          cameraTarget: [0, 0, 0],
        },
      ],
      initialCamera: {
        position: [0, 0.1, 3.2],
        target: [0, 0, 0],
        fov: 38,
      },
      isCustom: true,
      createdAt: Date.now(),
    };

    await db.customProducts.put(customTemplate);

    const retrieved = await db.customProducts.get('custom-bomber-jacket');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Custom Street Bomber');
    expect(retrieved?.isCustom).toBe(true);

    // Switch store to custom product
    await useStudioStore.getState().setProduct('custom-bomber-jacket');
    const activeProd = useStudioStore.getState().activeProduct;
    expect(activeProd.id).toBe('custom-bomber-jacket');
    expect(activeProd.name).toBe('Custom Street Bomber');
  });
});
