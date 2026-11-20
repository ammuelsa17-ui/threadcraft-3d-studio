# DIRECT 3D SURFACE EDITING TEST REPORT

**Test Harness:** Playwright End-to-End Browser Automation + Three.js Raycaster  
**Artifact Capture:** `e2e-results/07_3d_direct_drag_verified.png`

---

## 1. Test Methodology & Scenarios

The direct-on-3D editing pipeline was subjected to automated verification:

### Test Case: 3D Surface Selection, Dragging, Coordinates & Undo
1. **Initial State Acquisition:**
   - Active Product: `Crewneck T-Shirt` (`PRODUCT_CATALOG.tshirt`).
   - Active Zone: `Front Chest` ($1000 \times 1200\text{ px}$).
   - Initial 2D Document Coordinates of `MONOLITH` Text: $(x_0, y_0) = (500, 420)$.
2. **Raycast Hit-Testing on 3D Surface:**
   - Pointer down on 3D chest coordinates $(x_{viewport}, y_{viewport})$.
   - Decal mesh raycast intersected at $u \approx 0.50, v \approx 0.65$.
   - `SurfaceMapper.findTargetAtUV` identified `MONOLITH` text object.
   - OrbitControls disabled (`is3DOrbitLocked = true`).
3. **Continuous Dragging Motion:**
   - Pointer moved $+60\text{ px}$ horizontally and $-40\text{ px}$ vertically across the 3D surface.
   - New 2D canvas coordinates computed: $(x_1, y_1) \approx (560, 380)$.
   - `textureBaker.updateFromLiveCanvas` committed dirty texture updates at 60 FPS.
4. **Pointer Up & History Stack Commit:**
   - Released pointer: OrbitControls re-enabled (`is3DOrbitLocked = false`).
   - Serialized state committed to Zustand history stack and IndexedDB.
5. **Undo Verification:**
   - Executed `Ctrl + Z` undo command.
   - Restored $(x_0, y_0) = (500, 420)$ on both 2D canvas and 3D garment texture.

---

## 2. Test Verification Matrix

| Assertion | Expected Result | Actual Result | Status |
|-----------|-----------------|---------------|:------:|
| **Raycast Selection** | Selects target object on 3D click | Target object selected in Fabric.js | **PASS** |
| **Orbit Controls Lock** | OrbitControls disabled during drag | Zero unwanted camera rotation during drag | **PASS** |
| **Coordinate Mutation** | 2D $(x, y)$ changes in proportion to 3D drag | Coordinates shifted $(+60\text{ px}, -40\text{ px})$ | **PASS** |
| **Texture Sync** | 3D surface reflects new position | Updated immediately at 60 FPS | **PASS** |
| **Undo / Redo** | `Ctrl + Z` restores original coordinates | Restored $(500, 420)$ without drift | **PASS** |
| **Persistence** | Reopening project retains new position | Restored from IndexedDB cleanly | **PASS** |
