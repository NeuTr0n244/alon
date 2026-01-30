'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

interface QueueItem {
  id: string;
  text: string;
}

interface VoiceContextType {
  isSpeaking: boolean;
  currentId: string | null;
  isEnabled: boolean;
  isUnlocked: boolean;
  queueLength: number;
  addToQueue: (text: string, id: string) => void;
  speakNow: (text: string, id: string) => void;
  stop: () => void;
  toggleVoice: () => void;
  hasBeenSpoken: (id: string) => boolean;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true); // TRUE por padrão
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());
  const addedToQueueRef = useRef<Set<string>>(new Set());
  const isEnabledRef = useRef(true);
  const isUnlockedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const hasAutoUnlocked = useRef(false);

  // FORÇAR VOZ SEMPRE ATIVA NA INICIALIZAÇÃO
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // SEMPRE iniciar com voz ATIVA (ignorar localStorage)
    const shouldBeEnabled = true;
    setIsEnabled(shouldBeEnabled);
    isEnabledRef.current = shouldBeEnabled;
    localStorage.setItem('voiceEnabled', 'true');
    console.log('💾 Voz SEMPRE ATIVA por padrão:', shouldBeEnabled);
  }, []);

  // Salvar preferência no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('voiceEnabled', String(isEnabled));
  }, [isEnabled]);

  // Sincronizar refs
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Carregar voz masculina
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Prioridade: Google UK English Male > qualquer Male > inglês
      let selectedVoice = voices.find(v => v.name === 'Google UK English Male');
      if (!selectedVoice) {
        selectedVoice = voices.find(v =>
          v.name.toLowerCase().includes('male') ||
          v.name.includes('David') ||
          v.name.includes('Daniel')
        );
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }

      voiceRef.current = selectedVoice || voices[0];
      console.log('🎤 Voz selecionada:', voiceRef.current?.name);
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
    setTimeout(loadVoice, 500);
    setTimeout(loadVoice, 1000);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // AUTO-DESBLOQUEAR com primeiro clique
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasAutoUnlocked.current) return;

    const autoUnlock = () => {
      if (hasAutoUnlocked.current) return;

      console.log('🔓 Auto-desbloqueando TTS...');
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);

      setIsUnlocked(true);
      isUnlockedRef.current = true;
      hasAutoUnlocked.current = true;
      console.log('✅ TTS desbloqueado! Fila será processada agora.');
      console.log(`📋 Fila atual: ${queue.length} items aguardando processamento`);
    };

    console.log('🎧 Aguardando primeira interação do usuário para desbloquear TTS...');
    console.log('💡 DICA: Clique em qualquer lugar da página para ativar a voz automática');

    document.addEventListener('click', autoUnlock, { once: true });
    document.addEventListener('touchstart', autoUnlock, { once: true });
    document.addEventListener('keydown', autoUnlock, { once: true });
    document.addEventListener('mousemove', autoUnlock, { once: true });
    document.addEventListener('scroll', autoUnlock, { once: true });

    return () => {
      document.removeEventListener('click', autoUnlock);
      document.removeEventListener('touchstart', autoUnlock);
      document.removeEventListener('keydown', autoUnlock);
      document.removeEventListener('mousemove', autoUnlock);
      document.removeEventListener('scroll', autoUnlock);
    };
  }, [queue.length]);

  // ========== PARAR TUDO IMEDIATAMENTE ==========
  const stopEverything = useCallback(() => {
    console.log('🛑🛑🛑 PARANDO TUDO 🛑🛑🛑');

    // 1. Cancelar TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('✅ speechSynthesis.cancel() chamado');
    }

    // 2. Atualizar estados
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentId(null);
    setQueue([]);

    // 3. Disparar evento
    window.dispatchEvent(new CustomEvent('character-speak-end'));

    console.log('✅ Tudo parado');
  }, []);

  // ========== TOGGLE VOZ ==========
  const toggleVoice = useCallback(() => {
    console.log('========== TOGGLE VOICE ==========');
    console.log('isEnabled:', isEnabledRef.current);
    console.log('isSpeaking:', isSpeakingRef.current);

    if (isEnabledRef.current) {
      // DESATIVANDO - PARAR TUDO
      console.log('>>> DESATIVANDO <<<');

      stopEverything();

      setIsEnabled(false);
      isEnabledRef.current = false;
      localStorage.setItem('voiceEnabled', 'false');

      console.log('✅ Voz desativada');
    } else {
      // ATIVANDO
      console.log('>>> ATIVANDO <<<');

      setIsEnabled(true);
      isEnabledRef.current = true;
      localStorage.setItem('voiceEnabled', 'true');

      // Desbloquear TTS se necessário
      if (!hasAutoUnlocked.current) {
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        window.speechSynthesis?.speak(unlock);
        setIsUnlocked(true);
        isUnlockedRef.current = true;
        hasAutoUnlocked.current = true;
      }

      console.log('✅ Voz ativada');
    }
  }, [stopEverything]);

  // ========== FALAR UM ITEM ==========
  const speakItem = useCallback((item: QueueItem) => {
    // VERIFICAÇÕES RÍGIDAS
    if (!isEnabledRef.current) {
      console.log('❌ Voz desabilitada, não vou falar');
      return;
    }
    if (!isUnlockedRef.current) {
      console.log('❌ TTS não desbloqueado, não vou falar');
      return;
    }
    if (spokenIdsRef.current.has(item.id)) {
      console.log('❌ Já falei esse ID:', item.id.slice(0, 30));
      return;
    }

    // Cancelar qualquer coisa que esteja tocando
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.text);

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      // VERIFICAR NOVAMENTE se ainda está habilitado
      if (!isEnabledRef.current) {
        console.log('❌ Voz foi desabilitada, cancelando');
        window.speechSynthesis.cancel();
        return;
      }

      console.log('🎤 Lendo:', item.text.slice(0, 50));
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(item.id);

      // Marcar como falado IMEDIATAMENTE
      spokenIdsRef.current.add(item.id);

      window.dispatchEvent(new CustomEvent('character-speak-start', {
        detail: { text: item.text }
      }));
    };

    utterance.onend = () => {
      console.log('✅ Terminou:', item.id.slice(0, 30));
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('❌ Erro TTS:', e.error);
      }
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ========== PROCESSAR FILA ==========
  useEffect(() => {
    // Debug: Mostrar estado atual
    if (queue.length > 0) {
      console.log(`📋 Fila: ${queue.length} items | enabled: ${isEnabled} | unlocked: ${isUnlocked} | speaking: ${isSpeaking}`);
    }

    if (!isEnabled) {
      console.log('⏸️ Voz desabilitada, fila pausada');
      return;
    }

    if (!isUnlocked) {
      console.log('🔒 Voz não desbloqueada ainda, aguardando interação do usuário...');
      console.log(`⏳ ${queue.length} items na fila aguardando desbloqueio`);
      console.log('💡 DICA: Clique, mova o mouse ou role a página para ativar a voz');
      return;
    }

    // UNLOCK ACONTECEU! Processar fila imediatamente
    if (isUnlocked && queue.length > 0 && !isSpeaking) {
      console.log('🚀 VOZ DESBLOQUEADA! Processando fila agora...');
    }

    if (isSpeaking) {
      return;
    }

    if (queue.length === 0) {
      return;
    }

    console.log(`📋 Processando fila (${queue.length} items)`);

    // Pegar o PRIMEIRO item que ainda não foi falado
    const nextItem = queue.find(item => !spokenIdsRef.current.has(item.id));

    if (!nextItem) {
      console.log('✅ Todos os items já foram lidos');
      setQueue([]);
      return;
    }

    console.log('🎯 Próximo:', nextItem.text.slice(0, 50), '...');

    // Remover da fila
    setQueue(prev => prev.filter(item => item.id !== nextItem.id));

    // Falar
    speakItem(nextItem);
  }, [queue, isSpeaking, isEnabled, isUnlocked, speakItem]);

  // ========== ADICIONAR À FILA ==========
  const addToQueue = useCallback((text: string, id: string) => {
    if (!isEnabledRef.current) {
      return;
    }

    // NUNCA adicionar se já foi falado
    if (spokenIdsRef.current.has(id)) {
      console.log('⏭️ Já foi lido, ignorando:', id.slice(0, 30));
      return;
    }

    // NUNCA adicionar se já foi adicionado à fila
    if (addedToQueueRef.current.has(id)) {
      console.log('⏭️ Já na fila, ignorando:', id.slice(0, 30));
      return;
    }

    console.log('➕ Adicionando:', id.slice(0, 40));

    // Marcar como adicionado
    addedToQueueRef.current.add(id);

    setQueue(prev => [...prev, { id, text }]);
  }, []);

  // ========== FALAR IMEDIATAMENTE (MANUAL) ==========
  const speakNow = useCallback((text: string, id: string) => {
    if (!isEnabledRef.current) {
      console.log('❌ Voz desabilitada');
      return;
    }

    // Parar o que está falando
    stopEverything();

    console.log('🎯 LEITURA MANUAL:', text.slice(0, 40));

    const utterance = new SpeechSynthesisUtterance(text);

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (!isEnabledRef.current) {
        window.speechSynthesis.cancel();
        return;
      }

      console.log('🎤 Lendo (manual):', text.slice(0, 50));
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(id);

      // Marcar como falado
      spokenIdsRef.current.add(id);

      window.dispatchEvent(new CustomEvent('character-speak-start', {
        detail: { text }
      }));
    };

    utterance.onend = () => {
      console.log('✅ Terminou (manual)');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('❌ Erro:', e.error);
      }
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    window.speechSynthesis.speak(utterance);
  }, [stopEverything]);

  // Verificar se já foi lido
  const hasBeenSpoken = useCallback((id: string) => {
    return spokenIdsRef.current.has(id);
  }, []);

  // STOP público (usa stopEverything)
  const stop = useCallback(() => {
    stopEverything();
  }, [stopEverything]);

  return (
    <VoiceContext.Provider value={{
      isSpeaking,
      currentId,
      isEnabled,
      isUnlocked,
      queueLength: queue.length,
      addToQueue,
      speakNow,
      stop,
      toggleVoice,
      hasBeenSpoken,
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

// Hook para usar o context
export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
