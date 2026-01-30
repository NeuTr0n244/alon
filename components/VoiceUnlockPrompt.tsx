'use client';

import { useState, useEffect } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import styles from './VoiceUnlockPrompt.module.css';

export function VoiceUnlockPrompt() {
  const { isEnabled, isUnlocked, queueLength } = useVoice();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mostrar se voz está habilitada, mas não desbloqueada, e tem items na fila
    if (isEnabled && !isUnlocked && queueLength > 0) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isEnabled, isUnlocked, queueLength]);

  if (!show) return null;

  const handleClick = () => {
    // Forçar unlock ao clicar
    const unlock = new SpeechSynthesisUtterance('');
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
  };

  return (
    <div className={styles.overlay} onClick={handleClick}>
      <div className={styles.prompt}>
        <div className={styles.icon}>🔊</div>
        <h2 className={styles.title}>🚀 AUTO-READ MODE READY</h2>
        <p className={styles.message}>
          <strong>{queueLength} NEWS</strong> waiting to be read automatically
        </p>
        <p className={styles.hint}>
          👆 CLICK HERE or MOVE MOUSE to start auto-reading
        </p>
        <div className={styles.action}>
          <div className={styles.pulse}></div>
          <button className={styles.startBtn}>START READING NOW</button>
        </div>
      </div>
    </div>
  );
}
