'use client';

import { useEffect, useState } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import styles from './SpeechCaption.module.css';

export function SpeechCaption() {
  const { isEnabled, isSpeaking } = useVoice();
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    // Escutar quando começar a falar
    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent;
      const text = customEvent.detail?.text || '';
      setCurrentText(text);
      setIsVisible(true);
    };

    // Escutar quando parar de falar
    const handleEnd = () => {
      setIsVisible(false);
      // Delay para animação de fade out
      setTimeout(() => setCurrentText(''), 300);
    };

    window.addEventListener('character-speak-start', handleStart);
    window.addEventListener('character-speak-end', handleEnd);

    return () => {
      window.removeEventListener('character-speak-start', handleStart);
      window.removeEventListener('character-speak-end', handleEnd);
    };
  }, []);

  // Só mostrar se habilitado E falando
  if (!isEnabled || !isSpeaking || (!isVisible && !currentText)) return null;

  return (
    <div className={`${styles.captionContainer} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.captionBox}>
        <div className={styles.captionHeader}>
          <span className={styles.micIcon}>🎤</span>
          <span className={styles.speakingLabel}>ALON SPEAKING</span>
        </div>
        <p className={styles.captionText}>{currentText}</p>
      </div>
    </div>
  );
}
