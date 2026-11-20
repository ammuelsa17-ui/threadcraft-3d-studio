import { describe, it, expect } from 'vitest';
import { calculatePrintResolution, PRINT_DPI_PRESETS } from '../services/printResolution';
import { PRODUCT_CATALOG } from '../types/product';

describe('Production Print DPI Engine', () => {
  it('correctly calculates 300 DPI for standard T-Shirt front chest (35 x 42 cm)', () => {
    const res = calculatePrintResolution(35, 42, 300);

    // 35 / 2.54 * 300 = 4133.858 -> 4134
    // 42 / 2.54 * 300 = 4960.629 -> 4961
    expect(res.widthPx).toBe(4134);
    expect(res.heightPx).toBe(4961);
    expect(res.physicalWidthInches).toBeCloseTo(13.78, 1);
    expect(res.physicalHeightInches).toBeCloseTo(16.535, 1);
    expect(res.totalMegapixels).toBeGreaterThan(20); // ~20.51 MP
  });

  it('correctly calculates 150 DPI proofing resolution for T-Shirt front chest', () => {
    const res = calculatePrintResolution(35, 42, 150);
    expect(res.widthPx).toBe(2067);
    expect(res.heightPx).toBe(2480);
  });

  it('correctly calculates 72 DPI screen preview for T-Shirt front chest', () => {
    const res = calculatePrintResolution(35, 42, 72);
    expect(res.widthPx).toBe(992);
    expect(res.heightPx).toBe(1191);
  });

  it('correctly calculates 300 DPI for Mug panoramic wrap (20 x 9.5 cm)', () => {
    const res = calculatePrintResolution(20, 9.5, 300);
    // 20 / 2.54 * 300 = 2362.2 -> 2362
    // 9.5 / 2.54 * 300 = 1122.04 -> 1122
    expect(res.widthPx).toBe(2362);
    expect(res.heightPx).toBe(1122);
  });

  it('correctly calculates 300 DPI for Dad Cap front embroidery (12 x 6.5 cm)', () => {
    const res = calculatePrintResolution(12, 6.5, 300);
    // 12 / 2.54 * 300 = 1417.32 -> 1417
    // 6.5 / 2.54 * 300 = 767.71 -> 768
    expect(res.widthPx).toBe(1417);
    expect(res.heightPx).toBe(768);
  });

  it('validates every single print zone across all 5 catalog products', () => {
    for (const [prodId, prod] of Object.entries(PRODUCT_CATALOG)) {
      expect(prod.zones.length).toBeGreaterThan(0);
      for (const zone of prod.zones) {
        expect(zone.physicalWidthCm).toBeGreaterThan(0);
        expect(zone.physicalHeightCm).toBeGreaterThan(0);

        const res300 = calculatePrintResolution(zone.physicalWidthCm, zone.physicalHeightCm, 300);
        expect(res300.widthPx).toBeGreaterThan(400);
        expect(res300.heightPx).toBeGreaterThan(400);
        expect(res300.aspectRatio).toBeCloseTo(zone.physicalWidthCm / zone.physicalHeightCm, 2);
      }
    }
  });

  it('throws on invalid non-positive physical dimensions or DPI', () => {
    expect(() => calculatePrintResolution(0, 42, 300)).toThrow();
    expect(() => calculatePrintResolution(35, -5, 300)).toThrow();
    expect(() => calculatePrintResolution(35, 42, 0)).toThrow();
  });
});
