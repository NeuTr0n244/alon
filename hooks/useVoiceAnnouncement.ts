'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnnouncementQueueItem {
  text: string;
  timestamp: number;
}

export function useVoiceAnnouncement() {
  const queueRef = useRef<AnnouncementQueueItem[]>([]);
  const isSpeakingRef = useRef(false);
  const lastAnnouncementRef = useRef<number>(0);
  const MIN_INTERVAL = 5000; // 5 seconds between announcements

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || queueRef.current.length === 0) {
      return;
    }

    const now = Date.now();
    if (now - lastAnnouncementRef.current < MIN_INTERVAL) {
      return;
    }

    const item = queueRef.current.shift();
    if (!item) return;

    isSpeakingRef.current = true;
    lastAnnouncementRef.current = now;

    console.log('[VoiceAnnouncement] 🗣️ Speaking:', item.text);

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      console.log('[VoiceAnnouncement] ✅ Finished speaking');
      isSpeakingRef.current = false;

      // Process next item in queue after a delay
      setTimeout(() => {
        processQueue();
      }, MIN_INTERVAL);
    };

    utterance.onerror = (error) => {
      console.error('[VoiceAnnouncement] ❌ Speech error:', error);
      isSpeakingRef.current = false;

      // Try next item after error
      setTimeout(() => {
        processQueue();
      }, 1000);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.warn('[VoiceAnnouncement] ⚠️ Web Speech API not supported');
      return;
    }

    console.log('[VoiceAnnouncement] 📝 Queuing:', text);
    queueRef.current.push({
      text,
      timestamp: Date.now(),
    });

    // Start processing if not already speaking
    processQueue();
  }, [processQueue]);

  const announce = useCallback((tokenName: string, symbol: string, marketCap: string) => {
    const text = `New token: ${tokenName}, symbol ${symbol}. Market cap: ${marketCap}`;
    speak(text);
  }, [speak]);

  const stop = useCallback(() => {
    console.log('[VoiceAnnouncement] 🛑 Stopping speech');
    window.speechSynthesis.cancel();
    queueRef.current = [];
    isSpeakingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    announce,
    stop,
    isSpeaking: () => isSpeakingRef.current,
    queueLength: () => queueRef.current.length,
  };
}
