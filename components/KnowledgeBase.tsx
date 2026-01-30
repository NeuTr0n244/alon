'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useVoice } from '@/contexts/VoiceContext';
import { AddKnowledgeModal } from './AddKnowledgeModal';
import type { KnowledgeInput } from './AddKnowledgeModal';
import styles from './KnowledgeBase.module.css';

interface FeedItem {
  id: string;
  type: 'prediction' | 'market' | 'news' | 'alert' | 'moonshot' | 'note' | 'link' | 'article' | 'insight';
  title: string;
  content: string;
  source?: string;
  timestamp: Date;
  link?: string;
  isNew?: boolean;
  isManual?: boolean; // Flag para itens manuais
}

interface NewAlert {
  id: string;
  title: string;
  link?: string;
}

export function KnowledgeBase() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlerts, setNewAlerts] = useState<NewAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentId, addToQueue, speakNow, isEnabled, isUnlocked, hasBeenSpoken } = useVoice();

  const previousItemsRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const manualItemsRef = useRef<FeedItem[]>([]); // Armazena itens manuais

  // Controle de alertas (ler a cada 5 minutos)
  const lastAlertReadTime = useRef<number>(Date.now());
  const pendingAlerts = useRef<FeedItem[]>([]);
  const ALERT_INTERVAL = 5 * 60 * 1000; // 5 minutos em ms

  // Formatar texto para falar baseado no tipo
  const formatTextForSpeech = useCallback((item: FeedItem): string => {
    const sourcePrefix = item.source ? `From ${item.source}. ` : '';

    switch (item.type) {
      case 'alert':
        return `Alert! ${sourcePrefix}${item.content}`;
      case 'moonshot':
        return `Moonshot opportunity! ${item.content}`;
      case 'market':
        return `Market update. ${item.content}`;
      case 'prediction':
        return `Prediction. ${sourcePrefix}${item.content}`;
      case 'news':
      case 'article':
        return `News. ${sourcePrefix}${item.content}`;
      case 'note':
        return `New note. ${item.content}`;
      case 'insight':
        return `Insight. ${item.content}`;
      default:
        return item.content;
    }
  }, []);

  // Adicionar conhecimento manual
  const handleAddKnowledge = useCallback((data: KnowledgeInput) => {
    const newItem: FeedItem = {
      id: `manual-${Date.now()}-${Math.random()}`,
      type: data.type,
      title: data.content.slice(0, 50),
      content: data.content,
      source: (data.author || 'YOU').toUpperCase(),
      timestamp: new Date(),
      link: data.url,
      isNew: true,
      isManual: true, // Marcar como manual
    };

    console.log('✏️ Novo conhecimento adicionado:', newItem);

    // Salvar na ref de itens manuais (persiste entre fetches)
    manualItemsRef.current = [newItem, ...manualItemsRef.current];

    // Adicionar no topo do feed
    setItems(prev => [newItem, ...prev]);

    // Se voz está habilitada, INTERROMPER e ler IMEDIATAMENTE
    if (isEnabled && isUnlocked) {
      const text = formatTextForSpeech(newItem);
      console.log('🚨 INTERROMPENDO para ler mensagem do usuário!');
      speakNow(text, newItem.id); // INTERROMPE atual e fala AGORA
    }
  }, [isEnabled, isUnlocked, formatTextForSpeech, speakNow]);

  // Função para quando usuário clica em um item
  const handleItemClick = useCallback((item: FeedItem) => {
    if (!isEnabled || !isUnlocked) {
      console.log('🔇 Voz não está ativa');
      return;
    }

    const text = formatTextForSpeech(item);
    console.log('👆 Usuário clicou para ler:', item.type);

    // Ler IMEDIATAMENTE
    speakNow(text, item.id);
  }, [isEnabled, isUnlocked, formatTextForSpeech, speakNow]);

  // Fetch de dados
  const fetchAllData = useCallback(async () => {
    try {
      const results = await Promise.all([
        fetchMarketData(),
        fetchFearGreed(),
        fetchTrendingTokens(),
        fetchMoonshotTokens(),
        fetchNews(),
        fetchDecryptNews(),
        fetchTheBlockNews(),
        fetchBBCNews(),
        fetchWiredNews(),
      ]);

      const fetchedItems = results
        .flat()
        .filter(Boolean)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('========== DEBUG FEED ==========');
      console.log('Items no feed:', fetchedItems.length);
      console.log('Voice enabled:', isEnabled);
      console.log('Voice unlocked:', isUnlocked);
      console.log('Manual items:', manualItemsRef.current.length);
      console.log('Items:', fetchedItems.slice(0, 10).map((item, i) => `${i + 1}. [${item.type}] ${item.content.slice(0, 30)}...`));
      console.log('================================');

      // Verificar novos itens
      const previousIds = previousItemsRef.current;

      if (!isFirstLoad.current) {
        // Encontrar itens NOVOS
        const brandNewItems = fetchedItems.filter(item => !previousIds.has(item.id));

        if (brandNewItems.length > 0) {
          console.log(`📢 ${brandNewItems.length} novos itens detectados!`);

          // Alertas visuais (máximo 3)
          setNewAlerts(prev => [
            ...brandNewItems.slice(0, 3).map(item => ({
              id: item.id,
              title: item.content.slice(0, 60) + '...',
              link: item.link,
            })),
            ...prev
          ].slice(0, 5));

          // PROCESSAR NOVOS ITEMS CONFORME TIPO
          brandNewItems.forEach((item, index) => {
            if (hasBeenSpoken(item.id)) {
              console.log(`⏭️ Item já foi lido, pulando: ${item.id.slice(0, 30)}`);
              return;
            }

            // ======== REGRAS DE LEITURA ========
            if (item.type === 'news') {
              // NEWS NOVA: Ler COM PRIORIDADE (vai pro topo da fila, não interrompe atual)
              const text = formatTextForSpeech(item);
              addToQueue(text, item.id, true);
              console.log(`📰 NEWS NOVA adicionado COM PRIORIDADE: ${item.content.slice(0, 50)}`);
              previousIds.add(item.id);
            }
            else if (item.type === 'alert') {
              // ALERT: Acumular para ler a cada 5 minutos
              if (!pendingAlerts.current.find(a => a.id === item.id)) {
                pendingAlerts.current.push(item);
                console.log(`🔔 ALERT acumulado (${pendingAlerts.current.length} total): ${item.content.slice(0, 50)}`);
                previousIds.add(item.id);
              }
            }
            // IGNORAR: market, prediction, moonshot, trending
            else {
              console.log(`⏭️ Tipo ignorado (${item.type}): ${item.content.slice(0, 50)}`);
              previousIds.add(item.id);
            }
          });

          // Marcar como novos
          brandNewItems.forEach(item => {
            item.isNew = true;
          });
        }
      } else {
        // PRIMEIRA CARGA - ADICIONAR APENAS NEWS À FILA
        console.log('🎬 PRIMEIRA CARGA - Adicionando apenas NEWS à fila');
        console.log('Voice enabled:', isEnabled, 'Voice unlocked:', isUnlocked);

        if (!isUnlocked) {
          console.log('⏳ Voz não desbloqueada ainda, aguardando interação do usuário...');
        }

        // Separar items por tipo
        const newsItems = fetchedItems.filter(item => item.type === 'news');
        const alertItems = fetchedItems.filter(item => item.type === 'alert');

        // Adicionar NEWS à fila (primeira carga, sem prioridade)
        newsItems.forEach((item, index) => {
          if (hasBeenSpoken(item.id)) {
            console.log(`⏭️ NEWS ${index + 1} já foi lido, pulando`);
            return;
          }

          const text = formatTextForSpeech(item);
          addToQueue(text, item.id, false);
          previousIds.add(item.id);
          console.log(`➕ NEWS ${index + 1} adicionado à fila: ${item.content.slice(0, 40)}...`);
        });

        // Acumular ALERTS (não ler agora)
        alertItems.forEach(item => {
          if (!pendingAlerts.current.find(a => a.id === item.id)) {
            pendingAlerts.current.push(item);
            previousIds.add(item.id);
          }
        });

        // Marcar outros tipos como vistos (mas não ler)
        fetchedItems
          .filter(item => item.type !== 'news' && item.type !== 'alert')
          .forEach(item => previousIds.add(item.id));

        console.log(`✅ Primeira carga: ${newsItems.length} NEWS na fila, ${alertItems.length} ALERTS acumulados`);
      }

      isFirstLoad.current = false;
      
      // IMPORTANTE: Preservar itens manuais ao atualizar
      setItems(prev => {
        // Combinar: itens manuais (ref) + itens do fetch
        const allItems = [...manualItemsRef.current, ...fetchedItems];
        
        // Ordenar por timestamp (mais recentes primeiro)
        return allItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });

    } catch (err) {
      console.error('[KnowledgeBase] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [addToQueue, formatTextForSpeech, hasBeenSpoken, isEnabled, isUnlocked]);

  useEffect(() => {
    fetchAllData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Filtrar por tipo
  const [filter, setFilter] = useState<'all' | 'market' | 'news'>('all');

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'market') return ['market', 'prediction', 'moonshot', 'alert'].includes(item.type);
    if (filter === 'news') return ['news', 'article', 'note', 'insight', 'link'].includes(item.type);
    return true;
  });

  // Remover alerta
  const dismissAlert = useCallback((id: string) => {
    setNewAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Ícone por tipo
  const getIcon = (type: string) => {
    switch (type) {
      case 'market': return '📊';
      case 'prediction': return '🔮';
      case 'news': return '📰';
      case 'article': return '📰';
      case 'alert': return '🚨';
      case 'moonshot': return '🚀';
      case 'note': return '📝';
      case 'link': return '🔗';
      case 'insight': return '💡';
      default: return '📋';
    }
  };

  // Cor por tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'market': return '#3b82f6';
      case 'prediction': return '#8b5cf6';
      case 'news': return '#10b981';
      case 'article': return '#10b981';
      case 'alert': return '#ef4444';
      case 'moonshot': return '#f59e0b';
      case 'note': return '#ec4899';
      case 'link': return '#06b6d4';
      case 'insight': return '#14b8a6';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.container}>
      {/* Alert banners */}
      <div className={styles.alertBanners}>
        {newAlerts.map((alert) => (
          <div key={alert.id} className={styles.alertBanner}>
            <span className={styles.alertIcon}>🚨</span>
            <span className={styles.alertText}>{alert.title}</span>
            {alert.link && (
              <Link href={alert.link} target="_blank" className={styles.alertLink}>
                View →
              </Link>
            )}
            <button
              className={styles.alertDismiss}
              onClick={() => dismissAlert(alert.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Knowledge Base</h2>
        <span className={styles.liveBadge}>● LIVE</span>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          📋 View Market
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'news' ? styles.active : ''}`}
          onClick={() => setFilter('news')}
        >
          📰 View News
        </button>
        <button
          className={styles.filterTab}
          onClick={() => window.open('https://github.com/your-repo/changelog', '_blank')}
        >
          📝 Changelog
        </button>
      </div>

      {/* Auto-update indicator */}
      <div className={styles.updateIndicator}>
        <span className={styles.updateDot}></span>
        Auto-updating every 30s...
      </div>

      {/* Feed items */}
      <div className={styles.feed}>
        {loading ? (
          <div className={styles.loading}>Loading knowledge...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.empty}>No items yet</div>
        ) : (
          filteredItems.slice(0, 25).map((item) => (
            <div
              key={item.id}
              className={`${styles.feedItem} ${item.isNew ? styles.newItem : ''} ${currentId === item.id ? styles.reading : ''} ${item.isManual ? styles.manualItem : ''}`}
              onClick={() => handleItemClick(item)}
              style={{ borderLeftColor: getTypeColor(item.type) }}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemIcon}>{getIcon(item.type)}</span>
                <span
                  className={styles.itemType}
                  style={{ color: getTypeColor(item.type) }}
                >
                  {item.type.toUpperCase()}
                </span>
                {item.isNew && <span className={styles.newBadge}>NEW</span>}
                {currentId === item.id && (
                  <span className={styles.readingBadge}>🔊 READING</span>
                )}
              </div>

              <p className={styles.itemContent}>{item.content}</p>

              {item.link && (
                <Link
                  href={item.link}
                  target="_blank"
                  className={styles.itemLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  ({item.link.slice(0, 60)}...)
                </Link>
              )}

              <div className={styles.itemFooter}>
                <span className={styles.itemSource}>{item.source}</span>
                <span className={styles.itemTime}>
                  {item.timestamp.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Knowledge Button */}
      <div className={styles.addSection}>
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          <span className={styles.addIcon}>+</span>
          <div className={styles.addText}>
            <span className={styles.addTitle}>ADD KNOWLEDGE</span>
            <span className={styles.addSubtitle}>EXPAND DATABASE</span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="https://docs.example.com" target="_blank">Docs</Link>
        <Link href="https://twitter.com" target="_blank">Twitter</Link>
        <Link href="https://discord.com" target="_blank">Discord</Link>
      </div>

      {/* Modal */}
      <AddKnowledgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKnowledge}
      />
    </div>
  );
}

// ========== FETCH FUNCTIONS ==========

async function fetchMarketData(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await res.json();

    const items: FeedItem[] = [];

    // SOL
    if (data.solana) {
      const price = data.solana.usd;
      const change = data.solana.usd_24h_change || 0;
      items.push({
        id: 'market-sol-' + Date.now(),
        type: 'market',
        title: 'Solana Market Update',
        content: `Solana trending: SOL $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
        source: 'COINGECKO',
        timestamp: new Date(),
        link: 'https://coingecko.com/en/coins/solana'
      });
    }

    // BTC
    if (data.bitcoin) {
      const price = data.bitcoin.usd;
      const change = data.bitcoin.usd_24h_change || 0;
      items.push({
        id: 'market-btc-' + Date.now() + 1,
        type: 'market',
        title: 'Bitcoin Update',
        content: `Bitcoin: BTC $${price.toLocaleString()} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
        source: 'COINGECKO',
        timestamp: new Date(),
        link: 'https://coingecko.com/en/coins/bitcoin'
      });
    }

    // ETH
    if (data.ethereum) {
      const price = data.ethereum.usd;
      const change = data.ethereum.usd_24h_change || 0;
      items.push({
        id: 'market-eth-' + Date.now() + 2,
        type: 'market',
        title: 'Ethereum Update',
        content: `Ethereum: ETH $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
        source: 'COINGECKO',
        timestamp: new Date(),
        link: 'https://coingecko.com/en/coins/ethereum'
      });
    }

    return items;
  } catch (err) {
    return [];
  }
}

async function fetchFearGreed(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await res.json();
    const fng = data.data?.[0];

    if (!fng) return [];

    const sentiment = parseInt(fng.value) > 50 ? 'bullish' : 'bearish';

    return [{
      id: 'prediction-fng-' + Date.now(),
      type: 'prediction',
      title: 'Market Sentiment',
      content: `Market sentiment is ${sentiment}. Fear and Greed Index: ${fng.value} (${fng.value_classification})`,
      source: 'ALTERNATIVE.ME',
      timestamp: new Date(),
      link: 'https://alternative.me/crypto/fear-and-greed-index/'
    }];
  } catch (err) {
    return [];
  }
}

async function fetchNews(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss/tag/solana'
    );
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 5).map((item: any) => ({
      id: `news-${item.guid}`,
      type: 'news' as const,
      title: item.title,
      content: item.title,
      source: 'COINTELEGRAPH',
      timestamp: new Date(item.pubDate),
      link: item.link
    }));
  } catch (err) {
    return [];
  }
}

