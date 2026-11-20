import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useStudioStore } from '../../store/useStudioStore';
import { getProceduralNormalMap } from '../../services/proceduralMaterials';
import { textureBaker } from '../../services/textureBaker';

interface CustomGltfRendererProps {
  modelUrl: string;
}

export const CustomGltfRenderer: React.FC<CustomGltfRendererProps> = ({ modelUrl }) => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const garmentColor = useStudioStore((s) => s.garmentColor);
  const materialSettings = useStudioStore((s) => s.materialSettings);
  const isWireframe = useStudioStore((s) => s.isWireframe);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // Auto-center and normalize scale
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;

        root.scale.setScalar(scale);
        root.position.sub(center.multiplyScalar(scale));

        // Enable shadows and search for primary mesh to bind texture
        const frontTexture = textureBaker.getOrCreateTexture('front');

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.color.set(garmentColor);
              mat.roughness = materialSettings.roughness;
              mat.metalness = materialSettings.metalness;
              mat.wireframe = isWireframe;

              // Apply front artwork texture to primary surface if UVs exist
              if (mesh.name.toLowerCase().includes('front') || mesh.name.toLowerCase().includes('body') || !mesh.name) {
                mat.map = frontTexture;
              }
              mat.needsUpdate = true;
            }
          }
        });

        setScene(root);
      },
      undefined,
      (err) => console.error('Failed to load custom GLB:', err)
    );
  }, [modelUrl]);

  // Update materials on changes
  useEffect(() => {
    if (!scene) return;
    const normalTex = getProceduralNormalMap(materialSettings.fabricType);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.set(garmentColor);
          mat.roughness = materialSettings.roughness;
          mat.metalness = materialSettings.metalness;
          mat.wireframe = isWireframe;
          if (materialSettings.fabricType !== 'ceramic') {
            mat.normalMap = normalTex;
            mat.normalScale.set(materialSettings.normalScale, materialSettings.normalScale);
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, garmentColor, materialSettings, isWireframe]);

  if (!scene) return null;
  return <primitive object={scene} />;
};
