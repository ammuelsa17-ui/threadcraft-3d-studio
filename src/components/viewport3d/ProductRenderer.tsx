import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useStudioStore } from '../../store/useStudioStore';
import { buildProductMeshBundle, ProductMeshBundle } from '../../services/productGeometries';
import { getProceduralNormalMap } from '../../services/proceduralMaterials';
import { textureBaker } from '../../services/textureBaker';
import { SurfaceMapper } from '../../services/surfaceMapper';

export const ProductRenderer: React.FC = () => {
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const garmentColor = useStudioStore((s) => s.garmentColor);
  const materialSettings = useStudioStore((s) => s.materialSettings);
  const isWireframe = useStudioStore((s) => s.isWireframe);
  const isAutoRotate = useStudioStore((s) => s.isAutoRotate);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const activeFabricCanvas = useStudioStore((s) => s.activeFabricCanvas);
  const setIs3DOrbitLocked = useStudioStore((s) => s.setIs3DOrbitLocked);
  const updateZoneCanvas = useStudioStore((s) => s.updateZoneCanvas);
  const setActiveObjectProps = useStudioStore((s) => s.setActiveObjectProps);

  const groupRef = useRef<THREE.Group>(null);
  const bundleRef = useRef<ProductMeshBundle | null>(null);

  // 3D Pointer Dragging State
  const isDragging3DRef = useRef<boolean>(false);
  const draggedObjectRef = useRef<any>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Build model geometry bundle whenever activeProduct changes
  const bundle = useMemo(() => {
    return buildProductMeshBundle(activeProduct.id);
  }, [activeProduct.id]);

  useEffect(() => {
    bundleRef.current = bundle;
  }, [bundle]);

  // Update base material properties
  useEffect(() => {
    if (!bundle) return;

    const normalTexture = getProceduralNormalMap(materialSettings.fabricType);

    const updateMat = (mat: THREE.Material) => {
      if (mat instanceof THREE.MeshPhysicalMaterial || mat instanceof THREE.MeshStandardMaterial) {
        mat.color.set(garmentColor);
        mat.roughness = materialSettings.roughness;
        mat.metalness = materialSettings.metalness;
        mat.wireframe = isWireframe;

        if (materialSettings.fabricType !== 'ceramic') {
          mat.normalMap = normalTexture;
          mat.normalScale.set(materialSettings.normalScale, materialSettings.normalScale);
        } else {
          mat.normalMap = null;
        }

        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.clearcoat = materialSettings.clearcoat;
          mat.clearcoatRoughness = 0.1;
        }

        mat.needsUpdate = true;
      }
    };

    updateMat(bundle.bodyMesh.material as THREE.Material);
    for (const accent of bundle.accentMeshes) {
      updateMat(accent.material as THREE.Material);
    }
  }, [bundle, garmentColor, materialSettings, isWireframe]);

  // Bind textures to decal meshes
  useEffect(() => {
    if (!bundle) return;

    const assignDecalTexture = (mesh: THREE.Mesh | undefined, zoneId: string) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const texture = textureBaker.getOrCreateTexture(zoneId);
      mat.map = texture;
      mat.needsUpdate = true;
    };

    assignDecalTexture(bundle.frontDecalMesh, 'front');
    assignDecalTexture(bundle.backDecalMesh, 'back');
    assignDecalTexture(bundle.leftDecalMesh, 'left_sleeve');
    assignDecalTexture(bundle.rightDecalMesh, 'right_sleeve');
    assignDecalTexture(bundle.hoodDecalMesh, 'hood');
    assignDecalTexture(bundle.wrapDecalMesh, 'wrap');
  }, [bundle]);

  // Direct 3D Surface Pointer Interaction Handlers
  const handlePointerDownOnDecal = (e: ThreeEvent<PointerEvent>, zoneId: string) => {
    if (!activeFabricCanvas || !e.uv || activeZoneId !== zoneId) return;

    const targetObj = SurfaceMapper.findTargetAtUV(
      { u: e.uv.x, v: e.uv.y },
      activeFabricCanvas
    );

    if (targetObj) {
      e.stopPropagation();
      activeFabricCanvas.setActiveObject(targetObj);
      activeFabricCanvas.renderAll();

      const canvasPt = SurfaceMapper.uvToCanvas(
        { u: e.uv.x, v: e.uv.y },
        activeFabricCanvas.getWidth(),
        activeFabricCanvas.getHeight()
      );

      draggedObjectRef.current = targetObj;
      dragOffsetRef.current = {
        x: (targetObj.left || 0) - canvasPt.x,
        y: (targetObj.top || 0) - canvasPt.y,
      };
      isDragging3DRef.current = true;
      setIs3DOrbitLocked(true);
    }
  };

  const handlePointerMoveOnDecal = (e: ThreeEvent<PointerEvent>, zoneId: string) => {
    if (!isDragging3DRef.current || !draggedObjectRef.current || !activeFabricCanvas || !e.uv || activeZoneId !== zoneId) {
      return;
    }

    e.stopPropagation();
    const canvasPt = SurfaceMapper.uvToCanvas(
      { u: e.uv.x, v: e.uv.y },
      activeFabricCanvas.getWidth(),
      activeFabricCanvas.getHeight()
    );

    const target = draggedObjectRef.current;
    const newLeft = canvasPt.x + dragOffsetRef.current.x;
    const newTop = canvasPt.y + dragOffsetRef.current.y;

    target.set({ left: newLeft, top: newTop });
    target.setCoords();
    activeFabricCanvas.renderAll();

    textureBaker.updateFromLiveCanvas(zoneId, activeFabricCanvas, false);
  };

  const handlePointerUpOnDecal = (e: ThreeEvent<PointerEvent>, zoneId: string) => {
    if (isDragging3DRef.current && draggedObjectRef.current && activeFabricCanvas) {
      e.stopPropagation();
      textureBaker.updateFromLiveCanvas(zoneId, activeFabricCanvas, true);
      const serialized = JSON.stringify(activeFabricCanvas.toJSON());
      updateZoneCanvas(zoneId, serialized, true);

      isDragging3DRef.current = false;
      draggedObjectRef.current = null;
      setIs3DOrbitLocked(false);
    }
  };

  // Attach pointer handlers to decal meshes in group
  useEffect(() => {
    if (!bundle) return;

    const attachHandlers = (mesh: THREE.Mesh | undefined, zoneId: string) => {
      if (!mesh) return;
      mesh.userData = {
        onPointerDown: (e: ThreeEvent<PointerEvent>) => handlePointerDownOnDecal(e, zoneId),
        onPointerMove: (e: ThreeEvent<PointerEvent>) => handlePointerMoveOnDecal(e, zoneId),
        onPointerUp: (e: ThreeEvent<PointerEvent>) => handlePointerUpOnDecal(e, zoneId),
      };
    };

    attachHandlers(bundle.frontDecalMesh, 'front');
    attachHandlers(bundle.backDecalMesh, 'back');
    attachHandlers(bundle.leftDecalMesh, 'left_sleeve');
    attachHandlers(bundle.rightDecalMesh, 'right_sleeve');
    attachHandlers(bundle.wrapDecalMesh, 'wrap');
  }, [bundle, activeFabricCanvas, activeZoneId]);

  // Gentle auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current && isAutoRotate && !isDragging3DRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={bundle.group}
      position={[0, 0, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        const zoneDecal = e.object;
        if (zoneDecal.userData?.onPointerDown) {
          zoneDecal.userData.onPointerDown(e);
        }
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        const zoneDecal = e.object;
        if (zoneDecal.userData?.onPointerMove) {
          zoneDecal.userData.onPointerMove(e);
        }
      }}
      onPointerUp={(e: ThreeEvent<PointerEvent>) => {
        const zoneDecal = e.object;
        if (zoneDecal.userData?.onPointerUp) {
          zoneDecal.userData.onPointerUp(e);
        }
      }}
    />
  );
};
