# ThreadCraft 3D Studio 🎨👕✨

> A professional-grade 3D product customization and apparel design web studio combining **Canva's** 2D editing flexibility, **BlankBuilder's** real-time 3D customization, and **Blender's** physically based material rendering.

---

## 🚀 Key Features

### 1. Direct-on-3D Surface Interaction
- **Raycast Hit-Testing:** Click directly on the 3D garment mesh to select artwork layers.
- **Surface Dragging:** Reposition graphics across curved geometry with real-time bidirectional synchronization between the Three.js viewport and the Fabric.js 2D canvas.
- **Intelligent Orbit Locking:** Camera controls automatically lock during direct surface manipulation to avoid disorienting viewport rotations.
- **Undo / Redo Support:** Full history stack integration (`Ctrl+Z` / `Ctrl+Y`) for both 2D and 3D edits.

### 2. Multi-Zone Apparel & Accessory Models
- **Crewneck T-Shirt:** Independent Front Chest, Back Center, and Left Sleeve design surfaces.
- **Oversized Street Hoodie:** Front Torso and Hood design areas with heavy knit fabric styling.
- **Ceramic Studio Mug:** $280^\circ$ cylindrical decal wrapping with glassy specular highlights.
- **Structured Dad Cap:** Spherical front crown projection with curved bill geometry.
- **Heavy Canvas Tote Bag:** Front and Back flat surfaces with coarse fabric texturing.

### 3. Asset Studio & Custom Model Workflow
- **glTF / GLB 2.0 Ingestion:** Import external 3D models authored in Blender, Marvelous Designer, or Clo3D.
- **Automated Geometry Diagnostics:** Vertex count inspection, normal computation, and `attributes.uv` verification.
- **Visual UV Print-Zone Editor:** Define custom print boundaries directly in normalized $[0..1]$ UV space with safe margins.
- **Custom Product Generator:** Save configured assets to IndexedDB as reusable studio templates.

### 4. Advanced 2D Design Engine
- **Curved & Circular Typography:** Arched and circular text rendering with real-time radius and letter-spacing controls.
- **Precision Transform Bar:** Numeric inputs for X/Y coordinates, scale, rotation angle, and opacity.
- **Magnetic Snapping Guides:** Canvas center lines and crosshair alignment guides.
- **Collapsible Layer Stack:** Reorder, lock, hide, or delete individual vector, text, and raster layers.

### 5. Physically Based Rendering (PBR)
- **Procedural Normal Weaves:** High-frequency normal maps for Combed Cotton, French Terry, Duck Canvas, Chino Twill, and Glazed Ceramic.
- **Calibrated Studio Lighting:** 3-point softbox lighting rig (Key, Fill, Rim) with real-time directional contact shadows.
- **Color Grading:** ACES Filmic tone mapping in sRGB color space.

### 6. Production-Ready Export Pipeline
- **Physical DPI Calculations:** Print-ready PNG exports at true physical resolutions ($\text{px} = \text{round}((\text{cm} / 2.54) \times \text{DPI})$).
  - *Standard T-Shirt Front ($35\text{ cm} \times 42\text{ cm}$):* **$4134 \times 4961\text{ px}$ at 300 DPI**.
- **Vector SVG Trees:** Scalable vector graphics export preserving text, paths, and transformations.
- **Project Archives (`.threadcraft`):** JSON bundle with artwork, camera coordinates, and material configurations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript 5.7, Vite 6 |
| **Styling & UI Components** | Tailwind CSS, Lucide React |
| **3D Engine** | Three.js (r173), React Three Fiber (v8), Drei, `three-mesh-bvh` |
| **2D Vector Engine** | Fabric.js (v5.3) |
| **State & Local Database** | Zustand (v5), Dexie.js (IndexedDB v4) |
| **Testing & Automation** | Vitest 5.1.1 (jsdom), Playwright Test 1.50 (Chromium) |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/ammuelsa17-ui/threadcraft-3d-studio.git
cd threadcraft-3d-studio

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

### Unit & Integration Suite
```bash
npm run test
```
- **26 / 26 Vitest tests passing** (coordinate bijection, DPI calculation, project persistence, store state).

### End-to-End Browser Automation Suite
```bash
npm run test:e2e
```
- **8 / 8 Playwright browser tests passing** (full UI flow, typography, product switching, 3D surface dragging, asset studio).

### Production Build
```bash
npm run build
```

---

## 🔒 Scope & Disclaimers
ThreadCraft 3D Studio is strictly an editor and creative software application. It intentionally contains **no** shopping carts, checkout systems, payment processing, or print-on-demand dropshipping services.

---

## 📄 License
MIT License.