async function fetchTrendingTokens(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
    const data = await res.json();

    return (data || []).slice(0, 3).map((token: any, i: number) => ({
      id: `trending-${token.tokenAddress || i}-${Date.now()}`,
      type: 'alert' as const,
      title: `Trending Token #${i + 1}`,
      content: `Trending number ${i + 1}: ${token.description || 'Unknown Token'} is gaining attention on DexScreener`,
      source: 'DEXSCREENER',
      timestamp: new Date(),
      link: token.url || `https://dexscreener.com/solana/${token.tokenAddress}`,
    }));
  } catch (err) {
    return [];
  }
}

async function fetchMoonshotTokens(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
    const data = await res.json();

    const moonshots: FeedItem[] = [];

    for (const token of (data || []).slice(0, 10)) {
      try {
        const pairRes = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${token.tokenAddress}`
        );
        const pairData = await pairRes.json();

        const pair = pairData.pairs?.[0];
        if (pair) {
          const marketCap = pair.fdv || pair.marketCap || 0;

          if (marketCap >= 500000) {
            const mcFormatted = marketCap >= 1000000
              ? `${(marketCap / 1000000).toFixed(2)} million dollars`
              : `${(marketCap / 1000).toFixed(0)} thousand dollars`;

            moonshots.push({
              id: `moonshot-${token.tokenAddress}-${Date.now()}`,
              type: 'moonshot',
              title: `Moonshot: ${pair.baseToken?.name || 'Unknown'}`,
              content: `Moonshot alert: ${pair.baseToken?.name || 'Unknown'} token just hit ${mcFormatted} market cap! This token is gaining serious momentum.`,
              source: 'DEXSCREENER',
              timestamp: new Date(),
              link: `https://dexscreener.com/solana/${token.tokenAddress}`,
            });
          }
        }
      } catch (e) {
        // Ignorar erros individuais
      }
    }

    return moonshots.slice(0, 3);
  } catch (err) {
    return [];
  }
}

