'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { pumpPortalClient, MessageHandler } from '@/lib/websocket/pumpPortal';
import { useTokenStore } from '@/store/tokenStore';
import { useUIStore } from '@/store/uiStore';

interface WebSocketContextValue {
  isConnected: boolean;
  addHandler: (handler: MessageHandler) => void;
  removeHandler: (handler: MessageHandler) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const addToken = useTokenStore((state) => state.addToken);
  const updateTokenTrade = useTokenStore((state) => state.updateTokenTrade);
  const { isConnected, setConnected } = useUIStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const messageHandler: MessageHandler = (message) => {
      if (message.type === 'newToken' && message.data) {
        addToken(message.data);
      } else if (message.type === 'trade' && message.data) {
        updateTokenTrade(message.data);
      } else if (message.type === 'error') {
        console.error('[WebSocket] Error:', message.error);
        setConnected(false);
      }
    };

    pumpPortalClient.addHandler(messageHandler);

    pumpPortalClient
      .connect()
      .then(() => {
        setConnected(true);
      })
      .catch((error) => {
        console.error('[WebSocket] Failed to connect:', error);
        setConnected(false);
      });

    return () => {
      pumpPortalClient.removeHandler(messageHandler);
      pumpPortalClient.disconnect();
    };
  }, [addToken, updateTokenTrade, setConnected]);

  const contextValue: WebSocketContextValue = {
    isConnected,
    addHandler: (handler) => pumpPortalClient.addHandler(handler),
    removeHandler: (handler) => pumpPortalClient.removeHandler(handler),
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
