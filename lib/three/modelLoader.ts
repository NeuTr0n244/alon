import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { CharacterModel } from '@/types/character';

export async function loadCharacterModel(path: string): Promise<CharacterModel> {
  return new Promise((resolve, reject) => {
    // Configure DRACO loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      path,
      (gltf) => {
        console.log('[ModelLoader] Model loaded successfully');

        // Check if GLB has cameras
        if (gltf.cameras && gltf.cameras.length > 0) {
          console.log('[ModelLoader] Found', gltf.cameras.length, 'cameras in GLB');
          gltf.cameras.forEach((cam, i) => {
            console.log(`[ModelLoader] Camera ${i}:`, {
              position: cam.position,
              rotation: cam.rotation,
            });
          });
        } else {
          console.log('[ModelLoader] No cameras found in GLB');
        }

        resolve(gltf as CharacterModel);
      },
      (progress) => {
        // Evitar divisão por zero (Infinity%)
        const percent = progress.total > 0
          ? (progress.loaded / progress.total) * 100
          : 0;
        console.log(`[ModelLoader] Loading: ${percent.toFixed(2)}% (${(progress.loaded / 1024 / 1024).toFixed(2)}MB)`);
      },
      (error) => {
        console.error('[ModelLoader] Error loading model:', error);
        reject(error);
      }
    );
  });
}

export function extractMorphTargets(model: CharacterModel): string[] {
  const morphTargets: string[] = [];

  model.scene.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.morphTargetDictionary) {
        Object.keys(mesh.morphTargetDictionary).forEach((key) => {
          if (!morphTargets.includes(key)) {
            morphTargets.push(key);
          }
        });
      }
    }
  });

  console.log('[ModelLoader] Found morph targets:', morphTargets);
  return morphTargets;
}

export function getMorphTargetInfluence(
  model: CharacterModel,
  targetName: string
): number | null {
  let influence: number | null = null;

  model.scene.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const index = mesh.morphTargetDictionary[targetName];
        if (index !== undefined) {
          influence = mesh.morphTargetInfluences[index];
        }
      }
    }
  });

  return influence;
}

export function setMorphTargetInfluence(
  model: CharacterModel,
  targetName: string,
  influence: number
): void {
  model.scene.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const index = mesh.morphTargetDictionary[targetName];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = THREE.MathUtils.clamp(influence, 0, 1);
        }
      }
    }
  });
}

// Preload model on module load
if (typeof window !== 'undefined') {
  console.log('[ModelLoader] Preloading character model...');
  loadCharacterModel('/models/alon.glb')
    .then(() => console.log('[ModelLoader] ✅ Model preloaded successfully'))
    .catch((error) => console.error('[ModelLoader] ❌ Preload failed:', error));
}
