export interface PrintResolutionResult {
  widthPx: number;
  heightPx: number;
  physicalWidthCm: number;
  physicalHeightCm: number;
  physicalWidthInches: number;
  physicalHeightInches: number;
  dpi: number;
  totalMegapixels: number;
  aspectRatio: number;
}

/**
 * Calculates exact production print resolution from physical dimensions in centimeters and target DPI.
 * Standard formula: Pixels = (Centimeters / 2.54) * DPI
 */
export function calculatePrintResolution(
  physicalWidthCm: number,
  physicalHeightCm: number,
  dpi: number = 300
): PrintResolutionResult {
  if (physicalWidthCm <= 0 || physicalHeightCm <= 0) {
    throw new Error('Physical dimensions must be greater than zero.');
  }
  if (dpi <= 0) {
    throw new Error('DPI must be greater than zero.');
  }

  const physicalWidthInches = physicalWidthCm / 2.54;
  const physicalHeightInches = physicalHeightCm / 2.54;

  const widthPx = Math.round(physicalWidthInches * dpi);
  const heightPx = Math.round(physicalHeightInches * dpi);

  const totalMegapixels = Number(((widthPx * heightPx) / 1000000).toFixed(2));
  const aspectRatio = Number((widthPx / heightPx).toFixed(4));

  return {
    widthPx,
    heightPx,
    physicalWidthCm,
    physicalHeightCm,
    physicalWidthInches: Number(physicalWidthInches.toFixed(3)),
    physicalHeightInches: Number(physicalHeightInches.toFixed(3)),
    dpi,
    totalMegapixels,
    aspectRatio,
  };
}

export const PRINT_DPI_PRESETS = [
  {
    dpi: 300,
    name: '300 DPI Master Print',
    description: 'Direct-To-Garment (DTG), Screenprint, Sublimation master file',
    badge: 'PRODUCTION READY',
  },
  {
    dpi: 150,
    name: '150 DPI Digital Proof',
    description: 'High-speed transfer proof and large format print testing',
    badge: 'PROOF QUALITY',
  },
  {
    dpi: 72,
    name: '72 DPI Screen Preview',
    description: 'E-commerce web catalog mockup and social preview',
    badge: 'WEB DRAFT',
  },
] as const;
