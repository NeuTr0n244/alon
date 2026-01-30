'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './market.module.css';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  liquidity: string;
  timestamp: string;
}

export default function MarketPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMarketData() {
    try {
      // DexScreener API - Top Solana tokens
      const res = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana');
      const data = await res.json();

      const formatted = (data.pairs || []).slice(0, 50).map((pair: any) => ({
        symbol: pair.baseToken?.symbol || '???',
        name: pair.baseToken?.name || 'Unknown',
        price: pair.priceUsd || 0,
        change24h: pair.priceChange?.h24 || 0,
        volume: formatNumber(pair.volume?.h24),
        marketCap: formatNumber(pair.fdv),
        liquidity: formatNumber(pair.liquidity?.usd),
        timestamp: new Date().toLocaleTimeString(),
      }));

      setTokens(formatted);
      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Market fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backButton}>← Back</Link>
          <div>
            <span className={styles.label}>FINANCIAL TERMINAL</span>
            <h1>MARKET DATA</h1>
            <p className={styles.subtitle}>LIVE SNAPSHOTS FROM DEXSCREENER</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div>TOKENS: {tokens.length}</div>
          <div>UPDATED: {lastUpdate}</div>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <span className={styles.tabLabel}>DEXSCREENER STREAM</span>
        <div className={styles.tabRight}>
          <button className={styles.tabActive}>SOLANA TRENDING</button>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>Loading market data...</div>
        ) : (
          tokens.map((token, i) => (
            <div
              key={i}
              className={`${styles.tokenCard} ${token.change24h >= 0 ? styles.positive : styles.negative}`}
            >
              <div className={styles.tokenHeader}>
                <span className={styles.tokenSymbol}>{token.symbol}</span>
                <span className={`${styles.tokenChange} ${token.change24h >= 0 ? styles.green : styles.red}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </span>
              </div>
              <div className={styles.tokenName}>{token.name}</div>
              <div className={styles.tokenStats}>
                <div>VOL {token.volume}</div>
                <div>MC {token.marketCap}</div>
                <div>LIQ {token.liquidity}</div>
              </div>
              <div className={styles.tokenPrice}>${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(4)}</div>
              <div className={styles.tokenTime}>snapshot: {token.timestamp}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (!num) return '$0';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return `${num.toFixed(2)}`;
}
