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
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());
  const addedToQueueRef = useRef<Set<string>>(new Set());
  const isEnabledRef = useRef(true);
  const isUnlockedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserInteracted = useRef(false);

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

  // ========== PROCESSAR FILA ==========
  const processQueue = useCallback(() => {
    console.log('🔄 processQueue chamado');
    console.log(`   Estado: enabled=${isEnabledRef.current}, unlocked=${isUnlockedRef.current}, speaking=${isSpeakingRef.current}, processing=${isProcessingRef.current}`);

    if (!isEnabledRef.current || !isUnlockedRef.current || isSpeakingRef.current || isProcessingRef.current) {
      console.log('⏸️ Condições não atendidas, aguardando...');
      return;
    }

    setQueue(currentQueue => {
      // Pegar próximo item que NÃO foi falado ainda
      const nextItem = currentQueue.find(item => !spokenIdsRef.current.has(item.id));

      if (!nextItem) {
        console.log('✅ Nenhum item pendente na fila');
        isProcessingRef.current = false;
        return currentQueue;
      }

      console.log('🎯 Tentando falar:', nextItem.text.slice(0, 50));
      isProcessingRef.current = true;

      // Tentar falar
      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }
      
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 0.8;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('🔊 COMEÇOU A FALAR:', nextItem.text.slice(0, 50));
        
        // SÓ MARCA COMO LIDO AQUI - quando realmente começou a falar!
        spokenIdsRef.current.add(nextItem.id);
        
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setCurrentId(nextItem.id);

        window.dispatchEvent(new CustomEvent('character-speak-start', {
          detail: { text: nextItem.text }
        }));
      };

      utterance.onend = () => {
        console.log('✅ TERMINOU DE FALAR');
        
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setCurrentId(null);
        isProcessingRef.current = false;

        window.dispatchEvent(new CustomEvent('character-speak-end'));

        // Processar próximo após 3 segundos
        if (isEnabledRef.current && isUnlockedRef.current) {
          processingTimeoutRef.current = setTimeout(() => {
            processQueue();
          }, 3000);
        }
      };

      utterance.onerror = (e) => {
        console.error('❌ ERRO TTS:', e.error);
        
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setCurrentId(null);
        isProcessingRef.current = false;

        window.dispatchEvent(new CustomEvent('character-speak-end'));

        // Se erro é "not-allowed", NÃO marca como lido - vai tentar de novo
        if (e.error === 'not-allowed') {
          console.log('🔒 TTS bloqueado - aguardando interação do usuário');
          // Marcar como não desbloqueado para tentar de novo
          setIsUnlocked(false);
          isUnlockedRef.current = false;
        } else if (e.error !== 'interrupted' && e.error !== 'canceled') {
          // Outros erros - tentar próximo item
          processingTimeoutRef.current = setTimeout(() => {
            processQueue();
          }, 1000);
        }
      };

      window.speechSynthesis.speak(utterance);

      // Remover da fila visual (mas só marca como lido no onstart)
      return currentQueue.filter(item => item.id !== nextItem.id);
    });
  }, []);

  // ========== DESBLOQUEAR COM CLIQUE ==========
  const unlockWithClick = useCallback(() => {
    if (hasUserInteracted.current && isUnlockedRef.current) return;
    
    console.log('🖱️ Interação detectada - desbloqueando TTS...');
    hasUserInteracted.current = true;

    // Tentar desbloquear com utterance silenciosa
    try {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      
      unlock.onend = () => {
        console.log('✅ TTS DESBLOQUEADO!');
        setIsUnlocked(true);
        isUnlockedRef.current = true;
        
        // Processar fila após desbloquear
        setTimeout(() => {
          processQueue();
        }, 100);
      };

      unlock.onerror = () => {
        console.log('⚠️ Falha no desbloqueio silencioso, tentando com texto...');
        
        // Tentar com texto mínimo
        const unlock2 = new SpeechSynthesisUtterance('.');
        unlock2.volume = 0.01;
        
        unlock2.onend = () => {
          console.log('✅ TTS DESBLOQUEADO (método 2)!');
          setIsUnlocked(true);
          isUnlockedRef.current = true;
          setTimeout(() => processQueue(), 100);
        };

        unlock2.onerror = () => {
          console.log('❌ Falha total no desbloqueio');
        };

        window.speechSynthesis.speak(unlock2);
      };

      window.speechSynthesis.speak(unlock);
    } catch (e) {
      console.error('❌ Erro ao desbloquear:', e);
    }
  }, [processQueue]);

  // ========== LISTENER DE CLIQUE GLOBAL ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleInteraction = () => {
      unlockWithClick();
    };

    // Múltiplos eventos para capturar qualquer interação
    const events = ['click', 'touchstart', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    console.log('🚀 Aguardando interação do usuário para ativar voz...');

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [unlockWithClick]);

  // ========== EFEITO PARA PROCESSAR FILA ==========
  useEffect(() => {
    if (queue.length > 0 && isEnabled && isUnlocked && !isSpeaking && !isProcessingRef.current) {
      console.log(`📋 Fila: ${queue.length} items - processando...`);
      processQueue();
    }
  }, [queue.length, isEnabled, isUnlocked, isSpeaking, processQueue]);

  // ========== TOGGLE VOZ ==========
  const toggleVoice = useCallback(() => {
    console.log('🔄 Toggle voice:', isEnabledRef.current ? 'OFF' : 'ON');

    if (isEnabledRef.current) {
      // MUTANDO
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      window.speechSynthesis?.cancel();
      
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      isProcessingRef.current = false;
      setCurrentId(null);
      setIsEnabled(false);
      isEnabledRef.current = false;

      window.dispatchEvent(new CustomEvent('character-speak-end'));
      console.log('🔇 Voz MUTADA');

    } else {
      // DESMUTANDO
      setIsEnabled(true);
      isEnabledRef.current = true;
      isProcessingRef.current = false;

      // Tentar desbloquear novamente
      unlockWithClick();
      
      console.log('🔊 Voz ATIVADA');
    }
  }, [unlockWithClick]);

  // ========== ADICIONAR À FILA ==========
  const addToQueue = useCallback((text: string, id: string, priority: boolean = false) => {
    if (spokenIdsRef.current.has(id)) return;
    if (addedToQueueRef.current.has(id)) return;

    console.log(`➕ Adicionando à fila:`, id.slice(0, 40));
    addedToQueueRef.current.add(id);

    if (priority && isEnabledRef.current) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      if (isSpeakingRef.current) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        isProcessingRef.current = false;
        setCurrentId(null);
      }

      setQueue(prev => [{ id, text }, ...prev]);
    } else {
      setQueue(prev => [...prev, { id, text }]);
    }
  }, []);

  // ========== FALAR AGORA ==========
  const speakNow = useCallback((text: string, id: string) => {
    if (!isEnabledRef.current) return;

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isProcessingRef.current = false;

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
      
      if (isEnabledRef.current) {
        processingTimeoutRef.current = setTimeout(() => processQueue(), 3000);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));
    };

    window.speechSynthesis?.speak(utterance);
  }, [processQueue]);

  // ========== STOP ==========
  const stop = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isProcessingRef.current = false;
    setCurrentId(null);
    setQueue([]);

    window.dispatchEvent(new CustomEvent('character-speak-end'));
  }, []);

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

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