async function fetchBBCNews(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/technology/rss.xml'
    );
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 3).map((item: any) => ({
      id: `bbc-${item.guid || item.link}`,
      type: 'news' as const,
      title: item.title,
      content: item.title,
      source: 'BBC',
      timestamp: new Date(item.pubDate),
      link: item.link
    }));
  } catch (err) {
    return [];
  }
}

async function fetchWiredNews(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://www.wired.com/feed/rss'
    );
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 3).map((item: any) => ({
      id: `wired-${item.guid || item.link}`,
      type: 'news' as const,
      title: item.title,
      content: item.title,
      source: 'WIRED',
      timestamp: new Date(item.pubDate),
      link: item.link
    }));
  } catch (err) {
    return [];
  }
}

async function fetchDecryptNews(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed'
    );
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 3).map((item: any) => ({
      id: `decrypt-${item.guid || item.link}`,
      type: 'news' as const,
      title: item.title,
      content: item.title,
      source: 'DECRYPT',
      timestamp: new Date(item.pubDate),
      link: item.link
    }));
  } catch (err) {
    return [];
  }
}

async function fetchTheBlockNews(): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://www.theblock.co/rss.xml'
    );
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 3).map((item: any) => ({
      id: `theblock-${item.guid || item.link}`,
      type: 'news' as const,
      title: item.title,
      content: item.title,
      source: 'THE BLOCK',
      timestamp: new Date(item.pubDate),
      link: item.link
    }));
  } catch (err) {
    return [];
  }
}
