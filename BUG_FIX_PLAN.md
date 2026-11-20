# THREADCRAFT 3D STUDIO — BUG FIX PLAN & ROADMAP

**Document Date:** November 20, 2026  
**Status:** Phase 2 Defect Remediation Complete

---

## 1. Resolved Defects (Phase 2)

### Defect 1: Arbitrary Export Scale vs. Physical 300 DPI Math
- **Severity:** HIGH
- **File:** `src/services/textureBaker.ts`, `src/components/panels/ExportModal.tsx`
- **Issue:** Phase 1 scaled virtual canvas pixels ($1000 \times 1200$) by integer factors ($1\times, 2\times, 4\times$), reaching at most $4000 \times 4800$ px. A standard $35 \times 42 \text{ cm}$ shirt print requires $4134 \times 4961 \text{ px}$ at 300 DPI.
- **Fix:** Implemented `calculatePrintResolution(cmWidth, cmHeight, dpi)` using physical formula:
  $$\text{pixels} = \text{round}\left(\frac{\text{cm}}{2.54} \times \text{DPI}\right)$$
- **Verification:** Unit test suite in `printResolution.test.ts` validates exact output across all zones.

### Defect 2: GPU Texture Thrashing on Rapid Artwork Dragging
- **Severity:** MEDIUM-HIGH
- **File:** `src/services/textureBaker.ts`, `src/components/editor2d/FabricCanvas.tsx`
- **Issue:** Fabric.js dispatched canvas sync on every mouse event, causing up to 120+ `drawImage` and texture upload calls per second.
- **Fix:** Introduced dirty zone tracking with `requestAnimationFrame` debouncing, capping texture commits to 60 FPS.
- **Verification:** Frame rate remained at 60 FPS under continuous drag tests.

### Defect 3: Flat Decal Plane Z-Fighting & Edge Artifacts
- **Severity:** MEDIUM
- **File:** `src/services/productGeometries.ts`
- **Issue:** Flat or low-subdivision decal planes caused clipping and z-fighting on curved garment torsos, sleeves, and caps.
- **Fix:** Subdivided decal planes into $32 \times 32$ vertex meshes with polynomial curvature conforming to the body surface. Converted sleeve decals to cylindrical segments hugging the sleeve radius.

### Defect 4: Missing External High-Poly 3D Model Support
- **Severity:** MEDIUM
- **File:** `src/components/viewport3d/GltfModelLoader.tsx`
- **Issue:** Procedural shapes lacked the realistic folds and seams of professional 3D apparel software.
- **Fix:** Created `GltfModelLoader.tsx` with automated bounding box normalization, PBR material assignment, and texture binding to support real Blender-authored `.glb` models.

---

## 2. Phase 3 Roadmap (Future Enhancements)

1. **UV Unwrapping & Mesh Surface Projection:**
   - Integrate raycast surface painting (Three.js BVH) for arbitrary 3D model surface decals.
2. **Advanced Typography Engine:**
   - Add curved text path warping and text envelope deformation.
3. **PBR Normal Map Bumping:**
   - Add high-resolution 4K normal map upload for custom garment textures.
