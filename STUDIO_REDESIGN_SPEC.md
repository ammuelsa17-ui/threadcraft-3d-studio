# THREADCRAFT 3D STUDIO — NEXT-GENERATION REDESIGN SPEC (STAGE 2)

**Design Direction:** Figma & Spline-inspired Professional 3D Creative Studio  
**Target:** Clean, distraction-free, 3D-first apparel design suite.

---

## 1. Architectural Workspace Layout

```
+----------------------------------------------------------------------------------------------------+
|  [Logo] ThreadCraft  |  [T-Shirt ▼] Heavy Tee  |  [3D | Split | 2D]  |  [↺ ↻]  |  [Export ▾]       |
+------+----------------------------------------------------------+----------------------------------+
|      |                                                          | [PROPERTIES & INSPECTOR]         |
| [T]  |                                                          |                                  |
| [🖼] |                                                          |  • Dynamic Context:              |
| [▢]  |                  3D STUDIO HERO VIEWPORT                 |    - If Text: Font, Arch, Align  |
| [★]  |                                                          |    - If Shape: Fill, Stroke      |
| [◫]  |               (Expansive, Studio Cyclorama,              |    - If Garment: Color Palette,  |
|      |                Realistic Softbox Lighting)               |      Fabric Weave Preset         |
| [☰]  |                                                          |                                  |
|      |                                                          |  • Collapsible PBR Shader Drawer |
|      |     [Front | Back | Sleeve | Reset Silhouette]            |  • Compact Layer Stack Drawer    |
+------+----------------------------------------------------------+----------------------------------+
```

### 1.1 Left Tool Rail (56px Minimal Dock)
- **Tool Icons:** Add Text, Upload Graphic, Add Shape, Graphic Stamps, Layers Stack, Asset Studio.
- Clicking an icon opens a compact floating flyout drawer that does not push or resize the 3D viewport.

### 1.2 Central 3D Hero Viewport
- **Unconstrained Canvas:** Takes over up to 75% of the total screen area.
- **Lighting & Ambiance:** Studio cyclorama (`#14161C` gradient) with calibrated 3-point key/fill/rim lighting and soft floor contact shadows.
- **Floating Camera Bar:** Translucent pill bar anchored at bottom-center with direct buttons: `Front Chest`, `Back Center`, `Left Sleeve`, `Right Sleeve`, and `Full Body`.

### 1.3 Context-Sensitive Right Property Inspector (300px)
- **Object Selected:** Precision transforms ($X, Y, W, H, \theta$), typography controls (font picker, arched text curve angle slider, letter spacing, fill color).
- **No Selection (Garment Context):**
  - **Quick Color Swatches:** 12 curated streetwear garment tones (Off-White, Bone, Charcoal Heather, Vintage Black, Forest Green, Washed Cobalt, Terracotta).
  - **Fabric Preset Cards:** Combed Cotton, French Terry, Duck Canvas with instant visual feedback.
  - **Collapsible Disclosure:** "Advanced PBR Shader" with fine roughness/normal controls kept neatly tucked away.

### 1.4 Precision 2D Drawer / Resizable Split
- In "3D View" mode, the 2D canvas is hidden, giving users 100% immersive 3D freedom with direct-on-3D raycast dragging.
- In "Studio Split" mode, the screen is cleanly halved ($50\% / 50\%$) with a draggable central divider so the user can control the split ratio.

---

## 2. Realistic 3D Garment Asset Specification (Stage 3)

The procedural cylinder must be replaced with an authentic, sculpted garment geometry:
1. **Silhouette:** Boxy, relaxed oversized streetwear tee with natural shoulder drop.
2. **Sleeve Drape:** Sleeves drape naturally downward at $65^\circ-70^\circ$ following gravity, with soft elbow creases.
3. **Collar:** Ribbed circular collar band with realistic thickness, depth, and seam indentation.
4. **Fabric Physics & Folds:** Subtle gravity folds across the chest, under the armpits, and along the hemline.
5. **UV Integrity:** Seamless chest mapping ($[0..1]$ coordinate space) mapped to the conformed chest decal without stretching.
