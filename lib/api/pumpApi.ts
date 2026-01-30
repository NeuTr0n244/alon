import { Token } from '@/types/token';

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete?: boolean;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  total_supply?: number;
  market_cap?: number;
  reply_count?: number;
  last_reply?: number;
  nsfw?: boolean;
  market_cap_sol?: number;
  usd_market_cap?: number;
  king_of_the_hill_timestamp?: number;
  inverted?: boolean;
  is_currently_live?: boolean;
  username?: string;
  profile_image?: string;
  creator?: string;
}

// ========== FETCH NEW TOKENS - USANDO DEXSCREENER ==========
export async function fetchNewTokens(limit = 50): Promise<Token[]> {
  console.log('[PumpAPI] Fetching new tokens from DexScreener...');
  
  try {
    // Usar DexScreener para buscar tokens novos da Solana
    const response = await fetch(
      'https://api.dexscreener.com/token-profiles/latest/v1',
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      console.error('[PumpAPI] DexScreener failed:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('[PumpAPI] Invalid DexScreener response');
      return [];
    }

    // Filtrar apenas tokens Solana
    const solanaTokens = data
      .filter((token: any) => token.chainId === 'solana')
      .slice(0, limit);

    console.log('[PumpAPI] Found', solanaTokens.length, 'Solana tokens');

    // Buscar dados de preço para cada token
    const tokens: Token[] = [];
    
    for (const token of solanaTokens.slice(0, 20)) {
      try {
        const pairResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${token.tokenAddress}`
        );
        
        if (pairResponse.ok) {
          const pairData = await pairResponse.json();
          const pair = pairData.pairs?.[0];
          
          if (pair) {
            tokens.push({
              signature: '',
              mint: token.tokenAddress,
              name: pair.baseToken?.name || token.description || 'Unknown',
              symbol: pair.baseToken?.symbol || '???',
              uri: token.icon || '',
              description: token.description,
              image: token.icon || pair.info?.imageUrl,
              creator: '',
              createdAt: pair.pairCreatedAt || Date.now(),
              marketCap: pair.fdv || pair.marketCap || 0,
              volume24h: parseFloat(pair.volume?.h24 || '0'),
              priceUsd: parseFloat(pair.priceUsd || '0'),
              priceNative: parseFloat(pair.priceNative || '0'),
              twitter: token.links?.find((l: any) => l.type === 'twitter')?.url,
              telegram: token.links?.find((l: any) => l.type === 'telegram')?.url,
              website: token.links?.find((l: any) => l.type === 'website')?.url,
              isMigrated: false,
              tradeCount: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
              holderCount: 0,
            });
          }
        }
      } catch (e) {
        // Ignorar erros individuais
      }
    }

    console.log('[PumpAPI] Fetched', tokens.length, 'new tokens with data');
    return tokens;

  } catch (error) {
    console.error('[PumpAPI] Error fetching new tokens:', error);
    return [];
  }
}

// ========== FETCH MIGRATED TOKENS ==========
export async function fetchMigratedTokens(limit = 50): Promise<Token[]> {
  console.log('[PumpAPI] Fetching migrated tokens from DexScreener...');

  try {
    // Buscar tokens que migraram para Raydium
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=pump.fun'
    );

    if (!response.ok) {
      console.error('[PumpAPI] DexScreener migrated failed:', response.status);
      return [];
    }

    const data = await response.json();
    const pairs = data.pairs || [];

    console.log('[PumpAPI] DexScreener returned', pairs.length, 'pairs');

    const tokens: Token[] = pairs
      .filter((pair: any) => 
        pair.chainId === 'solana' && 
        (pair.dexId === 'raydium' || pair.dexId === 'pumpswap' || pair.labels?.includes('pump.fun'))
      )
      .slice(0, limit)
      .map((pair: any) => ({
        signature: '',
        mint: pair.baseToken?.address || '',
        name: pair.baseToken?.name || '',
        symbol: pair.baseToken?.symbol || '',
        uri: '',
        image: pair.info?.imageUrl || '',
        creator: '',
        createdAt: pair.pairCreatedAt || Date.now(),
        marketCap: parseFloat(pair.marketCap || pair.fdv || 0),
        volume24h: parseFloat(pair.volume?.h24 || 0),
        priceUsd: parseFloat(pair.priceUsd || 0),
        priceNative: parseFloat(pair.priceNative || 0),
        isMigrated: true,
        tradeCount: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        holderCount: 0,
      }));

    if (tokens.length > 0) {
      console.log('[PumpAPI] ✅ Fetched', tokens.length, 'migrated tokens');
      return tokens;
    }

    return [];
  } catch (error) {
    console.error('[PumpAPI] Error fetching migrated tokens:', error);
    return [];
  }
}
