import { Token, TokenTrade, WebSocketMessage } from '@/types/token';
import { fetchTokenImage } from '@/lib/utils/tokenMetadata';

export type MessageHandler = (message: WebSocketMessage) => void;

export class PumpPortalClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private handlers: Set<MessageHandler> = new Set();
  private isIntentionallyClosed = false;
  private url: string;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'wss://pumpportal.fun/api/data';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[PumpPortal] Connected to WebSocket');
          this.reconnectAttempts = 0;

          // Subscribe to new tokens, trades, and migrations
          this.send({ method: 'subscribeNewToken' });
          this.send({ method: 'subscribeTokenTrade', keys: [] });
          this.send({ method: 'subscribeMigration' });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data).catch((error) => {
              console.error('[PumpPortal] Failed to handle message:', error);
            });
          } catch (error) {
            console.error('[PumpPortal] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[PumpPortal] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[PumpPortal] WebSocket closed');
          this.ws = null;

          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PumpPortal] Max reconnect attempts reached');
      this.notifyHandlers({
        type: 'error',
        error: 'Max reconnection attempts reached',
      });
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    console.log(`[PumpPortal] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  private async handleMessage(data: any): Promise<void> {
    let message: WebSocketMessage;

    // LOG para debug
    console.log('[PumpPortal] WebSocket recebeu:', {
      txType: data.txType,
      pool: data.pool,
      name: data.name,
      symbol: data.symbol,
      complete: data.complete,
      raydium_pool: data.raydium_pool,
    });

    if (data.txType === 'create') {
      // New token created
      console.log('[PumpPortal] ✅ New token:', data.name, data.symbol);
      const token = await this.parseNewToken(data);
      message = {
        type: 'newToken',
        data: token,
      };
    } else if (data.txType === 'buy' || data.txType === 'sell') {
      // Token trade
      message = {
        type: 'trade',
        data: this.parseTokenTrade(data),
      };
    } else if (
      data.txType === 'migration' ||
      data.pool === 'raydium' ||
      data.pool === 'pump-amm' ||
      data.complete === true ||
      data.raydium_pool
    ) {
      // Token migrated
      console.log('[PumpPortal] 🎉 MIGRAÇÃO DETECTADA:', {
        name: data.name,
        symbol: data.symbol,
        pool: data.pool,
        txType: data.txType,
      });
      const token = await this.parseNewToken(data);
      token.isMigrated = true;
      message = {
        type: 'newToken',
        data: token,
      };
    } else {
      // Unknown message type, log for debugging
      console.log('[PumpPortal] ⚠️ Unknown message type:', data.txType, data);
      return;
    }

    this.notifyHandlers(message);
  }

  private async parseNewToken(data: any): Promise<Token> {
    const token: Token = {
      signature: data.signature || '',
      mint: data.mint || '',
      name: data.name || '',
      symbol: data.symbol || '',
      uri: data.uri || '',
      description: data.description,
      image: data.image,
      creator: data.traderPublicKey || data.creator,
      createdAt: data.timestamp || Date.now(),
      marketCap: data.marketCapSol ? parseFloat(data.marketCapSol) : 0,
      volume24h: 0,
      priceUsd: data.vSolInUSD ? parseFloat(data.vSolInUSD) : 0,
      priceNative: data.vTokensInSol ? parseFloat(data.vTokensInSol) : 0,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
      isMigrated: false,
      tradeCount: 0,
      holderCount: 0,
    };

    // Fetch image from URI if not directly provided
    if (!token.image && token.uri) {
      const imageUrl = await fetchTokenImage(token.uri);
      if (imageUrl) {
        token.image = imageUrl;
      }
    }

    return token;
  }

  private parseTokenTrade(data: any): TokenTrade {
    return {
      signature: data.signature || '',
      mint: data.mint || '',
      sol_amount: parseFloat(data.solAmount || 0),
      token_amount: parseFloat(data.tokenAmount || 0),
      is_buy: data.txType === 'buy',
      user: data.traderPublicKey || '',
      timestamp: data.timestamp || Date.now(),
      tx_index: data.txIndex || 0,
    };
  }

  private notifyHandlers(message: WebSocketMessage): void {
    this.handlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('[PumpPortal] Handler error:', error);
      }
    });
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[PumpPortal] Cannot send message, WebSocket not connected');
    }
  }

  addHandler(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  removeHandler(handler: MessageHandler): void {
    this.handlers.delete(handler);
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const pumpPortalClient = new PumpPortalClient();
