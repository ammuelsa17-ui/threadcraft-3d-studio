import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { SurfaceMapper } from '../services/surfaceMapper';
import { createCurvedTextGroup } from '../services/curvedText';
import { ModelValidator } from '../services/modelValidator';
import { ExportVerifier } from '../services/exportVerifier';

describe('Phase 4: Surface Mapping & Direct Editing Math', () => {
  it('converts normalized UV to 2D canvas pixel coordinates accurately', () => {
    const canvasWidth = 1000;
    const canvasHeight = 1200;

    // Center (0.5, 0.5)
    const center = SurfaceMapper.uvToCanvas({ u: 0.5, v: 0.5 }, canvasWidth, canvasHeight);
    expect(center.x).toBe(500);
    expect(center.y).toBe(600);

    // Top-Left UV (0.0, 1.0 in OpenGL UV is top-left in standard Canvas)
    const topLeft = SurfaceMapper.uvToCanvas({ u: 0.0, v: 1.0 }, canvasWidth, canvasHeight);
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);

    // Bottom-Right UV (1.0, 0.0 is bottom-right)
    const bottomRight = SurfaceMapper.uvToCanvas({ u: 1.0, v: 0.0 }, canvasWidth, canvasHeight);
    expect(bottomRight.x).toBe(1000);
    expect(bottomRight.y).toBe(1200);
  });

  it('converts 2D canvas pixels back to UV coordinates (bijective bijection test)', () => {
    const canvasWidth = 800;
    const canvasHeight = 1000;

    const originalPoints = [
      { x: 100, y: 200 },
      { x: 400, y: 500 },
      { x: 750, y: 950 },
    ];

    for (const pt of originalPoints) {
      const uv = SurfaceMapper.canvasToUV(pt, canvasWidth, canvasHeight);
      const backToCanvas = SurfaceMapper.uvToCanvas(uv, canvasWidth, canvasHeight);
      expect(backToCanvas.x).toBeCloseTo(pt.x, 2);
      expect(backToCanvas.y).toBeCloseTo(pt.y, 2);
    }
  });

  it('validates safe printable boundary margin check', () => {
    expect(SurfaceMapper.isInsidePrintBoundary({ u: 0.5, v: 0.5 })).toBe(true);
    expect(SurfaceMapper.isInsidePrintBoundary({ u: 0.01, v: 0.5 })).toBe(false); // off left
    expect(SurfaceMapper.isInsidePrintBoundary({ u: 0.5, v: 0.99 })).toBe(false); // off top
  });
});

describe('Phase 4: Advanced Curved Text Engine', () => {
  it('creates curved text group with exact character count and circular angular layout', () => {
    const text = 'CHAMPION';
    const group = createCurvedTextGroup({
      text,
      radius: 200,
      fontSize: 48,
    });

    expect(group).toBeDefined();
    expect((group as any).isCurvedText).toBe(true);
    expect((group as any).curvedTextString).toBe('CHAMPION');
    expect(group.size()).toBe(text.length);
  });
});

describe('Phase 4: Model Import Validator', () => {
  it('validates a correct mesh with positions, UVs, and normals', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ name: 'FabricBase' });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'TShirtFront';

    const group = new THREE.Group();
    group.add(mesh);

    const report = ModelValidator.validate(group);
    expect(report.isValid).toBe(true);
    expect(report.meshCount).toBe(1);
    expect(report.hasUVs).toBe(true);
    expect(report.hasNormals).toBe(true);
    expect(report.detectedMaterials).toContain('FabricBase');
  });

  it('rejects a mesh lacking UV coordinates', () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
    // Notice: NO attributes.uv
    const mesh = new THREE.Mesh(geometry);

    const group = new THREE.Group();
    group.add(mesh);

    const report = ModelValidator.validate(group);
    expect(report.isValid).toBe(false);
    expect(report.hasUVs).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });
});

describe('Phase 4: Export Verifier', () => {
  it('validates SVG string formatting and viewBox', () => {
    const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1200"><text>HELLO</text></svg>';
    const result = ExportVerifier.verifySvg(validSvg);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('svg');

    const invalidSvg = '<div>Not an SVG</div>';
    const badResult = ExportVerifier.verifySvg(invalidSvg);
    expect(badResult.isValid).toBe(false);
    expect(badResult.errors.length).toBeGreaterThan(0);
  });

  it('validates project backup JSON structure', () => {
    const validBackup = JSON.stringify({
      version: '1.0.0',
      name: 'Test Shirt',
      productType: 'tshirt',
      garmentColor: '#1e212d',
      canvases: { front: '{}' },
    });
    const result = ExportVerifier.verifyProjectBackup(validBackup);
    expect(result.isValid).toBe(true);

    const invalidBackup = '{"name": "Incomplete"}';
    const badResult = ExportVerifier.verifyProjectBackup(invalidBackup);
    expect(badResult.isValid).toBe(false);
  });
});
