'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Character3D } from './Character3D';
import { SpeechCaption } from '../SpeechCaption';
import * as THREE from 'three';

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
    </>
  );
}

function CharacterWithMouseTracking() {
  const groupRef = useRef<THREE.Group>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Horizontal: sem negativo (correto)
      // Vertical: com negativo (corrigido)
      targetRotation.current.y = mousePosition.current.x * 0.3;
      targetRotation.current.x = -mousePosition.current.y * 0.15; // Negativo para inverter vertical

      groupRef.current.rotation.y +=
        (targetRotation.current.y - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x +=
        (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Character3D />
    </group>
  );
}

export function CharacterCanvas() {
  return (
    <div className="w-full h-full relative" style={{ background: '#0d0d0d' }}>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Lights />
        <Suspense fallback={null}>
          <CharacterWithMouseTracking />
        </Suspense>
      </Canvas>

      {/* Speech Caption */}
      <SpeechCaption />
    </div>
  );
}
