import * as THREE from 'three';
import { ProductId } from '../types/product';
import { buildRealisticTeeGeometry } from './sculptedTeeGeometry';

export interface ProductMeshBundle {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  frontDecalMesh?: THREE.Mesh;
  backDecalMesh?: THREE.Mesh;
  leftDecalMesh?: THREE.Mesh;
  rightDecalMesh?: THREE.Mesh;
  hoodDecalMesh?: THREE.Mesh;
  wrapDecalMesh?: THREE.Mesh;
  accentMeshes: THREE.Mesh[];
}

/**
 * Creates an anatomically shaped 3D T-Shirt mesh with crewneck collar, draped body, ribbing, and conformed decals.
 */
export function createTShirtModel(): ProductMeshBundle {
  const group = new THREE.Group();
  group.name = 'TShirtProduct';

  const {
    bodyGeo,
    collarGeo,
    leftSleeveGeo,
    rightSleeveGeo,
    hemGeo,
    frontDecalGeo,
    backDecalGeo,
  } = buildRealisticTeeGeometry();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // Torso / Body mesh with realistic drape & organic folds
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Ribbed Crewneck Collar
  const collarMesh = new THREE.Mesh(collarGeo, bodyMat);
  collarMesh.position.set(0, 0.75, 0.02);
  collarMesh.rotation.x = Math.PI * 0.06;
  collarMesh.castShadow = true;
  group.add(collarMesh);

  // Draped Left Sleeve
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, bodyMat);
  leftSleeve.position.set(-0.96, 0.44, 0.02);
  leftSleeve.castShadow = true;
  group.add(leftSleeve);

  // Draped Right Sleeve
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, bodyMat);
  rightSleeve.position.set(0.96, 0.44, 0.02);
  rightSleeve.castShadow = true;
  group.add(rightSleeve);

  // Conformed Front Artwork Decal
  const frontDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const frontDecalMesh = new THREE.Mesh(frontDecalGeo, frontDecalMat);
  frontDecalMesh.position.set(0, 0.02, 0.33);
  group.add(frontDecalMesh);

  // Conformed Back Artwork Decal
  const backDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const backDecalMesh = new THREE.Mesh(backDecalGeo, backDecalMat);
  backDecalMesh.position.set(0, 0.05, -0.33);
  group.add(backDecalMesh);

  // Left Sleeve Decal (Conformed around sleeve curve)
  const leftDecalGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.22, 32, 1, true, Math.PI / 2 - 0.4, 0.8);
  leftDecalGeo.rotateZ(-Math.PI * 0.18);
  leftDecalGeo.rotateY(0.10);
  const leftDecalMesh = new THREE.Mesh(leftDecalGeo, frontDecalMat.clone());
  leftDecalMesh.position.set(-0.96, 0.44, 0.02);
  group.add(leftDecalMesh);

  // Right Sleeve Decal
  const rightDecalGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.22, 32, 1, true, -Math.PI / 2 - 0.4, 0.8);
  rightDecalGeo.rotateZ(Math.PI * 0.18);
  rightDecalGeo.rotateY(-0.10);
  const rightDecalMesh = new THREE.Mesh(rightDecalGeo, frontDecalMat.clone());
  rightDecalMesh.position.set(0.96, 0.44, 0.02);
  group.add(rightDecalMesh);

  return {
    group,
    bodyMesh,
    frontDecalMesh,
    backDecalMesh,
    leftDecalMesh,
    rightDecalMesh,
    accentMeshes: [collarMesh, leftSleeve, rightSleeve],
  };
}

/**
 * Creates an Oversized Streetwear Hoodie 3D model with hood, kangaroo pocket, and conformed decals.
 */
