'use client';

import { useMemo, useEffect, useState } from 'react';
import { useTokenStore } from '@/store/tokenStore';
import { fetchNewTokens } from '@/lib/api/pumpApi';
import styles from './NewTokensColumn.module.css';

export function NewTokensColumn() {
  const { tokens } = useTokenStore();
  const addToken = useTokenStore((state) => state.addToken);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial new tokens on mount
    fetchNewTokens(50)
      .then((initialTokens) => {
        console.log('[NewTokensColumn] Loaded', initialTokens.length, 'new tokens');
        initialTokens.forEach((token) => addToken(token));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[NewTokensColumn] Failed to load new tokens:', error);
        setIsLoading(false);
      });
  }, [addToken]);

  // Function to get age display
  const getAge = (createdAt?: number) => {
    if (!createdAt) return 'now';
    const diff = Date.now() - createdAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>New Tokens</h2>
        <div className={styles.headerRight}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            LIVE
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className={styles.feed}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : tokens.length === 0 ? (
          <div className={styles.empty}>Waiting for new tokens...</div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.mint}
              className={styles.card}
              onClick={() => window.open(`https://pump.fun/coin/${token.mint}`, '_blank')}
            >
              {/* Image */}
              <div className={styles.cardImage}>
                {token.image ? (
                  <img src={token.image} alt={token.symbol} onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                ) : (
                  <span>{token.symbol?.slice(0, 2) || '??'}</span>
                )}
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{token.name}</span>
                  <span className={styles.cardTime}>{getAge(token.createdAt)}</span>
                </div>
                <div className={styles.cardSymbol}>{token.symbol}</div>
                <div className={styles.cardMint}>
                  {token.mint?.slice(0, 6)}...{token.mint?.slice(-4)}
                </div>
              </div>

              {/* Right */}
              <div className={styles.cardRight}>
                {token.marketCap && token.marketCap > 0 && (
                  <div className={styles.cardMC}>MC ${(token.marketCap / 1000).toFixed(1)}K</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
