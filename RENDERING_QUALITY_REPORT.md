# RENDERING QUALITY & PBR SHADER REPORT

**Target Platform:** WebGL 2 (Three.js r173 + React Three Fiber)  
**Tone Mapping:** ACES Filmic Tone Mapping (Exposure: 1.1)  
**Color Space:** sRGB Color Space (`outputColorSpace = THREE.SRGBColorSpace`)

---

## 1. Physically Based Material Pipeline

ThreadCraft implements high-fidelity PBR rendering using Three.js `MeshPhysicalMaterial`:

### 1.1 Shader Property Profiles

| Fabric / Material Preset | Base Color Strategy | Roughness | Metalness | Clearcoat | Procedural Normal Pattern |
|--------------------------|---------------------|:---------:|:---------:|:---------:|---------------------------|
| **Combed Cotton** | Hex Tint Palette | 0.85 | 0.05 | 0.00 | $512 \times 512$ fine knit interlocking loops |
| **French Terry** | Hex Tint Palette | 0.92 | 0.02 | 0.00 | $512 \times 512$ diagonal loop knit & heavy ribs |
| **Duck Canvas** | Hex Tint Palette | 0.95 | 0.00 | 0.00 | $512 \times 512$ coarse basket cross-hatch |
| **Chino Twill** | Hex Tint Palette | 0.88 | 0.04 | 0.00 | $512 \times 512$ $45^\circ$ diagonal chino ribs |
| **Glazed Ceramic** | Hex Tint Palette | 0.18 | 0.05 | 0.85 | Ultra-smooth glassy glaze micro-noise |

---

## 2. Studio Lighting & Shadow Rig

The studio environment uses a calibrated 3-point softbox lighting configuration:
1. **Key Soft Light:** Directional light at $(3.5, 4.5, 3.5)$ with $2048 \times 2048$ shadow map resolution and bias $-0.0001$.
2. **Fill Diffuse Light:** Directional light at $(-3.5, 2.0, 2.0)$ softening contrast ratios on garment side seams.
3. **Rim / Backlight:** Directional light at $(0, 4.0, -4.0)$ tinted to match ambient lighting presets (Studio Softbox, Sunset Warmth, Cyber Neon, Neutral Daylight) for silhouette edge separation.
4. **Contact Shadow Floor:** `ContactShadows` plane at $Y = -1.05$ with $1.8\text{ blur}$ and $0.65\text{ opacity}$, grounding the model realistically without harsh clipping.
