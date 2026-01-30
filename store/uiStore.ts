import { create } from 'zustand';

interface UIStore {
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  isCharacterLoaded: boolean;
  setCharacterLoaded: (loaded: boolean) => void;
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  voiceEnabled: process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true',
  setVoiceEnabled: (enabled: boolean) => set({ voiceEnabled: enabled }),

  isCharacterLoaded: false,
  setCharacterLoaded: (loaded: boolean) => set({ isCharacterLoaded: loaded }),

  isConnected: false,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
}));