export function createHoodieModel(): ProductMeshBundle {
  const group = new THREE.Group();
  group.name = 'HoodieProduct';

  const bodyGeo = new THREE.CylinderGeometry(0.88, 0.92, 1.7, 64, 32, true);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const depthFactor = 0.62;
    const widthFactor = 1.05 + 0.1 * ((y + 0.85) / 1.7);
    pos.setXYZ(i, x * widthFactor, y, z * depthFactor);
  }
  bodyGeo.computeVertexNormals();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Kangaroo Front Pocket
  const pocketGeo = new THREE.BoxGeometry(0.72, 0.38, 0.08);
  const pocket = new THREE.Mesh(pocketGeo, bodyMat);
  pocket.position.set(0, -0.42, 0.54);
  pocket.castShadow = true;
  group.add(pocket);

  // Dropped Shoulders & Long Sleeves
  const leftSleeveGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.82, 32);
  leftSleeveGeo.rotateZ(Math.PI / 3.4);
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, bodyMat);
  leftSleeve.position.set(-0.95, 0.48, 0);
  group.add(leftSleeve);

  const rightSleeveGeo = new THREE.CylinderGeometry(0.22, 0.3, 0.82, 32);
  rightSleeveGeo.rotateZ(-Math.PI / 3.4);
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, bodyMat);
  rightSleeve.position.set(0.95, 0.48, 0);
  group.add(rightSleeve);

  // Hood Structure
  const hoodGeo = new THREE.SphereGeometry(0.48, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.75);
  hoodGeo.scale(0.85, 1.1, 0.95);
  const hood = new THREE.Mesh(hoodGeo, bodyMat);
  hood.position.set(0, 0.98, -0.08);
  hood.castShadow = true;
  group.add(hood);

  // Drawstrings
  const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 12);
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 });
  const stringL = new THREE.Mesh(stringGeo, stringMat);
  stringL.position.set(-0.12, 0.62, 0.55);
  const stringR = new THREE.Mesh(stringGeo, stringMat);
  stringR.position.set(0.12, 0.62, 0.55);
  group.add(stringL);
  group.add(stringR);

  // Ribbed Hem
  const hemGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.12, 48);
  hemGeo.scale(1.0, 1.0, 0.62);
  const hemMesh = new THREE.Mesh(hemGeo, bodyMat);
  hemMesh.position.set(0, -0.85, 0);
  group.add(hemMesh);

  // Front Decal
  const frontPlaneGeo = new THREE.PlaneGeometry(0.68, 0.72, 32, 32);
  const frontPos = frontPlaneGeo.attributes.position;
  for (let i = 0; i < frontPos.count; i++) {
    const x = frontPos.getX(i);
    const curve = Math.cos((x / 0.68) * Math.PI * 0.5) * 0.042;
    frontPos.setZ(i, curve);
  }
  frontPlaneGeo.computeVertexNormals();

  const frontDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const frontDecalMesh = new THREE.Mesh(frontPlaneGeo, frontDecalMat);
  frontDecalMesh.position.set(0, 0.22, 0.555);
  group.add(frontDecalMesh);

  // Back Decal
  const backPlaneGeo = new THREE.PlaneGeometry(0.76, 0.92, 32, 32);
  backPlaneGeo.rotateY(Math.PI);
  const backDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const backDecalMesh = new THREE.Mesh(backPlaneGeo, backDecalMat);
  backDecalMesh.position.set(0, 0.1, -0.565);
  group.add(backDecalMesh);

  return {
    group,
    bodyMesh,
    frontDecalMesh,
    backDecalMesh,
    accentMeshes: [pocket, leftSleeve, rightSleeve, hood, hemMesh],
  };
}

/**
 * Creates a Ceramic Studio Mug 3D model with smooth cylindrical wrap and C-Handle.
 */
export function createMugModel(): ProductMeshBundle {
  const group = new THREE.Group();
  group.name = 'MugProduct';

  const outerRadius = 0.55;
  const innerRadius = 0.50;
  const height = 1.15;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });

  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -height / 2));
  points.push(new THREE.Vector2(outerRadius, -height / 2));
  points.push(new THREE.Vector2(outerRadius, height / 2));
  points.push(new THREE.Vector2(innerRadius, height / 2));
  points.push(new THREE.Vector2(innerRadius, -height / 2 + 0.08));
  points.push(new THREE.Vector2(0, -height / 2 + 0.08));

  const latheGeo = new THREE.LatheGeometry(points, 64);
  const bodyMesh = new THREE.Mesh(latheGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const handleGeo = new THREE.TorusGeometry(0.36, 0.065, 24, 48, Math.PI * 0.95);
  handleGeo.rotateZ(Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, bodyMat);
  handle.position.set(0.68, 0, 0);
  handle.castShadow = true;
  group.add(handle);

  const wrapArc = Math.PI * 1.55;
  const wrapGeo = new THREE.CylinderGeometry(
    outerRadius + 0.003,
    outerRadius + 0.003,
    0.92,
    64,
    1,
    true,
    Math.PI / 2 - wrapArc / 2,
    wrapArc
  );

  const wrapDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const wrapDecalMesh = new THREE.Mesh(wrapGeo, wrapDecalMat);
  wrapDecalMesh.position.set(0, 0, 0);
  group.add(wrapDecalMesh);

  const frontPlaneGeo = new THREE.PlaneGeometry(0.55, 0.55, 32, 16);
  const fPos = frontPlaneGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const curve = Math.cos((x / 0.55) * Math.PI * 0.5) * 0.052;
    fPos.setZ(i, curve);
  }
  frontPlaneGeo.computeVertexNormals();

  const frontDecalMesh = new THREE.Mesh(frontPlaneGeo, wrapDecalMat.clone());
  frontDecalMesh.position.set(0, 0, outerRadius + 0.006);
  group.add(frontDecalMesh);

  return {
    group,
    bodyMesh,
    wrapDecalMesh,
    frontDecalMesh,
    accentMeshes: [handle],
  };
}

