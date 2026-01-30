import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CharacterModel extends GLTF {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export interface MorphTargetDictionary {
  [key: string]: number;
}

export interface VisemeData {
  viseme: string;
  time: number;
  duration?: number;
}

export interface LipSyncData {
  audio: string;
  visemes: VisemeData[];
  duration: number;
}

export interface AnnouncementQueueItem {
  tokenName: string;
  tokenSymbol: string;
  marketCap: string;
  timestamp: number;
}
