'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

interface QueueItem {
  id: string;
  text: string;
  priority: boolean;
}

interface VoiceContextType {
  isSpeaking: boolean;
  currentId: string | null;
  isEnabled: boolean;
  isUnlocked: boolean;
  queueLength: number;
  addToQueue: (text: string, id: string, priority?: boolean) => void;
  speakNow: (text: string, id: string) => void;
  stop: () => void;
  toggleVoice: () => void;
  hasBeenSpoken: (id: string) => boolean;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());
  const addedToQueueRef = useRef<Set<string>>(new Set());
  const isEnabledRef = useRef(true);
  const isUnlockedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserInteracted = useRef(false);
  
  // DUAS FILAS SEPARADAS!
  // Fila de NEWS (normal, lida em sequência)
  const newsQueueRef = useRef<QueueItem[]>([]);
  // Fila PRIORITÁRIA (mensagens do usuário, lida PRIMEIRO após terminar a atual)
  const priorityQueueRef = useRef<QueueItem[]>([]);

  // Inicialização
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsEnabled(true);
    isEnabledRef.current = true;
    console.log('💾 Voz ATIVA por padrão');
  }, []);

  // Sincronizar refs
  useEffect(() => { isEnabledRef.current = isEnabled; }, [isEnabled]);
  useEffect(() => { isUnlockedRef.current = isUnlocked; }, [isUnlocked]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Carregar voz
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

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

    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Atualizar contagem da fila
  const updateQueueLength = useCallback(() => {
    setQueueLength(priorityQueueRef.current.length + newsQueueRef.current.length);
  }, []);

  // ========== FALAR PRÓXIMO ITEM ==========
  const speakNext = useCallback(() => {
    console.log('🔄 speakNext chamado');
    console.log(`   Fila prioritária: ${priorityQueueRef.current.length}, News: ${newsQueueRef.current.length}`);

    // Verificações
    if (!isEnabledRef.current) {
      console.log('⏸️ Voz desabilitada');
      return;
    }
    if (!isUnlockedRef.current) {
      console.log('🔒 TTS não desbloqueado');
      return;
    }
    if (isSpeakingRef.current) {
      console.log('🔊 Já está falando');
      return;
    }

    // PRIORIDADE: Primeiro verifica fila prioritária (mensagens do usuário)
    let nextItem: QueueItem | undefined;
    
    if (priorityQueueRef.current.length > 0) {
      nextItem = priorityQueueRef.current.shift();
      console.log('🔝 LENDO MENSAGEM PRIORITÁRIA:', nextItem?.text.slice(0, 50));
    } else if (newsQueueRef.current.length > 0) {
      nextItem = newsQueueRef.current.shift();
      console.log('📰 Lendo news:', nextItem?.text.slice(0, 50));
    }

    if (!nextItem) {
      console.log('✅ Ambas filas vazias');
      updateQueueLength();
      return;
    }

    updateQueueLength();

    // Marcar como falado
    spokenIdsRef.current.add(nextItem.id);

    // Criar utterance
    const utterance = new SpeechSynthesisUtterance(nextItem.text);
    
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    utterance.volume = 1.0;

    const itemId = nextItem.id;
    const itemText = nextItem.text;

    utterance.onstart = () => {
      console.log('🔊 COMEÇOU:', itemText.slice(0, 50));
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(itemId);

      window.dispatchEvent(new CustomEvent('character-speak-start', {
        detail: { text: itemText }
      }));
    };

    utterance.onend = () => {
      console.log('✅ TERMINOU');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);

      window.dispatchEvent(new CustomEvent('character-speak-end'));

      // Processar próximo após 2 segundos
      const totalRemaining = priorityQueueRef.current.length + newsQueueRef.current.length;
      if (isEnabledRef.current && isUnlockedRef.current && totalRemaining > 0) {
        console.log(`⏱️ Aguardando 2s... (${priorityQueueRef.current.length} prioritários, ${newsQueueRef.current.length} news)`);
        processingTimeoutRef.current = setTimeout(() => {
          speakNext();
        }, 2000);
      } else {
        console.log('📭 Filas vazias');
      }
    };

    utterance.onerror = (e) => {
      console.error('❌ ERRO TTS:', e.error);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);

      window.dispatchEvent(new CustomEvent('character-speak-end'));

      if (e.error === 'not-allowed') {
        console.log('🔒 TTS bloqueado');
        setIsUnlocked(false);
        isUnlockedRef.current = false;
      } else if (e.error !== 'interrupted' && e.error !== 'canceled') {
        processingTimeoutRef.current = setTimeout(() => speakNext(), 1000);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [updateQueueLength]);

  // ========== DESBLOQUEAR COM CLIQUE ==========
  const unlockWithClick = useCallback(() => {
    if (isUnlockedRef.current) return;
    
    console.log('🖱️ Clique detectado - desbloqueando TTS...');
    hasUserInteracted.current = true;

    try {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      
      unlock.onend = () => {
        console.log('✅ TTS DESBLOQUEADO!');
        setIsUnlocked(true);
        isUnlockedRef.current = true;
        setTimeout(() => speakNext(), 100);
      };

      unlock.onerror = () => {
        const unlock2 = new SpeechSynthesisUtterance('.');
        unlock2.volume = 0.01;
        
        unlock2.onend = () => {
          console.log('✅ TTS DESBLOQUEADO!');
          setIsUnlocked(true);
          isUnlockedRef.current = true;
          setTimeout(() => speakNext(), 100);
        };

        window.speechSynthesis.speak(unlock2);
      };

      window.speechSynthesis.speak(unlock);
    } catch (e) {
      console.error('❌ Erro ao desbloquear:', e);
    }
  }, [speakNext]);

  // ========== LISTENER DE CLIQUE ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleInteraction = () => {
      if (!isUnlockedRef.current) {
        unlockWithClick();
      }
    };
    
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    console.log('🚀 Aguardando clique para ativar voz...');

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [unlockWithClick]);

  // ========== TOGGLE VOZ ==========
  const toggleVoice = useCallback(() => {
    if (isEnabledRef.current) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      window.speechSynthesis?.cancel();
      
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      setIsEnabled(false);
      isEnabledRef.current = false;

      window.dispatchEvent(new CustomEvent('character-speak-end'));
      console.log('🔇 Voz MUTADA');

    } else {
      setIsEnabled(true);
      isEnabledRef.current = true;
      
      if (isUnlockedRef.current) {
        setTimeout(() => speakNext(), 100);
      }
      
      console.log('🔊 Voz ATIVADA');
    }
  }, [speakNext]);

  // ========== ADICIONAR À FILA ==========
  const addToQueue = useCallback((text: string, id: string, priority: boolean = false) => {
    // Ignorar se já foi falado
    if (spokenIdsRef.current.has(id)) {
      console.log('⏭️ Já foi lido:', id.slice(0, 30));
      return;
    }
    
    // Ignorar se já está na fila
    if (addedToQueueRef.current.has(id)) {
      console.log('⏭️ Já na fila:', id.slice(0, 30));
      return;
    }

    addedToQueueRef.current.add(id);

    if (priority) {
      // PRIORIDADE: Vai pra fila SEPARADA de prioridade
      console.log('🔝 MENSAGEM PRIORITÁRIA adicionada:', text.slice(0, 50));
      priorityQueueRef.current.push({ id, text, priority: true });
    } else {
      // Normal: Vai pra fila de news
      console.log('➕ News adicionada à fila:', text.slice(0, 50));
      newsQueueRef.current.push({ id, text, priority: false });
    }
    
    updateQueueLength();

    // Se não está falando e está desbloqueado, começar
    if (!isSpeakingRef.current && isUnlockedRef.current && isEnabledRef.current) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => speakNext(), 100);
    }
  }, [speakNext, updateQueueLength]);

  // ========== FALAR AGORA (interrompe atual) ==========
  const speakNow = useCallback((text: string, id: string) => {
    if (!isEnabledRef.current) return;

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    spokenIdsRef.current.add(id);

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(id);
      window.dispatchEvent(new CustomEvent('character-speak-start', { detail: { text } }));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
      
      const totalRemaining = priorityQueueRef.current.length + newsQueueRef.current.length;
      if (isEnabledRef.current && totalRemaining > 0) {
        processingTimeoutRef.current = setTimeout(() => speakNext(), 2000);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    window.speechSynthesis?.speak(utterance);
  }, [speakNext]);

  // ========== STOP ==========
  const stop = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentId(null);
    priorityQueueRef.current = [];
    newsQueueRef.current = [];
    updateQueueLength();

    window.dispatchEvent(new CustomEvent('character-speak-end'));
  }, [updateQueueLength]);

  const hasBeenSpoken = useCallback((id: string) => {
    return spokenIdsRef.current.has(id);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <VoiceContext.Provider value={{
      isSpeaking,
      currentId,
      isEnabled,
      isUnlocked,
      queueLength,
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

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