/**
 * Creates a Heavyweight Canvas Tote Bag 3D model with straps and side gussets.
 */
export function createToteBagModel(): ProductMeshBundle {
  const group = new THREE.Group();
  group.name = 'ToteBagProduct';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const bodyGeo = new THREE.BoxGeometry(1.2, 1.4, 0.32, 32, 32, 8);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y < 0) {
      pos.setZ(i, z * 1.15);
    }
  }
  bodyGeo.computeVertexNormals();

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, -0.3, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const strapPathL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.32, 0.4, 0.16),
    new THREE.Vector3(-0.35, 1.3, 0.08),
    new THREE.Vector3(-0.32, 0.4, -0.16),
  ]);
  const strapGeoL = new THREE.TubeGeometry(strapPathL, 32, 0.025, 8, false);
  const strapL = new THREE.Mesh(strapGeoL, bodyMat);
  group.add(strapL);

  const strapPathR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.32, 0.4, 0.16),
    new THREE.Vector3(0.35, 1.3, 0.08),
    new THREE.Vector3(0.32, 0.4, -0.16),
  ]);
  const strapGeoR = new THREE.TubeGeometry(strapPathR, 32, 0.025, 8, false);
  const strapR = new THREE.Mesh(strapGeoR, bodyMat);
  group.add(strapR);

  const frontPlaneGeo = new THREE.PlaneGeometry(0.9, 1.05);
  const frontDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const frontDecalMesh = new THREE.Mesh(frontPlaneGeo, frontDecalMat);
  frontDecalMesh.position.set(0, -0.3, 0.166);
  group.add(frontDecalMesh);

  const backPlaneGeo = new THREE.PlaneGeometry(0.9, 1.05);
  backPlaneGeo.rotateY(Math.PI);
  const backDecalMesh = new THREE.Mesh(backPlaneGeo, frontDecalMat.clone());
  backDecalMesh.position.set(0, -0.3, -0.166);
  group.add(backDecalMesh);

  return {
    group,
    bodyMesh,
    frontDecalMesh,
    backDecalMesh,
    accentMeshes: [strapL, strapR],
  };
}

/**
 * Creates an Unstructured 6-Panel Dad Cap 3D model with curved brim and top button.
 */
export function createCapModel(): ProductMeshBundle {
  const group = new THREE.Group();
  group.name = 'CapProduct';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const crownGeo = new THREE.SphereGeometry(0.72, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
  crownGeo.scale(1.0, 0.82, 1.08);
  const bodyMesh = new THREE.Mesh(crownGeo, bodyMat);
  bodyMesh.position.set(0, 0, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const visorShape = new THREE.Shape();
  visorShape.moveTo(-0.55, 0);
  visorShape.quadraticCurveTo(0, 0.85, 0.55, 0);
  visorShape.quadraticCurveTo(0, 0.25, -0.55, 0);

  const extrudeSettings = { depth: 0.025, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
  const visorGeo = new THREE.ExtrudeGeometry(visorShape, extrudeSettings);
  visorGeo.rotateX(Math.PI / 2 - 0.22);
  const visor = new THREE.Mesh(visorGeo, bodyMat);
  visor.position.set(0, -0.05, 0.58);
  visor.castShadow = true;
  group.add(visor);

  const buttonGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const button = new THREE.Mesh(buttonGeo, bodyMat);
  button.position.set(0, 0.59, 0);
  group.add(button);

  // Subdivided curved crown decal
  const frontPlaneGeo = new THREE.PlaneGeometry(0.52, 0.32, 32, 16);
  const fPos = frontPlaneGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const y = fPos.getY(i);
    const curve = Math.cos((x / 0.52) * Math.PI * 0.5) * 0.082 - y * 0.082;
    fPos.setZ(i, curve);
  }
  frontPlaneGeo.computeVertexNormals();

  const frontDecalMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: THREE.DoubleSide,
  });
  const frontDecalMesh = new THREE.Mesh(frontPlaneGeo, frontDecalMat);
  frontDecalMesh.position.set(0, 0.18, 0.686);
  group.add(frontDecalMesh);

  return {
    group,
    bodyMesh,
    frontDecalMesh,
    accentMeshes: [visor, button],
  };
}

export function buildProductMeshBundle(productId: ProductId | string): ProductMeshBundle {
  switch (productId) {
    case 'tshirt':
      return createTShirtModel();
    case 'hoodie':
      return createHoodieModel();
    case 'mug':
      return createMugModel();
    case 'totebag':
      return createToteBagModel();
    case 'cap':
      return createCapModel();
    default:
      return createTShirtModel();
  }
}
