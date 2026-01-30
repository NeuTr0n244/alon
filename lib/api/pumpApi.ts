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

// Mock data como fallback
const mockMigratedTokens: Token[] = [
  {
    signature: '',
    mint: 'mock1',
    name: 'Example Migrated Token 1',
    symbol: 'MOCK1',
    uri: '',
    image: 'https://via.placeholder.com/48/00ff00/000000?text=M1',
    creator: 'mockCreator1',
    createdAt: Date.now() - 86400000,
    marketCap: 75000,
    volume24h: 50000,
    priceUsd: 0.05,
    priceNative: 0.00015,
    isMigrated: true,
    tradeCount: 1500,
    holderCount: 320,
  },
  {
    signature: '',
    mint: 'mock2',
    name: 'Example Migrated Token 2',
    symbol: 'MOCK2',
    uri: '',
    image: 'https://via.placeholder.com/48/00ff00/000000?text=M2',
    creator: 'mockCreator2',
    createdAt: Date.now() - 172800000,
    marketCap: 120000,
    volume24h: 80000,
    priceUsd: 0.12,
    priceNative: 0.00025,
    isMigrated: true,
    tradeCount: 2500,
    holderCount: 580,
  },
  {
    signature: '',
    mint: 'mock3',
    name: 'Example Migrated Token 3',
    symbol: 'MOCK3',
    uri: '',
    image: 'https://via.placeholder.com/48/00ff00/000000?text=M3',
    creator: 'mockCreator3',
    createdAt: Date.now() - 259200000,
    marketCap: 95000,
    volume24h: 65000,
    priceUsd: 0.08,
    priceNative: 0.0002,
    isMigrated: true,
    tradeCount: 1800,
    holderCount: 450,
  },
];

// ========== PROXY URL ==========
// Usa proxy local para evitar CORS
function getPumpProxyUrl(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return `/api/pump?${searchParams.toString()}`;
}

// Buscar de DexScreener
async function fetchFromDexScreener(): Promise<Token[]> {
  try {
    console.log('[PumpAPI] Tentando DexScreener...');
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=pump.fun'
    );

    if (response.ok) {
      const data = await response.json();
      const pairs = data.pairs || [];

      console.log('[PumpAPI] DexScreener retornou', pairs.length, 'pairs');

      const tokens: Token[] = pairs
        .filter(
          (pair: any) =>
            pair.dexId === 'raydium' ||
            pair.dexId === 'pumpswap' ||
            pair.labels?.includes('pump.fun')
        )
        .slice(0, 50)
        .map((pair: any) => ({
          signature: '',
          mint: pair.baseToken?.address || '',
          name: pair.baseToken?.name || '',
          symbol: pair.baseToken?.symbol || '',
          uri: '',
          image: pair.info?.imageUrl || '',
          creator: '',
          createdAt: pair.pairCreatedAt || Date.now(),
          marketCap: parseFloat(pair.marketCap || 0),
          volume24h: parseFloat(pair.volume?.h24 || 0),
          priceUsd: parseFloat(pair.priceUsd || 0),
          priceNative: parseFloat(pair.priceNative || 0),
          isMigrated: true,
          tradeCount: pair.txns?.h24?.buys + pair.txns?.h24?.sells || 0,
          holderCount: 0,
        }));

      if (tokens.length > 0) {
        console.log('[PumpAPI] ✅ DexScreener retornou', tokens.length, 'tokens');
        return tokens;
      }
    }
  } catch (error) {
    console.warn('[PumpAPI] DexScreener falhou:', error);
  }
  return [];
}

