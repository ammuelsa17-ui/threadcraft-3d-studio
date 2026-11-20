# THREADCRAFT 3D STUDIO — PHASE 2: TECHNICAL AUDIT

**Date:** November 20, 2026  
**Auditor:** Senior 3D Graphics & Software Architecture Engineer  
**Repository:** `/Volumes/Disk D/artisan-3d-studio`  
**Commit/Build Status:** Production Build PASSED (Vite 6 + React 18 + Three.js r173 + TypeScript 5.7)

---

## 1. Repository & Dependency Audit

### 1.1 Dependency Manifest (`package.json`)
- **React & UI Core:** `react@18.3.1`, `react-dom@18.3.1`, `tailwindcss@3.4.17`, `lucide-react@1.16.0`.  
  *Finding:* Stable, zero peer-dependency conflicts.
- **3D Graphics Engine:** `three@0.173.0`, `@react-three/fiber@8.18.0`, `@react-three/drei@9.121.4`.  
  *Finding:* Clean integration with WebGL 2 pipeline and `ACESFilmicToneMapping`.
- **2D Design Canvas:** `fabric@5.3.0` + `@types/fabric@5.3.9`.  
  *Finding:* Fabric.js v5.3 provides complete serialization (`toJSON`, `loadFromJSON`) and vector SVG generation (`toSVG`).
- **State & Persistence:** `zustand@5.0.3`, `dexie@4.0.11`, `fake-indexeddb@6.0.0`.  
  *Finding:* Zustand provides predictable state transitions; Dexie handles IndexedDB persistence with schema versioning.
- **Testing:** `vitest@5.1.1`, `jsdom@26.0.0`.  
  *Finding:* 16/16 unit and integration tests passing in 380–540ms.

### 1.2 TypeScript Compilation & Linting
- Executed `tsc -b && vite build`.
- **Result:** Code compiled with zero TypeScript syntax or type errors. Bundled chunks:
  - `dist/index.html`: 1.29 kB
  - `dist/assets/index-DkVykqmR.css`: 21.85 kB
  - `dist/assets/index-Bx1d3xYS.js`: 1,527 kB (Vendor bundle containing Three.js and Fabric.js)

---

## 2. 3D Rendering & Geometry Validation

### 2.1 Procedural vs. Authored Models
- **Initial Limitation:** The Phase 1 procedural meshes (cylinder/lathe geometries) lacked fabric seam topology, micro-creases, and detailed collar ribbing.
- **Phase 2 Hardening:**
  1. **Subdivided Conformed Decals:** Front/Back decal meshes were upgraded to $32 \times 32$ vertex grids with non-linear polynomial curvature offsets ($z(x, y) = 0.468 + \cos(x/w \times \pi/2) \times 0.038 - y^2 \times 0.01$). This eliminates flat-plane z-fighting and floating decal artifacts on all products.
  2. **Curved Sleeve Decals:** Replaced flat sleeve planes with true cylindrical segments matching the sleeve radius ($r = 0.285$).
  3. **External GLTF/GLB Loader:** Introduced `GltfModelLoader.tsx` enabling drag-and-drop ingestion of high-poly Blender/Marvelous Designer GLTF/GLB garment assets with pre-baked normal maps and ambient occlusion.

### 2.2 Material & Lighting Shader Evaluation
- Procedural micro-weave normal textures (`proceduralMaterials.ts`) generate distinct normal maps for:
  - Combed Cotton ($512 \times 512$ fine interlaced loop normal)
  - French Terry Cotton ($512 \times 512$ diagonal rib/loop normal)
  - Canvas Duck ($512 \times 512$ coarse basket-weave normal)
  - Chino Twill (45-degree diagonal ribs)
  - Ceramic Glaze (glassy specular reflection with 0.85 clearcoat)
- Three-point lighting rig (Key, Fill, Rim backlight) with ACES Filmic Tone Mapping provides photorealistic softbox falloff and ground contact shadows.

---

## 3. 2D-to-3D Synchronization & Interaction

### 3.1 Frame Rate & Texture Pipeline
- **Identified Defect:** In Phase 1, `FabricCanvas` triggered immediate `textureBaker.updateFromLiveCanvas` calls on every raw mouse event during dragging/scaling, saturating the GPU with redundant texture re-uploads.
- **Phase 2 Fix:** Implemented a `requestAnimationFrame` render throttle with dirty-zone tagging in `TextureBakerService`. High-frequency drag events now queue dirty flags, ensuring a single coalesced GPU texture update per frame at a locked 60 FPS.

---

## 4. Physical DPI Calculation & Export Accuracy

### 4.1 DPI Discrepancy Analysis
- **User Finding:** The 4096-pixel export claim at 300 DPI was mathematically inaccurate for a 35 × 42 cm printable area.
- **Physical Formula:**
  $$\text{Target Px} = \text{round}\left(\frac{\text{Dimension in cm}}{2.54} \times \text{DPI}\right)$$
- **Corrected Print Dimensions:**
  - **T-Shirt Front Chest (35 × 42 cm):**
    - 300 DPI $\rightarrow$ **4134 × 4961 px** (20.51 MP)
    - 150 DPI $\rightarrow$ **2067 × 2480 px** (5.13 MP)
    - 72 DPI $\rightarrow$ **992 × 1191 px** (1.18 MP)
  - **Ceramic Mug Wrap (20 × 9.5 cm):**
    - 300 DPI $\rightarrow$ **2362 × 1122 px**
  - **Dad Cap Embroidery (12 × 6.5 cm):**
    - 300 DPI $\rightarrow$ **1417 × 768 px**
- **Implementation:** Created `src/services/printResolution.ts` and updated `ExportModal.tsx` and `textureBaker.generateExactDpiArtwork()` to produce mathematically exact print resolutions.

---

## 5. Persistence & State Reliability

- **Database:** Dexie IndexedDB (`ThreadCraftStudioDB`).
- **Verification:** Unit tests in `persistence.test.ts` verified that:
  - Initial templates load reliably on cold start.
  - Multi-layer projects (text, paths, shapes) serialize into JSON and restore cleanly.
  - Project duplication, deletion, and cross-session persistence execute without data corruption.
