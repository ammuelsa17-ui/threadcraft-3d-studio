# THREADCRAFT 3D STUDIO — VISUAL & UX AUDIT (STAGE 1)

**Date:** November 20, 2026  
**Auditor:** Principal Product Designer, Senior 3D Graphics Artist & Creative UX Architect  
**Subject:** ThreadCraft 3D Studio (Pre-Redesign Baseline)  
**Evidence Artifacts:**
- Desktop Split View: [`audit_01_split_view.png`](file:///Users/harshini/.gemini/antigravity/brain/b2fc93f2-44a9-4376-af0f-f1af03078654/audit_01_split_view.png)
- Full 3D View: [`audit_02_3d_only.png`](file:///Users/harshini/.gemini/antigravity/brain/b2fc93f2-44a9-4376-af0f-f1af03078654/audit_02_3d_only.png)
- 2D Canvas View: [`audit_03_2d_only.png`](file:///Users/harshini/.gemini/antigravity/brain/b2fc93f2-44a9-4376-af0f-f1af03078654/audit_03_2d_only.png)
- Product Selector Modal: [`audit_04_product_modal.png`](file:///Users/harshini/.gemini/antigravity/brain/b2fc93f2-44a9-4376-af0f-f1af03078654/audit_04_product_modal.png)

---

## 1. Executive Summary & Aesthetic Rating

| Evaluation Metric | Baseline Score | Primary Root Cause |
|---|:---:|---|
| **Overall Visual Quality** | **4 / 10** | Technical dashboard appearance rather than high-end creative studio. |
| **Interface Aesthetics** | **5 / 10** | Crowded toolbar, harsh high-contrast borders, dense technical sliders. |
| **3D Product Realism** | **2 / 10** | Procedural geometry resembles a rigid cylinder with rigid conical sleeves. |
| **Workspace Organization** | **4 / 10** | 3D model crammed into narrow vertical strip; PBR sidebar occupies 20% persistently. |
| **Control Readability & Focus** | **5 / 10** | Controls compete for attention; empty states misleading (0 layers reported on load). |

---

## 2. Granular Flaws & UX Friction Points

### 2.1 The 3D Product Presentation
1. **Unrealistic Procedural Silhouette:**
   - The T-shirt torso is an extruded cylinder with no organic waist suppression, shoulder slope, or fabric gravity.
   - The sleeves protrude at rigid $35^\circ$ angles like robot horns rather than draping downward naturally over the arms.
   - The collar is a flat planar cut rather than an authentic ribbed crewneck band with stitch lines.
2. **Poor Contrast & Lighting:**
   - The default charcoal tee (`#1E212D`) blends directly into the `#07090E` dark viewport background.
   - The lighting lacks rim separation, making the silhouette blend into the void.
3. **Severe Camera Cropping:**
   - The default camera is positioned at $(0, 0, 2.1)$, framing only the center chest and slicing off the collar and lower hem completely.

### 2.2 Workspace Layout & Ergonomics
1. **The "Cramped 3D Strip" in Split View:**
   - The 2D canvas occupies 55% of the viewport width.
   - The persistent 360px PBR Shader Studio sidebar occupies 22% of the screen.
   - The 3D viewport is suffocated into an awkward vertical strip (~23% width), severely hindering orbit interaction.
2. **Persistent Shader Studio Dominance:**
   - Instead of prioritizing creative tools (Text, Graphics, Layout, Colors), the right sidebar is dominated by scientific PBR sliders (Roughness, Metallic, Weave Normal Depth, Clearcoat).
   - In "2D Only" mode, the 3D Shader Studio remains open on the right, eating screen real estate.
3. **Top Toolbar Crowding:**
   - 17 buttons (fonts, shapes, stamps, uploads, undo/redo, view modes) are laid out in a single crowded row.
   - The "Upload Image" button and camera pills collide and clip on viewports under 1600px width.

### 2.3 Layer Stack & State Inconsistency
1. **Misleading Empty State:**
   - On initial load, the layers panel displays `"0 TOTAL - No layers on this zone"` despite the default template ("MONOLITH") clearly visible on the canvas, because the layer list was not synced until an active selection event fired.

---

## 3. Guiding Principles for the Redesign

1. **3D Hero First:**
   - The 3D garment must be the spacious, central centerpiece of the studio at all times.
2. **Spline & Figma Inspired Design Language:**
   - Clean, neutral graphite and warm-slate tones (`#121316`, `#18191E`, `#22242B`).
   - Floating translucent toolbars and inspectors (`backdrop-blur-xl`).
   - Generous breathing room and zero unnecessary borders.
3. **Authentic Garment Geometry:**
   - Replace procedural cylinders with a sculpted, realistic draped streetwear tee featuring organic folds, realistic arm drape, ribbed collar, and proper fabric weight.
4. **Context-Sensitive Right Inspector:**
   - Collapse the heavy PBR shader controls into an expandable "Material & Fabric" drawer.
   - The right inspector should dynamically surface contextual properties based on selection (e.g. Text Typography when text is selected; Garment Color & Fabric when background/mesh is clicked).
