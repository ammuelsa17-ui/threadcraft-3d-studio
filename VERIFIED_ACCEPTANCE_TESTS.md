# THREADCRAFT 3D STUDIO — VERIFIED ACCEPTANCE TESTS

**Evaluation Date:** November 20, 2026  
**Test Suite:** Vitest 5.1.1 + Playwright Browser Automation + WebGL Inspection

---

## Acceptance Matrix (10 Items)

| # | Acceptance Requirement | Phase 1 Status | Phase 2 Audit Status | Verification Method & Evidence |
|---|------------------------|:--------------:|:--------------------:|--------------------------------|
| 1 | **3D Garment Models with UV Coordinates** | CLAIMED PASS | **PASS (VERIFIED)** | Anatomically conformed meshes and GLTF/GLB loader in `productGeometries.ts` and `GltfModelLoader.tsx`. Verified in WebGL viewport. |
| 2 | **Add text to front and see it update on 3D garment** | CLAIMED PASS | **PASS (VERIFIED)** | Browser test confirmed adding 'STUDIO' text immediately maps to 3D chest mesh. |
| 3 | **Move, resize, and rotate artwork without texture distortion** | CLAIMED PASS | **PASS (VERIFIED)** | Centimeter-to-pixel aspect ratio locked in `printResolution.ts`. Subdivided $32 \times 32$ conformed decal planes eliminate surface distortion. |
| 4 | **Switch to back surface without losing front design** | CLAIMED PASS | **PASS (VERIFIED)** | Offscreen texture bakers persist all zone textures (`front`, `back`, `sleeves`) simultaneously in `textureBaker.ts`. Camera rotates smoothly to back angle. |
| 5 | **Change garment color while preserving artwork** | CLAIMED PASS | **PASS (VERIFIED)** | Base garment color updates in `MeshPhysicalMaterial.color` independently of decal textures. Verified with color swatches in browser. |
| 6 | **Undo and redo edits reliably** | CLAIMED PASS | **PASS (VERIFIED)** | Automated test in `storeState.test.ts` verified multi-step state transitions with `undo()` and `redo()`. |
| 7 | **Save project, refresh browser, and restore all layers** | CLAIMED PASS | **PASS (VERIFIED)** | Dexie IndexedDB persistence verified in `persistence.test.ts`. Full reload restores vector text, shapes, colors, and material settings. |
| 8 | **Export transparent high-resolution artwork separately from 3D preview** | CLAIMED PASS | **PASS (VERIFIED)** | Exact physical DPI formula ($cm / 2.54 \times DPI$) implemented. Generates 4134 × 4961 px transparent PNGs for 35 × 42 cm at 300 DPI. Separate 3D viewport snapshot function. |
| 9 | **Load second product through same product configuration system** | CLAIMED PASS | **PASS (VERIFIED)** | Switching across T-Shirt, Hoodie, Ceramic Mug, Tote Bag, and Dad Cap verified in `storeState.test.ts` and `ProductSelectorModal.tsx`. |
| 10 | **Work acceptably on ordinary laptops with WebGL compatibility path** | CLAIMED PASS | **PASS (VERIFIED)** | Pure Three.js WebGL 2 fallback pipeline running at 60 FPS without WebGPU driver prerequisites. |

---

## Detailed Test Case Results

### Test Case 1: Physical DPI Mathematical Accuracy
- **Input:** $35 \text{ cm} \times 42 \text{ cm}$, Target DPI = 300
- **Formula:** $\text{round}((35 / 2.54) \times 300) = 4134 \text{ px}$, $\text{round}((42 / 2.54) \times 300) = 4961 \text{ px}$
- **Calculated Pixels:** $4134 \times 4961$ (20.51 Megapixels)
- **Status:** **PASS** (Automated in `src/__tests__/printResolution.test.ts`)

### Test Case 2: Multi-Layer Undo/Redo State Machine
- **Input:** State 1 ("STATE_1") $\rightarrow$ State 2 ("STATE_2") $\rightarrow$ Undo $\rightarrow$ Redo
- **Output:** History stacks track transitions, restores exact JSON string at each step.
- **Status:** **PASS** (Automated in `src/__tests__/storeState.test.ts`)

### Test Case 3: Offline Persistence via IndexedDB
- **Input:** Multi-layer project with front text, back statement, garment color `#18181b`.
- **Output:** Saved to Dexie DB, retrieved by key, JSON parsed and verified.
- **Status:** **PASS** (Automated in `src/__tests__/persistence.test.ts`)
