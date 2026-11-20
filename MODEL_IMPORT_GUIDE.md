# BLENDER & EXTERNAL 3D MODEL IMPORT GUIDE

**Target Engine:** ThreadCraft 3D Studio (Three.js r173 / WebGL 2)  
**Supported Asset Formats:** `.glb` (Binary glTF 2.0 recommended) or `.gltf`

---

## 1. Asset Preparation Checklist in Blender

To guarantee compatibility with ThreadCraft's PBR engine and texture projection system, all models authored in Blender, Marvelous Designer, or Clo3D must adhere to these specifications:

### 1.1 Geometry & Topology
- **Polygon Count:** Keep garments between **15,000 and 80,000 triangles**. High-density meshes (> 500,000 vertices) cause memory pressure on mobile or integrated GPUs.
- **Scale:** Apply all transforms in Blender (`Ctrl + A` $\rightarrow$ *All Transforms*). Models should be centered at origin $(0, 0, 0)$ with human height (e.g., $1.6 - 1.8\text{ meters}$).
- **Normals:** Ensure normals are uniform and pointing outward (`Mesh` $\rightarrow$ `Normals` $\rightarrow$ `Recalculate Outside`).

### 1.2 UV Unwrapping & Seams
- **Primary Design Surface:** The front chest or printable zone must occupy UV space $(0, 0)$ to $(1, 1)$ without overlapping seams or mirror stretching.
- **Seam Placement:** Place seams along authentic garment construction lines (underarms, shoulder ridges, side hems).

### 1.3 Material & Shader Configuration
- Use the **Principled BSDF** shader in Blender.
- Supported channels:
  - Base Color (can be overridden by ThreadCraft garment color palette)
  - Roughness map
  - Metallic map
  - Normal map (DirectX or OpenGL format)
  - Ambient Occlusion (AO) baked into the red channel or separate texture

---

## 2. Exporting glTF/GLB from Blender

When exporting from Blender (`File` $\rightarrow$ `Export` $\rightarrow$ `glTF 2.0 (.glb)`):
1. **Format:** Select `glTF Binary (.glb)`.
2. **Include:** Check `Selected Objects` (omit cameras, lights, and rig bones unless animating).
3. **Geometry:**
   - Check `Apply Modifiers`
   - Check `UVs`
   - Check `Normals`
   - Check `Tangents` (if using baked normal maps)
4. **Compression:** Optional Draco or Meshopt compression supported.

---

## 3. Automated Validation in ThreadCraft

Upon loading any custom `.glb` model into ThreadCraft:
1. `ModelValidator.validate(gltf)` scans the hierarchy.
2. Checks for `attributes.uv` (rejects unmapped models with actionable error messages).
3. Normalizes bounding box dimensions to match the standard viewport scale.
4. Auto-binds the dynamic PBR shader and live artwork texture.
