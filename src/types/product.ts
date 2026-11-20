export type ProductId = 'tshirt' | 'hoodie' | 'mug' | 'totebag' | 'cap';

export type FabricPreset = 'cotton' | 'french_terry' | 'canvas' | 'ceramic' | 'twill' | 'leather';

export interface PrintZoneConfig {
  id: string;
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  physicalWidthCm: number;
  physicalHeightCm: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface MaterialSettings {
  roughness: number;
  metalness: number;
  normalScale: number;
  fabricType: FabricPreset;
  clearcoat: number;
  bumpScale: number;
  ambientIntensity: number;
  environmentPreset: 'studio' | 'sunset' | 'cyber' | 'neutral';
}

export interface ProductConfig {
  id: string;
  name: string;
  subtitle: string;
  category: 'Apparel' | 'Drinkware' | 'Accessories';
  defaultColor: string;
  colorPalette: string[];
  defaultMaterial: MaterialSettings;
  zones: PrintZoneConfig[];
  initialCamera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  modelUrl?: string;
  isCustom?: boolean;
}

export interface CustomProductRecord extends ProductConfig {
  createdAt: number;
}

export const PRODUCT_CATALOG: Record<ProductId, ProductConfig> = {
  tshirt: {
    id: 'tshirt',
    name: 'Oversized Heavy Tee',
    subtitle: 'Heavyweight 240 GSM Combed Cotton',
    category: 'Apparel',
    defaultColor: '#f4f4f6',
    colorPalette: [
      '#f4f4f6', // Studio Bone White (Default)
      '#e2e8f0', // Heather Ash
      '#1e212d', // Heavy Charcoal Noir
      '#0f172a', // Washed Midnight
      '#2d3748', // Mineral Slate
      '#3b82f6', // Royal Cobalt
      '#10b981', // Sage Emerald
      '#f59e0b', // Vintage Ochre
      '#ef4444', // Crimson Washed
      '#8b5cf6', // Lilac Violet
      '#78350f', // Warm Amber
      '#047857', // Forest Pine
    ],
    defaultMaterial: {
      roughness: 0.85,
      metalness: 0.05,
      normalScale: 1.2,
      fabricType: 'cotton',
      clearcoat: 0.0,
      bumpScale: 0.08,
      ambientIntensity: 0.9,
      environmentPreset: 'studio',
    },
    zones: [
      {
        id: 'front',
        name: 'Front Chest',
        description: 'Primary front print area (35 × 42 cm)',
        canvasWidth: 1000,
        canvasHeight: 1200,
        physicalWidthCm: 35,
        physicalHeightCm: 42,
        cameraPosition: [0, 0, 3.2],
        cameraTarget: [0, -0.05, 0],
      },
      {
        id: 'back',
        name: 'Back Center',
        description: 'Upper back display area (35 × 45 cm)',
        canvasWidth: 1000,
        canvasHeight: 1280,
        physicalWidthCm: 35,
        physicalHeightCm: 45,
        cameraPosition: [0, 0, -3.2],
        cameraTarget: [0, -0.05, 0],
      },
      {
        id: 'left_sleeve',
        name: 'Left Sleeve',
        description: 'Left shoulder badge zone (10 × 10 cm)',
        canvasWidth: 800,
        canvasHeight: 800,
        physicalWidthCm: 10,
        physicalHeightCm: 10,
        cameraPosition: [-3.2, 0.4, 0],
        cameraTarget: [-1.2, 0.4, 0],
      },
      {
        id: 'right_sleeve',
        name: 'Right Sleeve',
        description: 'Right shoulder badge zone (10 × 10 cm)',
        canvasWidth: 800,
        canvasHeight: 800,
        physicalWidthCm: 10,
        physicalHeightCm: 10,
        cameraPosition: [3.2, 0.4, 0],
        cameraTarget: [1.2, 0.4, 0],
      },
    ],
    initialCamera: {
      position: [0, 0.1, 3.2],
      target: [0, -0.05, 0],
      fov: 38,
    },
  },

  hoodie: {
    id: 'hoodie',
    name: 'Oversized Street Hoodie',
    subtitle: '450 GSM Heavy French Terry Cotton',
    category: 'Apparel',
    defaultColor: '#18181b',
    colorPalette: [
      '#18181b', // Washed Black
      '#e4e4e7', // Stone Bone
      '#78716c', // Warm Taupe
      '#27272a', // Ash
      '#1e3a8a', // Midnight Navy
      '#14532d', // Pine Forest
      '#7f1d1d', // Burgundy
      '#854d0e', // Desert Khaki
    ],
    defaultMaterial: {
      roughness: 0.92,
      metalness: 0.02,
      normalScale: 1.5,
      fabricType: 'french_terry',
      clearcoat: 0.0,
      bumpScale: 0.12,
      ambientIntensity: 0.9,
      environmentPreset: 'studio',
    },
    zones: [
      {
        id: 'front',
        name: 'Front Chest',
        description: 'Upper chest above kangaroo pocket (32 × 38 cm)',
        canvasWidth: 1000,
        canvasHeight: 1100,
        physicalWidthCm: 32,
        physicalHeightCm: 38,
        cameraPosition: [0, 0.1, 3.4],
        cameraTarget: [0, 0, 0],
      },
      {
        id: 'back',
        name: 'Back Statement',
        description: 'Full oversize back canvas (38 × 48 cm)',
        canvasWidth: 1000,
        canvasHeight: 1260,
        physicalWidthCm: 38,
        physicalHeightCm: 48,
        cameraPosition: [0, 0.1, -3.4],
        cameraTarget: [0, 0, 0],
      },
      {
        id: 'hood',
        name: 'Hood Center',
        description: 'Crown of hood embroidery (12 × 12 cm)',
        canvasWidth: 800,
        canvasHeight: 800,
        physicalWidthCm: 12,
        physicalHeightCm: 12,
        cameraPosition: [0, 1.8, 1.6],
        cameraTarget: [0, 1.1, 0],
      },
    ],
    initialCamera: {
      position: [0, 0.2, 3.4],
      target: [0, 0, 0],
      fov: 40,
    },
  },

  mug: {
    id: 'mug',
    name: 'Ceramic Studio Mug',
    subtitle: '11oz Glazed Stoneware with C-Handle',
    category: 'Drinkware',
    defaultColor: '#ffffff',
    colorPalette: [
      '#ffffff', // Pristine Glaze
      '#0f172a', // Matte Obsidian
      '#f8fafc', // Cream White
      '#334155', // Slate Ceramic
      '#be123c', // Glazed Ruby
      '#0284c7', // Aegean Blue
      '#059669', // Emerald Glaze
      '#eab308', // Warm Mustard
    ],
    defaultMaterial: {
      roughness: 0.18,
      metalness: 0.05,
      normalScale: 0.2,
      fabricType: 'ceramic',
      clearcoat: 0.85,
      bumpScale: 0.02,
      ambientIntensity: 1.0,
      environmentPreset: 'studio',
    },
    zones: [
      {
        id: 'wrap',
        name: 'Full 360° Wrap',
        description: 'Seamless panoramic mug surface (20 × 9.5 cm)',
        canvasWidth: 1600,
        canvasHeight: 760,
        physicalWidthCm: 20,
        physicalHeightCm: 9.5,
        cameraPosition: [0, 0.2, 2.4],
        cameraTarget: [0, 0, 0],
      },
      {
        id: 'front',
        name: 'Front Badge',
        description: 'Opposite handle display view (8 × 8 cm)',
        canvasWidth: 900,
        canvasHeight: 900,
        physicalWidthCm: 8,
        physicalHeightCm: 8,
        cameraPosition: [0, 0.1, 2.4],
        cameraTarget: [0, 0, 0],
      },
    ],
    initialCamera: {
      position: [0.8, 0.4, 2.2],
      target: [0, 0, 0],
      fov: 35,
    },
  },

  totebag: {
    id: 'totebag',
    name: 'Canvas Market Tote',
    subtitle: '12 oz Heavy Unbleached Cotton Canvas',
    category: 'Accessories',
    defaultColor: '#f5f5f4',
    colorPalette: [
      '#f5f5f4', // Natural Ecru
      '#1c1917', // Pitch Black
      '#78716c', // Raw Linen
      '#1e3a8a', // Nautical Indigo
      '#14532d', // Army Olive
      '#b91c1c', // Rust Red
    ],
    defaultMaterial: {
      roughness: 0.95,
      metalness: 0.0,
      normalScale: 1.8,
      fabricType: 'canvas',
      clearcoat: 0.0,
      bumpScale: 0.15,
      ambientIntensity: 0.95,
      environmentPreset: 'studio',
    },
    zones: [
      {
        id: 'front',
        name: 'Front Panel',
        description: 'Main body canvas print zone (30 × 34 cm)',
        canvasWidth: 1000,
        canvasHeight: 1150,
        physicalWidthCm: 30,
        physicalHeightCm: 34,
        cameraPosition: [0, -0.1, 2.8],
        cameraTarget: [0, -0.2, 0],
      },
      {
        id: 'back',
        name: 'Back Panel',
        description: 'Reverse body canvas print zone (30 × 34 cm)',
        canvasWidth: 1000,
        canvasHeight: 1150,
        physicalWidthCm: 30,
        physicalHeightCm: 34,
        cameraPosition: [0, -0.1, -2.8],
        cameraTarget: [0, -0.2, 0],
      },
    ],
    initialCamera: {
      position: [0, 0, 2.8],
      target: [0, -0.2, 0],
      fov: 38,
    },
  },

  cap: {
    id: 'cap',
    name: 'Unstructured Dad Cap',
    subtitle: '100% Chino Washed Cotton Twill',
    category: 'Accessories',
    defaultColor: '#27272a',
    colorPalette: [
      '#27272a', // Washed Charcoal
      '#f4f4f5', // Off-White
      '#1e3a8a', // College Navy
      '#15803d', // Tennis Green
      '#b45309', // Desert Ochre
      '#be123c', // Harvard Crimson
    ],
    defaultMaterial: {
      roughness: 0.88,
      metalness: 0.04,
      normalScale: 1.3,
      fabricType: 'twill',
      clearcoat: 0.0,
      bumpScale: 0.1,
      ambientIntensity: 0.95,
      environmentPreset: 'studio',
    },
    zones: [
      {
        id: 'front',
        name: 'Front Crown',
        description: 'Front two panels embroidery zone (12 × 6.5 cm)',
        canvasWidth: 1000,
        canvasHeight: 600,
        physicalWidthCm: 12,
        physicalHeightCm: 6.5,
        cameraPosition: [0, 0.2, 2.2],
        cameraTarget: [0, 0, 0],
      },
      {
        id: 'left_side',
        name: 'Left Side',
        description: 'Side panel embroidery (6 × 4 cm)',
        canvasWidth: 800,
        canvasHeight: 600,
        physicalWidthCm: 6,
        physicalHeightCm: 4,
        cameraPosition: [-2.2, 0.1, 0],
        cameraTarget: [0, 0, 0],
      },
    ],
    initialCamera: {
      position: [0.6, 0.4, 2.2],
      target: [0, 0, 0],
      fov: 35,
    },
  },
};
