'use client';

import { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import styles from './portfolio.module.css';

interface Holding {
  token: string;
  symbol: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  image?: string;
}

export default function PortfolioPage() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockHoldings: Holding[] = [
    { token: 'Solana', symbol: 'SOL', balance: 12.5, value: 1425, price: 114, change24h: -6.5, image: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { token: 'USDC', symbol: 'USDC', balance: 500, value: 500, price: 1, change24h: 0, image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { token: 'Bonk', symbol: 'BONK', balance: 50000000, value: 150, price: 0.000003, change24h: 12.5 },
    { token: 'Raydium', symbol: 'RAY', balance: 45, value: 225, price: 5, change24h: -3.2 },
  ];

  const connectWallet = async () => {
    try {
      const { solana } = window as any;

      if (!solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();

      setWalletAddress(address);
      setConnected(true);

      // Simular carregamento
      setLoading(true);
      setTimeout(() => {
        setHoldings(mockHoldings);
        setTotalValue(mockHoldings.reduce((sum, h) => sum + h.value, 0));
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  const disconnectWallet = () => {
    const { solana } = window as any;
    solana?.disconnect();
    setConnected(false);
    setWalletAddress(null);
    setHoldings([]);
    setTotalValue(0);
  };

  if (!connected) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.connectPrompt}>
          <div className={styles.icon}>💼</div>
          <h1>Your Portfolio</h1>
          <p>Connect your wallet to view your holdings</p>
          <button className={styles.connectBtn} onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Portfolio</h1>
          <p className={styles.wallet}>
            {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
            <button onClick={disconnectWallet} className={styles.disconnectBtn}>
              Disconnect
            </button>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Value</span>
          <span className={styles.statValue}>${totalValue.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>24h Change</span>
          <span className={`${styles.statValue} ${styles.red}`}>-$85.50 (-3.6%)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assets</span>
          <span className={styles.statValue}>{holdings.length}</span>
        </div>
      </div>

      {/* Holdings */}
      <div className={styles.holdingsSection}>
        <h2>Holdings</h2>

        {loading ? (
          <div className={styles.loading}>Loading your tokens...</div>
        ) : (
          <div className={styles.holdingsList}>
            {holdings.map((holding, index) => (
              <div key={index} className={styles.holdingCard}>
                <div className={styles.holdingLeft}>
                  {holding.image ? (
                    <img src={holding.image} alt={holding.symbol} className={styles.holdingImg} />
                  ) : (
                    <div className={styles.holdingPlaceholder}>{holding.symbol[0]}</div>
                  )}
                  <div>
                    <span className={styles.holdingName}>{holding.token}</span>
                    <span className={styles.holdingBalance}>
                      {holding.balance.toLocaleString()} {holding.symbol}
                    </span>
                  </div>
                </div>
                <div className={styles.holdingRight}>
                  <span className={styles.holdingValue}>${holding.value.toLocaleString()}</span>
                  <span className={holding.change24h >= 0 ? styles.green : styles.red}>
                    {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
