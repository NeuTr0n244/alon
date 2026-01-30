import { create } from 'zustand';
import { Token, TokenTrade } from '@/types/token';

interface TokenStore {
  tokens: Token[];
  migratedTokens: Token[];
  maxTokens: number;
  addToken: (token: Token) => void;
  updateTokenTrade: (trade: TokenTrade) => void;
  clearTokens: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokens: [],
  migratedTokens: [],
  maxTokens: parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || '100'),

  addToken: (token: Token) => {
    set((state) => {
      // Check if token already exists in either list
      const existsInNew = state.tokens.some((t) => t.mint === token.mint);
      const existsInMigrated = state.migratedTokens.some((t) => t.mint === token.mint);

      if (existsInNew || existsInMigrated) {
        console.log('[TokenStore] Token já existe:', token.symbol);
        return state;
      }

      // Se token está marcado como migrado, adiciona na lista de migrados
      if (token.isMigrated) {
        console.log('[TokenStore] ✅ Adicionando token migrado:', token.symbol);
        const newMigratedTokens = [token, ...state.migratedTokens];
        if (newMigratedTokens.length > state.maxTokens) {
          newMigratedTokens.splice(state.maxTokens);
        }
        return { migratedTokens: newMigratedTokens };
      }

      // Token novo vai para lista de novos
      console.log('[TokenStore] ✅ Adicionando token novo:', token.symbol);
      const newTokens = [token, ...state.tokens];
      if (newTokens.length > state.maxTokens) {
        newTokens.splice(state.maxTokens);
      }

      return { tokens: newTokens };
    });
  },

  updateTokenTrade: (trade: TokenTrade) => {
    set((state) => {
      const tokens = state.tokens.map((token) => {
        if (token.mint === trade.mint) {
          const updatedToken = { ...token };

          // Update trade count
          updatedToken.tradeCount = (updatedToken.tradeCount || 0) + 1;

          // Update volume
          updatedToken.volume24h = (updatedToken.volume24h || 0) + trade.sol_amount;

          // Estimate market cap based on trade
          if (trade.sol_amount > 0 && trade.token_amount > 0) {
            const pricePerToken = trade.sol_amount / trade.token_amount;
            updatedToken.priceNative = pricePerToken;
          }

          // Calculate percentage change (simplified)
          if (updatedToken.priceNative && token.priceNative) {
            const change =
              ((updatedToken.priceNative - token.priceNative) / token.priceNative) * 100;
            updatedToken.percentage = parseFloat(change.toFixed(2));
          }

          return updatedToken;
        }
        return token;
      });

      const migratedTokens = state.migratedTokens.map((token) => {
        if (token.mint === trade.mint) {
          const updatedToken = { ...token };
          updatedToken.tradeCount = (updatedToken.tradeCount || 0) + 1;
          updatedToken.volume24h = (updatedToken.volume24h || 0) + trade.sol_amount;
          return updatedToken;
        }
        return token;
      });

      return { tokens, migratedTokens };
    });
  },

  clearTokens: () => {
    set({ tokens: [], migratedTokens: [] });
  },

  searchQuery: '',
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
}));
