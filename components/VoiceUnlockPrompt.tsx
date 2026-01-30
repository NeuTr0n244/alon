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

  return (
    <div className={styles.overlay} onClick={() => {}}>
      <div className={styles.prompt}>
        <div className={styles.icon}>🔊</div>
        <h2 className={styles.title}>Voice Announcements Ready</h2>
        <p className={styles.message}>
          {queueLength} news {queueLength === 1 ? 'item' : 'items'} waiting to be read
        </p>
        <p className={styles.hint}>
          Click anywhere or move your mouse to activate voice
        </p>
        <div className={styles.pulse}></div>
      </div>
    </div>
  );
}