// Buscar de Birdeye
async function fetchFromBirdeye(): Promise<Token[]> {
  try {
    console.log('[PumpAPI] Tentando Birdeye...');
    const response = await fetch(
      'https://public-api.birdeye.so/defi/tokenlist?sort_by=mc&sort_type=desc&offset=0&limit=50',
      {
        headers: {
          'X-API-KEY': 'public',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const tokens = (data.data?.tokens || []).slice(0, 50).map((token: any) => ({
        signature: '',
        mint: token.address || '',
        name: token.name || '',
        symbol: token.symbol || '',
        uri: '',
        image: token.logoURI || '',
        creator: '',
        createdAt: Date.now(),
        marketCap: parseFloat(token.mc || 0),
        volume24h: parseFloat(token.v24hUSD || 0),
        priceUsd: parseFloat(token.price || 0),
        priceNative: 0,
        isMigrated: true,
        tradeCount: 0,
        holderCount: 0,
      }));

      if (tokens.length > 0) {
        console.log('[PumpAPI] ✅ Birdeye retornou', tokens.length, 'tokens');
        return tokens;
      }
    }
  } catch (error) {
    console.warn('[PumpAPI] Birdeye falhou:', error);
  }
  return [];
}

export async function fetchMigratedTokens(limit = 50): Promise<Token[]> {
  console.log('[PumpAPI] 🔍 Iniciando busca de tokens migrados...');

  // Option 1: Pump.fun API via PROXY (complete=true)
  try {
    const url = getPumpProxyUrl({
      offset: 0,
      limit,
      sort: 'last_trade_timestamp',
      order: 'DESC',
      includeNsfw: false,
      complete: true,
    });
    
    console.log('[PumpAPI] Tentando Pump.fun API via proxy (complete=true)...');

    const response = await fetch(url);

    if (response.ok) {
      const data: PumpFunToken[] = await response.json();
      
      // Verificar se não é erro
      if (Array.isArray(data)) {
        const migratedTokens = data.filter(
          (token) => token.complete === true || token.raydium_pool
        );

        if (migratedTokens.length > 0) {
          console.log('[PumpAPI] ✅ Pump.fun API retornou', migratedTokens.length, 'tokens migrados');
          return migratedTokens.map((pumpToken) => ({
            signature: '',
            mint: pumpToken.mint,
            name: pumpToken.name,
            symbol: pumpToken.symbol,
            uri: pumpToken.metadata_uri || '',
            description: pumpToken.description,
            image: pumpToken.image_uri,
            creator: pumpToken.creator || pumpToken.username,
            createdAt: pumpToken.created_timestamp * 1000,
            marketCap: pumpToken.market_cap_sol || pumpToken.market_cap,
            volume24h: 0,
            priceUsd: pumpToken.usd_market_cap,
            priceNative: pumpToken.virtual_sol_reserves && pumpToken.virtual_token_reserves
              ? pumpToken.virtual_sol_reserves / pumpToken.virtual_token_reserves
              : 0,
            twitter: pumpToken.twitter,
            telegram: pumpToken.telegram,
            website: pumpToken.website,
            isMigrated: true,
            tradeCount: 0,
            holderCount: 0,
            replies: pumpToken.reply_count,
          }));
        }
      }
    }
  } catch (error) {
    console.warn('[PumpAPI] ⚠️ Pump.fun API via proxy falhou:', error);
  }

  // Option 2: DexScreener
  const dexTokens = await fetchFromDexScreener();
  if (dexTokens.length > 0) {
    return dexTokens;
  }

  // Option 3: Birdeye
  const birdeyeTokens = await fetchFromBirdeye();
  if (birdeyeTokens.length > 0) {
    return birdeyeTokens;
  }

  // Option 4: Backup Heroku API
  try {
    const url2 = `https://client-api-2-74b1891ee9f9.herokuapp.com/coins?offset=0&limit=${limit}&sort=market_cap&order=DESC&complete=true`;
    console.log('[PumpAPI] Tentando Heroku backup...');

    const response2 = await fetch(url2);
    if (response2.ok) {
      const data: PumpFunToken[] = await response2.json();
      if (data.length > 0) {
        console.log('[PumpAPI] ✅ Heroku backup retornou', data.length, 'tokens');
        return data.map((pumpToken) => ({
          signature: '',
          mint: pumpToken.mint,
          name: pumpToken.name,
          symbol: pumpToken.symbol,
          uri: pumpToken.metadata_uri || '',
          description: pumpToken.description,
          image: pumpToken.image_uri,
          creator: pumpToken.creator || pumpToken.username,
          createdAt: pumpToken.created_timestamp * 1000,
          marketCap: pumpToken.market_cap_sol || pumpToken.market_cap,
          volume24h: 0,
          priceUsd: pumpToken.usd_market_cap,
          priceNative: 0,
          twitter: pumpToken.twitter,
          telegram: pumpToken.telegram,
          website: pumpToken.website,
          isMigrated: true,
          tradeCount: 0,
          holderCount: 0,
          replies: pumpToken.reply_count,
        }));
      }
    }
  } catch (error) {
    console.warn('[PumpAPI] ⚠️ Heroku backup falhou:', error);
  }

  // Fallback: Mock data
  console.log('[PumpAPI] ⚠️ Todas as APIs falharam. Usando mock data...');
  return mockMigratedTokens;
}

export async function fetchNewTokens(limit = 50): Promise<Token[]> {
  try {
    // Usar PROXY local para evitar CORS
    const url = getPumpProxyUrl({
      offset: 0,
      limit,
      sort: 'created_timestamp',
      order: 'DESC',
      includeNsfw: false,
      migrated: false,
    });

    console.log('[PumpAPI] Fetching new tokens via proxy...');

    const response = await fetch(url);

    if (!response.ok) {
      console.error('[PumpAPI] Failed to fetch:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Verificar se é erro ou array válido
    if (!Array.isArray(data)) {
      console.error('[PumpAPI] Invalid response:', data);
      return [];
    }

    console.log('[PumpAPI] Fetched', data.length, 'new tokens');

    const tokens: Token[] = data.map((pumpToken: PumpFunToken) => ({
      signature: '',
      mint: pumpToken.mint,
      name: pumpToken.name,
      symbol: pumpToken.symbol,
      uri: pumpToken.metadata_uri || '',
      description: pumpToken.description,
      image: pumpToken.image_uri,
      creator: pumpToken.creator || pumpToken.username,
      createdAt: pumpToken.created_timestamp * 1000,
      marketCap: pumpToken.market_cap_sol || pumpToken.market_cap,
      volume24h: 0,
      priceUsd: pumpToken.usd_market_cap,
      priceNative: pumpToken.virtual_sol_reserves && pumpToken.virtual_token_reserves
        ? pumpToken.virtual_sol_reserves / pumpToken.virtual_token_reserves
        : 0,
      twitter: pumpToken.twitter,
      telegram: pumpToken.telegram,
      website: pumpToken.website,
      isMigrated: false,
      tradeCount: 0,
      holderCount: 0,
      replies: pumpToken.reply_count,
    }));

    return tokens;
  } catch (error) {
    console.error('[PumpAPI] Error fetching new tokens:', error);
    return [];
  }
}
