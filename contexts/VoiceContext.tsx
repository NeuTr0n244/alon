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
  const hasAutoUnlocked = useRef(false);
  
  // ========== NOVOS REFS PARA CONTROLE ==========
  const isProcessingRef = useRef(false); // Evita processamento duplicado
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Controle do timeout
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null); // Referência da utterance atual

  // FORÇAR VOZ SEMPRE ATIVA NA INICIALIZAÇÃO
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

  // AUTO-DESBLOQUEAR AGRESSIVAMENTE
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasAutoUnlocked.current) return;

    const autoUnlock = () => {
      if (hasAutoUnlocked.current) return;

      console.log('🔓 AUTO-DESBLOQUEANDO TTS AGORA...');

      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);

      setIsUnlocked(true);
      isUnlockedRef.current = true;
      hasAutoUnlocked.current = true;

      console.log('✅ TTS DESBLOQUEADO! Iniciando leitura automática...');
    };

    console.log('🚀 INICIANDO AUTO-UNLOCK - Aguardando QUALQUER interação...');
    console.log('💡 MOVA O MOUSE ou TOQUE NA TELA para iniciar!');

    const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll', 'mousedown', 'touchmove', 'wheel'];

    events.forEach(event => {
      document.addEventListener(event, autoUnlock, { once: true, passive: true });
    });

    const autoUnlockTimer = setTimeout(() => {
      if (!hasAutoUnlocked.current) {
        console.log('⚠️ Tentando unlock automático...');
        autoUnlock();
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, autoUnlock);
      });
      clearTimeout(autoUnlockTimer);
    };
  }, []);

  // ========== PROCESSAR PRÓXIMO ITEM DA FILA ==========
  const processNextItem = useCallback(() => {
    console.log('🔄 processNextItem chamado');
    console.log(`   Estado: enabled=${isEnabledRef.current}, unlocked=${isUnlockedRef.current}, speaking=${isSpeakingRef.current}, processing=${isProcessingRef.current}`);

    // Verificações
    if (!isEnabledRef.current) {
      console.log('⏸️ Voz desabilitada, parando processamento');
      isProcessingRef.current = false;
      return;
    }

    if (!isUnlockedRef.current) {
      console.log('🔒 TTS não desbloqueado');
      isProcessingRef.current = false;
      return;
    }

    if (isSpeakingRef.current) {
      console.log('🔇 Já está falando, aguardando...');
      isProcessingRef.current = false;
      return;
    }

    // Pegar próximo item não falado
    setQueue(currentQueue => {
      const nextItem = currentQueue.find(item => !spokenIdsRef.current.has(item.id));

      if (!nextItem) {
        console.log('✅ Fila vazia ou todos já foram lidos');
        isProcessingRef.current = false;
        return [];
      }

      console.log('🎯 Próximo item:', nextItem.text.slice(0, 50));

      // Falar o item
      speakItemInternal(nextItem);

      // Remover da fila
      return currentQueue.filter(item => item.id !== nextItem.id);
    });
  }, []);

  // ========== FALAR UM ITEM (INTERNO) ==========
  const speakItemInternal = useCallback((item: QueueItem) => {
    console.log('🔵 speakItemInternal:', item.text.slice(0, 50));

    if (!isEnabledRef.current) {
      console.log('❌ Voz desabilitada');
      isProcessingRef.current = false;
      return;
    }

    if (spokenIdsRef.current.has(item.id)) {
      console.log('❌ Já foi falado:', item.id.slice(0, 30));
      isProcessingRef.current = false;
      // Processar próximo
      setTimeout(() => processNextItem(), 100);
      return;
    }

    if (!window.speechSynthesis) {
      console.error('❌ speechSynthesis não disponível!');
      isProcessingRef.current = false;
      return;
    }

    // Marcar como falado ANTES de começar (evita duplicação)
    spokenIdsRef.current.add(item.id);

    const utterance = new SpeechSynthesisUtterance(item.text);
    currentUtteranceRef.current = utterance;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('🔊 INICIOU FALA:', item.text.slice(0, 50));

      if (!isEnabledRef.current) {
        console.log('❌ Voz desabilitada durante fala, cancelando');
        window.speechSynthesis.cancel();
        return;
      }

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(item.id);

      window.dispatchEvent(new CustomEvent('character-speak-start', {
        detail: { text: item.text }
      }));
    };

    utterance.onend = () => {
      console.log('✅ TERMINOU FALA:', item.id.slice(0, 30));
      
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      isProcessingRef.current = false;
      currentUtteranceRef.current = null;

      window.dispatchEvent(new CustomEvent('character-speak-end'));

      // Processar próximo item após 3 segundos
      if (isEnabledRef.current) {
        console.log('⏱️ Aguardando 3s para próximo item...');
        processingTimeoutRef.current = setTimeout(() => {
          processNextItem();
        }, 3000);
      }
    };

    utterance.onerror = (e) => {
      console.error('❌ ERRO TTS:', e.error);
      
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      isProcessingRef.current = false;
      currentUtteranceRef.current = null;

      window.dispatchEvent(new CustomEvent('character-speak-end'));

      // Tentar próximo item após erro (exceto se foi cancelado intencionalmente)
      if (e.error !== 'interrupted' && e.error !== 'canceled' && isEnabledRef.current) {
        processingTimeoutRef.current = setTimeout(() => {
          processNextItem();
        }, 1000);
      }
    };

    console.log('📢 Chamando speechSynthesis.speak()...');
    window.speechSynthesis.speak(utterance);
  }, [processNextItem]);

  // ========== INICIAR PROCESSAMENTO DA FILA ==========
  const startProcessing = useCallback(() => {
    console.log('🚀 startProcessing chamado');
    
    if (isProcessingRef.current) {
      console.log('⚠️ Já está processando, ignorando');
      return;
    }

    if (!isEnabledRef.current) {
      console.log('⏸️ Voz desabilitada');
      return;
    }

    if (!isUnlockedRef.current) {
      console.log('🔒 TTS não desbloqueado');
      return;
    }

    isProcessingRef.current = true;
    processNextItem();
  }, [processNextItem]);

  // ========== EFEITO PARA INICIAR PROCESSAMENTO ==========
  useEffect(() => {
    if (queue.length > 0) {
      console.log(`📋 Fila: ${queue.length} items | enabled: ${isEnabled} | unlocked: ${isUnlocked} | speaking: ${isSpeaking}`);
    }

    // Só iniciar se todas as condições forem atendidas
    if (isEnabled && isUnlocked && !isSpeaking && queue.length > 0 && !isProcessingRef.current) {
      console.log('🚀 Condições atendidas, iniciando processamento...');
      
      // Pequeno delay para evitar race conditions
      const timer = setTimeout(() => {
        startProcessing();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [queue.length, isSpeaking, isEnabled, isUnlocked, startProcessing]);

  // ========== TOGGLE VOZ (MUTE/UNMUTE) ==========
  const toggleVoice = useCallback(() => {
    console.log('========== TOGGLE VOICE ==========');
    console.log('Estado atual:', { isEnabled: isEnabledRef.current, isSpeaking: isSpeakingRef.current, queueLength: queue.length });

    if (isEnabledRef.current) {
      // ===== MUTANDO =====
      console.log('>>> MUTANDO <<<');

      // 1. Limpar timeout pendente
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      // 2. Cancelar TTS atual
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // 3. Resetar estados
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      isProcessingRef.current = false;
      setCurrentId(null);
      currentUtteranceRef.current = null;

      // 4. Desabilitar voz
      setIsEnabled(false);
      isEnabledRef.current = false;

      // 5. Disparar evento
      window.dispatchEvent(new CustomEvent('character-speak-end'));

      console.log('✅ Voz MUTADA (fila preservada com', queue.length, 'items)');

    } else {
      // ===== DESMUTANDO =====
      console.log('>>> DESMUTANDO <<<');

      // 1. Habilitar voz
      setIsEnabled(true);
      isEnabledRef.current = true;

      // 2. Resetar flags
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      setIsSpeaking(false);

      // 3. Re-desbloquear TTS (browsers podem bloquear após pausa)
      console.log('🔓 Re-desbloqueando TTS...');
      
      try {
        // Fala silenciosa para desbloquear
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        
        unlock.onend = () => {
          console.log('✅ TTS re-desbloqueado');
          
          // Garantir que está desbloqueado
          setIsUnlocked(true);
          isUnlockedRef.current = true;
          
          // Iniciar processamento após pequeno delay
          setTimeout(() => {
            console.log('🚀 Retomando fila após unmute...');
            console.log(`📋 Fila tem ${queue.length} items`);
            startProcessing();
          }, 500);
        };

        unlock.onerror = () => {
          console.log('⚠️ Erro ao re-desbloquear, tentando novamente...');
          // Tentar iniciar mesmo assim
          setTimeout(() => {
            startProcessing();
          }, 500);
        };

        window.speechSynthesis.speak(unlock);
      } catch (e) {
        console.error('❌ Erro ao re-desbloquear:', e);
        // Tentar iniciar mesmo assim
        setTimeout(() => {
          startProcessing();
        }, 500);
      }

      console.log('✅ Voz DESMUTADA');
    }
  }, [queue.length, startProcessing]);

  // ========== ADICIONAR À FILA ==========
  const addToQueue = useCallback((text: string, id: string, priority: boolean = false) => {
    // Permitir adicionar mesmo se desabilitado (para acumular na fila)
    
    if (spokenIdsRef.current.has(id)) {
      return; // Já foi falado
    }

    if (addedToQueueRef.current.has(id)) {
      return; // Já na fila
    }

    console.log(`➕ Adicionando ${priority ? '(PRIORIDADE)' : ''}:`, id.slice(0, 40));

    addedToQueueRef.current.add(id);

    if (priority && isEnabledRef.current) {
      console.log('🚨 NEWS NOVA! Interrompendo leitura atual...');

      // Limpar timeout pendente
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      // Cancelar fala atual
      if (isSpeakingRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        isProcessingRef.current = false;
        setCurrentId(null);
      }

      // Adicionar no início
      setQueue(prev => [{ id, text }, ...prev]);
    } else {
      // Adicionar no final
      setQueue(prev => [...prev, { id, text }]);
    }
  }, []);

  // ========== FALAR IMEDIATAMENTE (MANUAL) ==========
  const speakNow = useCallback((text: string, id: string) => {
    if (!isEnabledRef.current) {
      console.log('❌ Voz desabilitada');
      return;
    }

    console.log('🎯 LEITURA MANUAL:', text.slice(0, 40));

    // Limpar timeout e cancelar fala atual
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isProcessingRef.current = false;

    // Marcar como falado
    spokenIdsRef.current.add(id);

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

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentId(id);

      window.dispatchEvent(new CustomEvent('character-speak-start', {
        detail: { text }
      }));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentId(null);
      window.dispatchEvent(new CustomEvent('character-speak-end'));

      // Retomar fila após fala manual
      if (isEnabledRef.current) {
        processingTimeoutRef.current = setTimeout(() => {
          processNextItem();
        }, 3000);
      }
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
  }, [processNextItem]);

  // ========== STOP ==========
  const stop = useCallback(() => {
    console.log('🛑 STOP chamado');

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isProcessingRef.current = false;
    setCurrentId(null);
    setQueue([]);

    window.dispatchEvent(new CustomEvent('character-speak-end'));
  }, []);

  // Verificar se já foi lido
  const hasBeenSpoken = useCallback((id: string) => {
    return spokenIdsRef.current.has(id);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
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

// Hook para usar o context
export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
