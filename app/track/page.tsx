'use client';

import { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import styles from './track.module.css';

interface TrackedToken {
  id: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  alertPrice?: number;
  alertType?: 'above' | 'below';
}

interface TrackedWallet {
  id: string;
  address: string;
  label: string;
  lastActivity?: string;
}

export default function TrackPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'wallets'>('tokens');
  const [trackedTokens, setTrackedTokens] = useState<TrackedToken[]>([]);
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');

  // Carregar do localStorage
  useEffect(() => {
    const savedTokens = localStorage.getItem('trackedTokens');
    const savedWallets = localStorage.getItem('trackedWallets');

    if (savedTokens) setTrackedTokens(JSON.parse(savedTokens));
    if (savedWallets) setTrackedWallets(JSON.parse(savedWallets));
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('trackedTokens', JSON.stringify(trackedTokens));
  }, [trackedTokens]);

  useEffect(() => {
    localStorage.setItem('trackedWallets', JSON.stringify(trackedWallets));
  }, [trackedWallets]);

  const addToken = async () => {
    if (!newAddress) return;

    try {
      // Buscar info do token
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${newAddress}`);
      const data = await res.json();

      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const newToken: TrackedToken = {
          id: Date.now().toString(),
          address: newAddress,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          price: parseFloat(pair.priceUsd) || 0,
        };

        setTrackedTokens(prev => [...prev, newToken]);
        setNewAddress('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar token:', error);
    }
  };

  const addWallet = () => {
    if (!newAddress) return;

    const newWallet: TrackedWallet = {
      id: Date.now().toString(),
      address: newAddress,
      label: newLabel || `Wallet ${trackedWallets.length + 1}`,
    };

    setTrackedWallets(prev => [...prev, newWallet]);
    setNewAddress('');
    setNewLabel('');
    setShowAddModal(false);
  };

  const removeToken = (id: string) => {
    setTrackedTokens(prev => prev.filter(t => t.id !== id));
  };

  const removeWallet = (id: string) => {
    setTrackedWallets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h1>🎯 Track</h1>
        <p>Monitor tokens and wallets</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'tokens' ? styles.active : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          📈 Tokens ({trackedTokens.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'wallets' ? styles.active : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          👛 Wallets ({trackedWallets.length})
        </button>
      </div>

      {/* Add Button */}
      <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
        + Add {activeTab === 'tokens' ? 'Token' : 'Wallet'}
      </button>

      {/* Content */}
      {activeTab === 'tokens' ? (
        <div className={styles.list}>
          {trackedTokens.length === 0 ? (
            <div className={styles.empty}>
              <p>No tokens tracked yet</p>
              <span>Add a token address to start tracking</span>
            </div>
          ) : (
            trackedTokens.map(token => (
              <div key={token.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.tokenIcon}>{token.symbol[0]}</div>
                  <div>
                    <span className={styles.cardName}>{token.name}</span>
                    <span className={styles.cardSub}>{token.symbol}</span>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.cardPrice}>${token.price.toFixed(6)}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeToken(token.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {trackedWallets.length === 0 ? (
            <div className={styles.empty}>
              <p>No wallets tracked yet</p>
              <span>Add a wallet address to monitor activity</span>
            </div>
          ) : (
            trackedWallets.map(wallet => (
              <div key={wallet.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.walletIcon}>👛</div>
                  <div>
                    <span className={styles.cardName}>{wallet.label}</span>
                    <span className={styles.cardSub}>
                      {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeWallet(wallet.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Add {activeTab === 'tokens' ? 'Token' : 'Wallet'}</h3>

            <input
              type="text"
              placeholder={activeTab === 'tokens' ? 'Token address' : 'Wallet address'}
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              className={styles.input}
            />

            {activeTab === 'wallets' && (
              <input
                type="text"
                placeholder="Label (optional)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className={styles.input}
              />
            )}

            <div className={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={activeTab === 'tokens' ? addToken : addWallet}
                className={styles.confirmBtn}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
