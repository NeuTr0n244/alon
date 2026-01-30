import * as THREE from 'three';
import { CharacterModel, VisemeData } from '@/types/character';
import { setMorphTargetInfluence } from './modelLoader';

// Map ElevenLabs visemes to morph target blend shapes
const VISEME_MAP: Record<string, { target: string; weight: number }[]> = {
  'sil': [], // Silence
  'PP': [{ target: 'mouthClosed', weight: 1.0 }],
  'FF': [{ target: 'mouthNarrow', weight: 0.8 }],
  'TH': [{ target: 'mouthOpen', weight: 0.3 }],
  'DD': [{ target: 'mouthOpen', weight: 0.4 }],
  'kk': [{ target: 'mouthOpen', weight: 0.5 }],
  'CH': [{ target: 'mouthSmile', weight: 0.6 }],
  'SS': [{ target: 'mouthNarrow', weight: 0.7 }],
  'nn': [{ target: 'mouthOpen', weight: 0.3 }],
  'RR': [{ target: 'mouthRound', weight: 0.6 }],
  'aa': [{ target: 'mouthOpen', weight: 1.0 }],
  'E': [{ target: 'mouthSmile', weight: 0.8 }],
  'I': [{ target: 'mouthNarrow', weight: 0.6 }],
  'O': [{ target: 'mouthRound', weight: 0.9 }],
  'U': [{ target: 'mouthPucker', weight: 0.9 }],
};

export class LipSyncController {
  private model: CharacterModel;
  private currentViseme: string = 'sil';
  private targetInfluences: Map<string, number> = new Map();
  private currentInfluences: Map<string, number> = new Map();
  private smoothingFactor: number = 0.15;

  constructor(model: CharacterModel) {
    this.model = model;
    this.reset();
  }

  reset(): void {
    this.currentViseme = 'sil';
    this.targetInfluences.clear();
    this.currentInfluences.clear();

    // Reset all morph targets
    const allTargets = [
      'mouthOpen',
      'mouthClosed',
      'mouthSmile',
      'mouthNarrow',
      'mouthRound',
      'mouthPucker',
    ];

    allTargets.forEach((target) => {
      this.targetInfluences.set(target, 0);
      this.currentInfluences.set(target, 0);
      setMorphTargetInfluence(this.model, target, 0);
    });
  }

  setViseme(viseme: string): void {
    if (this.currentViseme === viseme) return;

    this.currentViseme = viseme;

    // Reset all target influences
    this.targetInfluences.forEach((_, key) => {
      this.targetInfluences.set(key, 0);
    });

    // Set new target influences based on viseme
    const mapping = VISEME_MAP[viseme] || [];
    mapping.forEach(({ target, weight }) => {
      this.targetInfluences.set(target, weight);
    });
  }

  update(): void {
    // Smoothly interpolate current influences towards target influences
    this.targetInfluences.forEach((target, key) => {
      const current = this.currentInfluences.get(key) || 0;
      const lerped = THREE.MathUtils.lerp(current, target, this.smoothingFactor);
      this.currentInfluences.set(key, lerped);
      setMorphTargetInfluence(this.model, key, lerped);
    });
  }

  playVisemeSequence(visemes: VisemeData[], audioElement: HTMLAudioElement): void {
    const startTime = Date.now();

    const updateViseme = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Find current viseme based on elapsed time
      const currentVisemeData = visemes.find((v, i) => {
        const nextViseme = visemes[i + 1];
        return elapsed >= v.time && (!nextViseme || elapsed < nextViseme.time);
      });

      if (currentVisemeData) {
        this.setViseme(currentVisemeData.viseme);
      }

      this.update();

      // Continue until audio ends
      if (!audioElement.paused && !audioElement.ended) {
        requestAnimationFrame(updateViseme);
      } else {
        this.reset();
      }
    };

    audioElement.play();
    updateViseme();
  }
}
