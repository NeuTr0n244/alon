'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function Character3D() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/alon.glb');
  const { actions, names } = useAnimations(animations, group);

  // Configurar animação em loop
  useEffect(() => {
    console.log('🎬 Animações encontradas:', names);
    
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.reset().play();
      console.log('✅ Animação em loop:', names[0]);
    }
  }, [actions, names]);

  return (
    <group 
      ref={group} 
      scale={2.2} 
      position={[0, -1.8, 0]}
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/alon.glb');
