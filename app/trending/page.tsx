'use client';

import { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import styles from './trending.module.css';

interface Token {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  image?: string;
  chain?: string;
}

export default function TrendingPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'hot' | 'new' | 'gainers' | 'volume'>('hot');
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h'>('1h');

  useEffect(() => {
    fetchTrending();
    const interval = setInterval(fetchTrending, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, [filter]);

  const fetchTrending = async () => {
    setLoading(true);

    try {
      // OPÇÃO 1: CoinGecko - Top moedas por market cap
      const geckoRes = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h'
      );
      const geckoData = await geckoRes.json();

      let formattedTokens: Token[] = [];

      // Processar CoinGecko
      if (geckoData && Array.isArray(geckoData)) {
        const geckoTokens = geckoData.map((coin: any) => ({
          address: coin.id,
          name: coin.name,
          symbol: coin.symbol?.toUpperCase() || '???',
          price: coin.current_price || 0,
          priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
          priceChange24h: coin.price_change_percentage_24h || 0,
          volume24h: coin.total_volume || 0,
          marketCap: coin.market_cap || 0,
          liquidity: coin.total_volume || 0,
          image: coin.image,
          chain: 'multi',
        }));
        formattedTokens = geckoTokens;
      }

      // OPÇÃO 2: DexScreener Solana (backup/complemento)
      try {
        const solanaRes = await fetch('https://api.dexscreener.com/latest/dex/search?q=SOL');
        const solanaData = await solanaRes.json();

        if (solanaData?.pairs && Array.isArray(solanaData.pairs)) {
          const solanaPairs = solanaData.pairs
            .filter((pair: any) => pair.chainId === 'solana')
            .slice(0, 20)
            .map((pair: any) => ({
              address: pair.baseToken?.address || '',
              name: pair.baseToken?.name || 'Unknown',
              symbol: pair.baseToken?.symbol || '???',
              price: parseFloat(pair.priceUsd) || 0,
              priceChange1h: pair.priceChange?.h1 || 0,
              priceChange24h: pair.priceChange?.h24 || 0,
              volume24h: pair.volume?.h24 || 0,
              marketCap: pair.marketCap || pair.fdv || 0,
              liquidity: pair.liquidity?.usd || 0,
              image: pair.info?.imageUrl,
              chain: 'solana',
            }));

          // Se CoinGecko falhou, usar DexScreener
          if (formattedTokens.length === 0) {
            formattedTokens = solanaPairs;
          }
        }
      } catch (e) {
        console.log('DexScreener complementar falhou, usando só CoinGecko');
      }

      // Ordenar baseado no filtro
      switch (filter) {
        case 'gainers':
          formattedTokens.sort((a, b) => b.priceChange24h - a.priceChange24h);
          break;
        case 'volume':
          formattedTokens.sort((a, b) => b.volume24h - a.volume24h);
          break;
        case 'new':
          // Manter ordem original
          break;
        default: // hot
          formattedTokens.sort((a, b) => b.volume24h - a.volume24h);
      }

      setTokens(formattedTokens);
      console.log('📊 Tokens carregados:', formattedTokens.length);

    } catch (error) {
      console.error('❌ Erro ao buscar trending:', error);

      // Fallback: tentar só CoinGecko sem price_change_percentage
      try {
        const fallbackRes = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&page=1'
        );
        const fallbackData = await fallbackRes.json();

        if (Array.isArray(fallbackData)) {
          const fallbackTokens = fallbackData.map((coin: any) => ({
            address: coin.id,
            name: coin.name,
            symbol: coin.symbol?.toUpperCase(),
            price: coin.current_price || 0,
            priceChange1h: 0,
            priceChange24h: coin.price_change_percentage_24h || 0,
            volume24h: coin.total_volume || 0,
            marketCap: coin.market_cap || 0,
            liquidity: coin.total_volume || 0,
            image: coin.image,
          }));
          setTokens(fallbackTokens);
        }
      } catch (e) {
        console.error('❌ Fallback também falhou:', e);
      }
    }

    setLoading(false);
  };

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return '$0.00';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0.00';
    if (price < 0.00001) return `$${price.toFixed(10)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatPercent = (num: number) => {
    if (!num || isNaN(num)) return '+0.00%';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h1>🔥 Trending Tokens</h1>
        <p>Top performing tokens on Solana</p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {[
            { key: 'hot', icon: '🔥', label: 'Hot' },
            { key: 'new', icon: '✨', label: 'New' },
            { key: 'gainers', icon: '📈', label: 'Gainers' },
            { key: 'volume', icon: '💰', label: 'Volume' },
          ].map((f) => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
              onClick={() => setFilter(f.key as any)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        <div className={styles.timeGroup}>
          {['1h', '6h', '24h'].map((t) => (
            <button
              key={t}
              className={`${styles.timeBtn} ${timeframe === t ? styles.active : ''}`}
              onClick={() => setTimeframe(t as any)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>TOKEN</th>
              <th>PRICE</th>
              <th>1H %</th>
              <th>24H %</th>
              <th>VOLUME 24H</th>
              <th>MARKET CAP</th>
              <th>LIQUIDITY</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loading}>
                  <div className={styles.spinner}></div>
                  Loading tokens...
                </td>
              </tr>
            ) : tokens.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.loading}>
                  No tokens found
                </td>
              </tr>
            ) : (
              tokens.map((token, index) => (
                <tr key={token.address + index} className={styles.row}>
                  <td className={styles.rank}>{index + 1}</td>
                  <td className={styles.token}>
                    <div className={styles.tokenInfo}>
                      {token.image ? (
                        <img
                          src={token.image}
                          alt={token.symbol}
                          className={styles.tokenImg}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.tokenPlaceholder}>
                          {token.symbol?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <span className={styles.tokenName}>{token.name}</span>
                        <span className={styles.tokenSymbol}>{token.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.price}>{formatPrice(token.price)}</td>
                  <td className={token.priceChange1h >= 0 ? styles.green : styles.red}>
                    {formatPercent(token.priceChange1h)}
                  </td>
                  <td className={token.priceChange24h >= 0 ? styles.green : styles.red}>
                    {formatPercent(token.priceChange24h)}
                  </td>
                  <td>{formatNumber(token.volume24h)}</td>
                  <td>{formatNumber(token.marketCap)}</td>
                  <td>{formatNumber(token.liquidity)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
