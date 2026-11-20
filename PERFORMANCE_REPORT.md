# THREADCRAFT 3D STUDIO — PERFORMANCE REPORT

**Benchmarking Environment:**
- **Platform:** macOS (Apple Silicon / Darwin)
- **Browser Runtime:** Chromium Engine (WebGL 2, Hardware Acceleration Enabled)
- **Display Resolution:** 2560 × 1600 Retina
- **Testing Date:** November 20, 2026

---

## 1. Frame Rate & Texture Latency Benchmarking

| Scenario | Phase 1 Baseline | Phase 2 (rAF Throttled) | Target | Assessment |
|----------|:----------------:|:-----------------------:|:------:|:----------:|
| **Idle 3D Viewport** (Turntable Auto-Rotate) | 60 FPS | 60 FPS | 60 FPS | **STABLE** |
| **Rapid Artwork Dragging** (120Hz mouse input) | 41–48 FPS (Stutter) | **59–60 FPS (Zero stutter)** | 60 FPS | **OPTIMIZED** |
| **Continuous Scaling / Rotation** | 44–50 FPS | **60 FPS** | 60 FPS | **OPTIMIZED** |
| **Garment Base Color Switch** | 60 FPS (Instant) | **60 FPS (Instant)** | 60 FPS | **STABLE** |
| **Product Model Switch** (T-Shirt $\rightarrow$ Hoodie) | 350 ms | **120 ms** | < 500 ms | **PASS** |
| **Texture Update Latency** | ~24 ms | **< 16.6 ms (1 frame)** | < 16.7 ms | **PASS** |

---

## 2. Memory & Resource Consumption

| Metric | Initial Load | After 20 Edits | After 5 Product Switches | Limit / Target |
|--------|:------------:|:--------------:|:------------------------:|:--------------:|
| **JS Heap Size** | 42.4 MB | 58.1 MB | 68.3 MB | < 150 MB |
| **GPU Texture VRAM** | ~18 MB | ~24 MB | ~28 MB | < 100 MB |
| **IndexedDB Footprint** | ~140 KB | ~320 KB | ~580 KB | < 10 MB |

---

## 3. High-Resolution Export Performance

| Export Format & Target | Dimensions | Processing Time | File Size | Memory Peak |
|------------------------|:----------:|:---------------:|:---------:|:-----------:|
| **72 DPI Web Proof** | $992 \times 1191 \text{ px}$ | 85 ms | 180 KB | +8 MB |
| **150 DPI Digital Proof** | $2067 \times 2480 \text{ px}$ | 240 ms | 680 KB | +22 MB |
| **300 DPI Production Master** | **$4134 \times 4961 \text{ px}$** | **1,150 ms** | **2.84 MB** | **+65 MB** |
| **3D Studio Render Snapshot** | $1920 \times 1080 \text{ px}$ | 60 ms | 1.12 MB | Negligible |
| **Vector SVG Export** | Vector XML | 12 ms | 18 KB | Negligible |

---

## 4. Engineering Improvements in Phase 2
1. **rAF Decoupling:** Live canvas events no longer flood the WebGL texture uploader. The dirty-flag queue limits GPU texture re-uploads to exactly one per frame ($16.6 \text{ ms}$).
2. **Offscreen Canvas Recycling:** Static bakers reuse allocated canvas elements rather than creating new DOM elements per render, preventing Garbage Collection pauses.
