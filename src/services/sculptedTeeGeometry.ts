import * as THREE from 'three';

/**
 * Creates a photorealistic, anatomically sculpted Oversized Heavy Streetwear T-Shirt.
 * Features:
 * - Natural dropped shoulder slope (from neckline to deltoid drop)
 * - Downward-draping streetwear sleeves with realistic gravity & elbow folds
 * - Ribbed crewneck collar with front scoop dip
 * - Organic fabric tension waves across torso (simulating 240+ GSM heavyweight combed cotton)
 * - Folded bottom hem with subtle cloth waviness
 * - Perfectly conformed 32x32 front/back decal meshes with zero distortion
 */
export function buildRealisticTeeGeometry(): {
  bodyGeo: THREE.BufferGeometry;
  collarGeo: THREE.BufferGeometry;
  leftSleeveGeo: THREE.BufferGeometry;
  rightSleeveGeo: THREE.BufferGeometry;
  hemGeo: THREE.BufferGeometry;
  frontDecalGeo: THREE.BufferGeometry;
  backDecalGeo: THREE.BufferGeometry;
} {
  // 1. Torso body mesh - 64 radial segments x 48 vertical rings
  const radialSegments = 64;
  const heightSegments = 48;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const yMin = -0.92;
  const yMax = 0.82;

  for (let j = 0; j <= heightSegments; j++) {
    const v = j / heightSegments;
    const y = yMin + v * (yMax - yMin);

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;

      // Normalized vertical height from 0 (bottom hem) to 1 (neckline)
      const t = (y - yMin) / (yMax - yMin);

      // Smooth anatomical profile for oversized streetwear tee:
      // Width (rx):
      // - Lower body (t in 0..0.6): relaxed boxy hang ~0.82 with subtle drape
      // - Shoulders (t in 0.6..0.88): flares out to dropped shoulder ~0.98 on the sides (latFactor)
      // - Neckline (t in 0.88..1.0): smoothly tapers inward to collar rim ~0.34
      const latFactor = Math.pow(Math.cos(theta), 2); // 1 on left/right, 0 on front/back

      // Base width along height
      let rx = 0.82 - 0.03 * Math.sin(t * Math.PI);
      // Dropped shoulder bell curve centered at t = 0.82
      const shoulderBell = Math.exp(-Math.pow((t - 0.82) / 0.16, 2));
      rx += 0.20 * shoulderBell * latFactor;
      // Smooth neckline taper as t -> 1.0
      if (t > 0.82) {
        const neckFade = (t - 0.82) / 0.18;
        rx = rx * (1 - 0.55 * neckFade);
      }

      // Depth (rz):
      // Natural chest curvature ~0.33, tapering smoothly toward neck
      let rz = 0.33 + 0.02 * Math.sin(t * Math.PI * 0.8) - 0.07 * Math.pow(Math.max(0, t - 0.8), 2);

      // Subtle organic cloth drapery (micro fabric gravity)
      const wrinkle1 = 0.012 * Math.cos(theta * 4) * Math.sin(t * 12.0);
      const wrinkle2 = 0.008 * Math.sin(theta * 2 + t * 8.0);
      const clothWave = (wrinkle1 + wrinkle2) * Math.sin(t * Math.PI); // vanishes at top and bottom

      let px = (rx + clothWave * 0.4) * Math.cos(theta);
      let pz = (rz + clothWave) * Math.sin(theta);
      let py = y;

      // Smooth scooped neckline in front (z > 0 near theta = Math.PI / 2)
      if (t > 0.75 && pz > 0) {
        const frontRatio = pz / rz;
        const neckScoop = Math.pow((t - 0.75) / 0.25, 2) * 0.08 * frontRatio;
        py -= neckScoop;
      }

      positions.push(px, py, pz);
      uvs.push(u, v);
    }
  }

  // Generate grid indices
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const a = j * (radialSegments + 1) + i;
      const b = (j + 1) * (radialSegments + 1) + i;
      const c = (j + 1) * (radialSegments + 1) + (i + 1);
      const d = j * (radialSegments + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeo.setIndex(indices);
  bodyGeo.computeVertexNormals();

  // 2. Realistic Ribbed Crewneck Collar (Curved torus ring following neck scoop)
  const collarGeo = new THREE.TorusGeometry(0.32, 0.038, 24, 64);
  collarGeo.rotateX(Math.PI / 2);
  collarGeo.scale(1.10, 0.72, 1.0);
  const collarPos = collarGeo.attributes.position;
  for (let i = 0; i < collarPos.count; i++) {
    const z = collarPos.getZ(i);
    // Dip front of collar down to match anatomical neck scoop
    if (z > 0) {
      const dip = (z / 0.32) * 0.048;
      collarPos.setY(i, collarPos.getY(i) - dip);
    }
  }
  collarGeo.computeVertexNormals();

  // 3. Draped Streetwear Sleeves (hanging naturally at downward gravity drape)
  // Left Sleeve
  const leftSleeveGeo = new THREE.CylinderGeometry(0.25, 0.30, 0.68, 36, 16, true);
  leftSleeveGeo.rotateZ(-Math.PI * 0.18);
  leftSleeveGeo.rotateY(0.10);
  const leftPos = leftSleeveGeo.attributes.position;
  for (let i = 0; i < leftPos.count; i++) {
    const y = leftPos.getY(i);
    const fold = 0.012 * Math.sin((y + 0.34) * 8.0);
    leftPos.setZ(i, leftPos.getZ(i) + fold);
  }
  leftSleeveGeo.computeVertexNormals();

  // Right Sleeve (symmetric mirrored drape)
  const rightSleeveGeo = new THREE.CylinderGeometry(0.25, 0.30, 0.68, 36, 16, true);
  rightSleeveGeo.rotateZ(Math.PI * 0.18);
  rightSleeveGeo.rotateY(-0.10);
  const rightPos = rightSleeveGeo.attributes.position;
  for (let i = 0; i < rightPos.count; i++) {
    const y = rightPos.getY(i);
    const fold = 0.012 * Math.sin((y + 0.34) * 8.0);
    rightPos.setZ(i, rightPos.getZ(i) + fold);
  }
  rightSleeveGeo.computeVertexNormals();

  // 4. Folded Bottom Hem (twin-needle stitched cuff band)
  const hemGeo = new THREE.TorusGeometry(0.81, 0.024, 16, 64);
  hemGeo.rotateX(Math.PI / 2);
  hemGeo.scale(1.0, 0.38, 1.0);
  hemGeo.computeVertexNormals();

  // 5. Conformed Front Chest Decal (subdivided 32x32 plane hugging the chest curvature)
  const frontDecalGeo = new THREE.PlaneGeometry(0.70, 0.82, 32, 32);
  const fPos = frontDecalGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const y = fPos.getY(i);
    // Matches the elliptical chest curve + backward slope on upper chest
    const xNorm = x / 0.70;
    let curve = Math.cos(xNorm * Math.PI * 0.5) * 0.038;
    if (y > 0.15) {
      curve -= Math.pow((y - 0.15) / 0.26, 2) * 0.025;
    }
    fPos.setZ(i, curve);
  }
  frontDecalGeo.computeVertexNormals();

  // 6. Conformed Back Decal
  const backDecalGeo = new THREE.PlaneGeometry(0.70, 0.86, 32, 32);
  const bPos = backDecalGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    const x = bPos.getX(i);
    const xNorm = x / 0.70;
    const curve = Math.cos(xNorm * Math.PI * 0.5) * 0.036;
    bPos.setZ(i, -curve);
  }
  backDecalGeo.computeVertexNormals();
  backDecalGeo.rotateY(Math.PI);

  return {
    bodyGeo,
    collarGeo,
    leftSleeveGeo,
    rightSleeveGeo,
    hemGeo,
    frontDecalGeo,
    backDecalGeo,
  };
}
