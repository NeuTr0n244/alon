'use client';

import { useState, useEffect, useCallback } from 'react';
import { pumpPortalClient } from '@/lib/websocket/pumpPortal';
import { Token, WebSocketMessage } from '@/types/token';

export function useMigratedTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const addToken = useCallback((token: Token) => {
    setTokens((prev) => {
      // Evitar duplicatas
      if (prev.some((t) => t.mint === token.mint)) {
        console.log('[useMigratedTokens] Token já existe:', token.symbol);
        return prev;
      }

      console.log('[useMigratedTokens] ✅ Added migrated token:', token.symbol);

      // Adicionar no início, máximo 50 tokens
      return [token, ...prev].slice(0, 50);
    });
  }, []);

  // Fetch existing migrated tokens from API on mount
  useEffect(() => {
    const fetchExistingTokens = async () => {
      try {
        console.log('[useMigratedTokens] 📡 Fetching existing migrated tokens from API...');
        const response = await fetch('/api/migrated');

        if (!response.ok) {
          console.error('[useMigratedTokens] API error:', response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[useMigratedTokens] ✅ Loaded', data.length, 'existing tokens');

        // Convert API format to Token format
        const tokensFromAPI: Token[] = data.map((t: any) => ({
          mint: t.mint,
          name: t.name,
          symbol: t.symbol,
          image: t.image,
          marketCap: parseFloat(t.marketCapFormatted?.replace(/[^0-9.]/g, '') || '0') * 1000000, // Convert to actual number
          volume: parseFloat(t.volumeFormatted?.replace(/[^0-9.]/g, '') || '0') * 1000000,
          createdAt: Date.now() - (Math.random() * 3600000), // Random age within last hour
          isMigrated: true,
        }));

        setTokens(tokensFromAPI);
        setLoading(false);
      } catch (error) {
        console.error('[useMigratedTokens] Error fetching tokens:', error);
        setLoading(false);
      }
    };

    fetchExistingTokens();
  }, []);

  // Listen for real-time migrations via WebSocket
  useEffect(() => {
    const handler = (message: WebSocketMessage) => {
      if (message.type === 'newToken' && message.data.isMigrated) {
        console.log('[useMigratedTokens] 🎓 MIGRATION:', message.data.name, message.data.symbol);
        addToken(message.data);
      }
    };

    // Adicionar handler
    pumpPortalClient.addHandler(handler);

    // Conectar se não estiver conectado
    if (!pumpPortalClient.isConnected()) {
      console.log('[useMigratedTokens] Connecting to WebSocket...');
      pumpPortalClient.connect().catch((error) => {
        console.error('[useMigratedTokens] Failed to connect:', error);
      });
    }

    return () => {
      // Remover handler ao desmontar
      pumpPortalClient.removeHandler(handler);
    };
  }, [addToken]);

  const getAge = useCallback((timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }, []);

  return { tokens, loading, getAge };
}
