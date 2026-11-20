import * as THREE from 'three';
import { FabricPreset } from '../types/product';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralNormalMap(fabricType: FabricPreset): THREE.CanvasTexture {
  const cacheKey = `normal_${fabricType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Default flat normal: RGB (128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  if (fabricType === 'cotton') {
    // Fine knit micro-loops
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const pattern = Math.sin((x / 2.0) * Math.PI) * Math.cos((y / 3.0) * Math.PI);
        const noise = (Math.random() - 0.5) * 12;
        const nx = 128 + Math.floor(pattern * 24 + noise);
        const ny = 128 + Math.floor(pattern * 24 + noise);
        data[idx] = Math.max(0, Math.min(255, nx));
        data[idx + 1] = Math.max(0, Math.min(255, ny));
        data[idx + 2] = 255;
      }
    }
  } else if (fabricType === 'french_terry') {
    // Diagonal loops & heavier ribs
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const diag = Math.sin(((x + y) / 4.0) * Math.PI);
        const loop = Math.cos((y / 4.0) * Math.PI);
        const bump = diag * 0.7 + loop * 0.3;
        const nx = 128 + Math.floor(bump * 38);
        const ny = 128 + Math.floor(bump * 38);
        data[idx] = Math.max(0, Math.min(255, nx));
        data[idx + 1] = Math.max(0, Math.min(255, ny));
        data[idx + 2] = 240;
      }
    }
  } else if (fabricType === 'canvas') {
    // Coarse basket weave (interlocking warp and weft)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const warp = Math.sin((x / 6.0) * Math.PI);
        const weft = Math.sin((y / 6.0) * Math.PI);
        const cell = Math.floor(x / 12) + Math.floor(y / 12);
        const weave = cell % 2 === 0 ? warp * 45 : weft * 45;
        const noise = (Math.random() - 0.5) * 16;
        data[idx] = Math.max(0, Math.min(255, 128 + weave + noise));
        data[idx + 1] = Math.max(0, Math.min(255, 128 - weave + noise));
        data[idx + 2] = 230;
      }
    }
  } else if (fabricType === 'twill') {
    // 45-degree diagonal ribs (chino/denim)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const diagonal = Math.sin(((x * 1.4 - y * 1.4) / 4.0) * Math.PI);
        const cross = Math.sin(((x + y) / 8.0) * Math.PI) * 0.2;
        const val = diagonal + cross;
        data[idx] = Math.max(0, Math.min(255, 128 + Math.floor(val * 35)));
        data[idx + 1] = Math.max(0, Math.min(255, 128 + Math.floor(val * 35)));
        data[idx + 2] = 245;
      }
    }
  } else if (fabricType === 'ceramic') {
    // Subtle glassy glaze noise
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const micro = (Math.random() - 0.5) * 6;
        data[idx] = 128 + micro;
        data[idx + 1] = 128 + micro;
        data[idx + 2] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const repeatCount = fabricType === 'ceramic' ? 4 : fabricType === 'canvas' ? 18 : 26;
  texture.repeat.set(repeatCount, repeatCount);
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
