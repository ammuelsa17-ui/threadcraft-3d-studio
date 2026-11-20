import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore } from '../../store/useStudioStore';
import { ProductRenderer } from './ProductRenderer';
import {
  RotateCcw,
  Box,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

// Controller to animate camera to specific zone viewpoints
const CameraManager: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const is3DOrbitLocked = useStudioStore((s) => s.is3DOrbitLocked);

  useEffect(() => {
    const zoneConfig = activeProduct.zones.find((z) => z.id === activeZoneId);
    if (zoneConfig && controlsRef.current) {
      const [cx, cy, cz] = zoneConfig.cameraPosition;
      const [tx, ty, tz] = zoneConfig.cameraTarget;

      camera.position.set(cx, cy, cz);
      controlsRef.current.target.set(tx, ty, tz);
      controlsRef.current.update();
    }
  }, [activeZoneId, activeProduct, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={!is3DOrbitLocked}
      enableZoom={!is3DOrbitLocked}
      enableRotate={!is3DOrbitLocked}
      dampingFactor={0.06}
      minDistance={1.2}
      maxDistance={6.0}
      target={new THREE.Vector3(...activeProduct.initialCamera.target)}
    />
  );
};

// Studio environment lighting rig
const StudioLighting: React.FC = () => {
  const materialSettings = useStudioStore((s) => s.materialSettings);
  const preset = materialSettings.environmentPreset;

  let keyColor = '#ffffff';
  let fillColor = '#cbd5e1';
  let rimColor = '#818cf8';
  let ambientInt = materialSettings.ambientIntensity;

  if (preset === 'sunset') {
    keyColor = '#fed7aa';
    fillColor = '#fdba74';
    rimColor = '#f43f5e';
  } else if (preset === 'cyber') {
    keyColor = '#67e8f9';
    fillColor = '#c084fc';
    rimColor = '#3b82f6';
  } else if (preset === 'neutral') {
    keyColor = '#ffffff';
    fillColor = '#e2e8f0';
    rimColor = '#cbd5e1';
  }

  return (
    <>
      <ambientLight intensity={ambientInt * 0.8} />
      {/* Key Softbox Light */}
      <directionalLight
        position={[3.5, 4.5, 3.5]}
        intensity={1.5}
        color={keyColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {/* Fill Diffuse Light */}
      <directionalLight
        position={[-3.5, 2.0, 2.0]}
        intensity={0.9}
        color={fillColor}
      />
      {/* Bilateral Rim Lighting for Silhouette Edge Definition */}
      <directionalLight
        position={[3.8, 2.8, -3.2]}
        intensity={1.1}
        color={rimColor}
      />
      <directionalLight
        position={[-3.8, 2.8, -3.2]}
        intensity={1.1}
        color={rimColor}
      />
      {/* Overhead Soft Accent */}
      <directionalLight
        position={[0, 4.5, 0.5]}
        intensity={0.4}
        color="#ffffff"
      />
    </>
  );
};

export const StudioScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const activeZoneId = useStudioStore((s) => s.activeZoneId);
  const setActiveZone = useStudioStore((s) => s.setActiveZone);
  const isWireframe = useStudioStore((s) => s.isWireframe);
  const toggleWireframe = useStudioStore((s) => s.toggleWireframe);
  const isAutoRotate = useStudioStore((s) => s.isAutoRotate);
  const toggleAutoRotate = useStudioStore((s) => s.toggleAutoRotate);

  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${activeProduct.id}-3d-studio-render.png`;
    a.click();
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#181a22] via-[#121319] to-[#0c0d12] overflow-hidden flex flex-col">
      {/* Floating Camera Angle Dock (Centered at Bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-studio-900/90 backdrop-blur-md px-2 py-1.5 rounded-full border border-studio-750 shadow-2xl">
        <span className="pl-2 pr-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
        </span>
        <div className="h-3.5 w-px bg-studio-700 mx-1" />
        {activeProduct.zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              activeZoneId === zone.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-studio-800'
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Floating View Toggles on Right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-studio-900/90 backdrop-blur-md p-1 rounded-xl border border-studio-750 shadow-xl">
        <button
          onClick={toggleWireframe}
          title="Toggle Wireframe Inspection"
          className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
            isWireframe
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-300 hover:text-white hover:bg-studio-800'
          }`}
        >
          <Box className="w-4 h-4" />
        </button>
        <button
          onClick={toggleAutoRotate}
          title="Toggle 360° Turntable Rotation"
          className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
            isAutoRotate
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 animate-spin-slow'
              : 'border-transparent text-slate-300 hover:text-white hover:bg-studio-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleCaptureSnapshot}
          title="Capture Instant 3D Viewport Snapshot"
          className="p-1.5 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-studio-800 transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          ref={canvasRef}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          camera={{
            position: activeProduct.initialCamera.position,
            fov: activeProduct.initialCamera.fov,
          }}
          shadows
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <StudioLighting />
          <ProductRenderer />
          <CameraManager />
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.65}
            scale={5}
            blur={1.8}
            far={4}
          />
        </Canvas>
      </div>

      {/* Subtle Studio Watermark / Calibration stats */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>PBR STUDIO ENGINE // {activeProduct.name.toUpperCase()}</span>
      </div>
    </div>
  );
};
