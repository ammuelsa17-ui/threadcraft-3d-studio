# EXPORT ENGINE VERIFICATION & INTEGRITY REPORT

**Component:** `src/services/exportVerifier.ts`, `src/services/printResolution.ts`, `src/components/panels/ExportModal.tsx`

---

## 1. Export Modalities & Target Specifications

| Export Target | Engine Output | Validated Dimensions | Alpha Transparency | Supported Use Case |
|---------------|:-------------:|:--------------------:|:------------------:|:------------------:|
| **300 DPI Production Master** | Transparent PNG | $4134 \times 4961\text{ px}$ | **YES (Alpha Channel Validated)** | Direct-To-Garment (DTG), Screenprint, Sublimation |
| **150 DPI Proofing Master** | Transparent PNG | $2067 \times 2480\text{ px}$ | **YES (Alpha Channel Validated)** | Digital transfers & thermal proofs |
| **72 DPI Web Catalog Draft** | Transparent PNG | $992 \times 1191\text{ px}$ | **YES (Alpha Channel Validated)** | E-commerce product listing & social preview |
| **Vector Curves (SVG)** | XML Document | Vector viewBox | **YES (Native Vector Curves)** | Vinyl plotters, laser cutters, embroidery pathing |
| **3D Studio Mockup Render** | Photographic PNG | $1920 \times 1080\text{ px}$ | Studio Background & Shadows | Catalog presentation & marketing mockups |
| **Studio Project Backup** | `.threadcraft` (JSON) | Validated JSON Schema | Preserves all layers & materials | Re-import and non-destructive archival |

---

## 2. Programmatic Verification Methodology

1. **Alpha Channel Integrity Check:**
   `ExportVerifier.verifyPng()` samples pixel memory across edge insets and bounding boxes, confirming that transparent margins contain $A = 0$ while artwork shapes and typography render with opaque alpha ($A = 255$).
2. **Dimension Match Assurance:**
   The output pixel dimensions are guaranteed by the physical resolution equation:
   $$\text{Pixels} = \text{round}\left(\frac{\text{cm}}{2.54} \times \text{DPI}\right)$$
3. **SVG Vector Integrity:**
   `ExportVerifier.verifySvg()` confirms valid XML headers, `viewBox` coordinates, and vector path nodes for all shapes and typography.
4. **Project Schema Round-Trip:**
   `ExportVerifier.verifyProjectBackup()` verifies that projects serialized to disk contain complete canvas JSON trees, material settings, and product IDs that can be re-imported without data loss.
