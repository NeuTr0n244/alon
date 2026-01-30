'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useVoice } from '@/contexts/VoiceContext';
import { AddKnowledgeModal } from './AddKnowledgeModal';
import type { KnowledgeInput } from './AddKnowledgeModal';
import { addKnowledgeItem, subscribeToKnowledge } from '@/lib/firebaseKnowledge';
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
  isManual?: boolean;
}

interface NewAlert {
  id: string;
  title: string;
  link?: string;
}

export function KnowledgeBase() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [firebaseItems, setFirebaseItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlerts, setNewAlerts] = useState<NewAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentId, addToQueue, speakNow, isEnabled, isUnlocked, hasBeenSpoken } = useVoice();

  const previousItemsRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Controle de alertas (ler a cada 5 minutos)
  const lastAlertReadTime = useRef<number>(Date.now());
  const pendingAlerts = useRef<FeedItem[]>([]);
  const ALERT_INTERVAL = 5 * 60 * 1000; // 5 minutos em ms

  // getPriority removido - não é mais necessário

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
      case 'insight':
        return `${item.type}. ${item.content}`;
      default:
        return item.content;
    }
  }, []);

  // Adicionar conhecimento manual
  const handleAddKnowledge = useCallback(async (data: KnowledgeInput) => {
    const newItem: FeedItem = {
      id: `manual-${Date.now()}-${Math.random()}`,
      type: data.type,
      title: data.content.slice(0, 50),
      content: data.content,
      source: (data.author || 'ANON').toUpperCase(),
      timestamp: new Date(),
      link: data.url,
      isNew: true,
      isManual: true,
    };

    console.log('✏️ Novo conhecimento adicionado:', newItem);

    // Salvar no Firebase para sync real-time
    try {
      await addKnowledgeItem(newItem);
      console.log('🔥 Item salvo no Firebase');
    } catch (error) {
      console.error('❌ Erro ao salvar no Firebase:', error);
      // Adicionar localmente mesmo se Firebase falhar
      setItems(prev => [newItem, ...prev]);
    }

    // Se voz está habilitada, INTERROMPER e ler IMEDIATAMENTE
    if (isEnabled && isUnlocked) {
      const text = formatTextForSpeech(newItem);
      console.log('🚨 INTERROMPENDO para ler mensagem do usuário!');
      speakNow(text, newItem.id);
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
        // fetch4chanThreads() - REMOVIDO: CORS bloqueado
      ]);

      const allItems = results
        .flat()
        .filter(Boolean)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('========== DEBUG FEED ==========');
      console.log('Items no feed:', allItems.length);
      console.log('Voice enabled:', isEnabled);
      console.log('Voice unlocked:', isUnlocked);
      console.log('Items:', allItems.slice(0, 10).map((item, i) => `${i + 1}. [${item.type}] ${item.content.slice(0, 30)}...`));
      console.log('================================');

      // Verificar novos itens
      const previousIds = previousItemsRef.current;

      if (!isFirstLoad.current) {
        // Encontrar itens NOVOS
        const brandNewItems = allItems.filter(item => !previousIds.has(item.id));

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
              // NEWS NOVA: Ler IMEDIATAMENTE COM PRIORIDADE
              const text = formatTextForSpeech(item);
              const isPriority = true; // NEWS NOVA sempre tem prioridade
              addToQueue(text, item.id, isPriority);
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

        // Aguardar um pouco se a voz não estiver desbloqueada
        if (!isUnlocked) {
          console.log('⏳ Voz não desbloqueada ainda, aguardando interação do usuário...');
        }

        // Separar items por tipo
        const newsItems = allItems.filter(item => item.type === 'news');
        const alertItems = allItems.filter(item => item.type === 'alert');

        // Adicionar NEWS à fila (primeira carga, sem prioridade)
        newsItems.forEach((item, index) => {
          if (hasBeenSpoken(item.id)) {
            console.log(`⏭️ NEWS ${index + 1} já foi lido, pulando`);
            return;
          }

          const text = formatTextForSpeech(item);
          addToQueue(text, item.id, false); // Primeira carga = sem prioridade
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
        allItems
          .filter(item => item.type !== 'news' && item.type !== 'alert')
          .forEach(item => previousIds.add(item.id));

        console.log(`✅ Primeira carga: ${newsItems.length} NEWS na fila, ${alertItems.length} ALERTS acumulados`);
      }

      isFirstLoad.current = false;
      setItems(allItems);

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

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    console.log('🔥 Subscribing to Firebase...');

    const unsubscribe = subscribeToKnowledge((fbItems) => {
      console.log('🔥 Firebase items received:', fbItems.length);
      setFirebaseItems(fbItems);
    });

    return () => {
      console.log('🔥 Unsubscribing from Firebase');
      unsubscribe();
    };
  }, []);

  // Timer para ler alertas acumulados a cada 5 minutos
  useEffect(() => {
    if (!isEnabled || !isUnlocked) return;

    const checkAlerts = setInterval(() => {
      const now = Date.now();
      const timeSinceLastRead = now - lastAlertReadTime.current;

      if (timeSinceLastRead >= ALERT_INTERVAL && pendingAlerts.current.length > 0) {
        console.log(`⏰ 5 MINUTOS - Lendo ${pendingAlerts.current.length} alertas acumulados`);

        // Anunciar resumo primeiro
        const summaryText = `Alert summary. ${pendingAlerts.current.length} alerts in the last 5 minutes.`;
        addToQueue(summaryText, `alert-summary-${now}`);

        // Ler cada alerta
        pendingAlerts.current.forEach((alert, i) => {
          if (!hasBeenSpoken(alert.id)) {
            const text = formatTextForSpeech(alert);
            addToQueue(text, alert.id);
            console.log(`🔊 Lendo alerta ${i + 1}: ${alert.content.slice(0, 40)}`);
          }
        });

        // Limpar e resetar timer
        pendingAlerts.current = [];
        lastAlertReadTime.current = now;

        console.log(`✅ Alertas lidos. Próxima leitura em 5 minutos.`);
      }
    }, 60000); // Verificar a cada 1 minuto

    return () => clearInterval(checkAlerts);
  }, [isEnabled, isUnlocked, addToQueue, formatTextForSpeech, hasBeenSpoken]);

  // Merge Firebase items with fetched items, avoiding duplicates
  const allItems = useMemo(() => {
    const itemsMap = new Map<string, FeedItem>();

    // Add fetched items first
    items.forEach(item => {
      itemsMap.set(item.id, item);
    });

    // Add Firebase items (will override if same ID)
    firebaseItems.forEach(item => {
      itemsMap.set(item.id, item);
    });

    // Convert back to array and sort by timestamp
    const merged = Array.from(itemsMap.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    console.log('🔀 Merged items:', merged.length, '(Firebase:', firebaseItems.length, '+ Fetched:', items.length, ')');
    return merged;
  }, [items, firebaseItems]);

  const dismissAlert = (id: string) => {
    setNewAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getIcon = (type: string, source?: string) => {
    // Por fonte específica
    if (source?.includes('BBC')) return '📺';
    if (source?.includes('WIRED')) return '⚡';
    if (source?.includes('DECRYPT')) return '🔐';
    if (source?.includes('BLOCK')) return '🧱';
    if (source?.includes('COINGECKO')) return '🦎';
    if (source?.includes('DEXSCREENER')) return '📊';
    if (source?.includes('COINTELEGRAPH')) return '💎';

    // Por tipo
    switch (type) {
      case 'prediction': return '🔮';
      case 'market': return '📈';
      case 'news': return '📰';
      case 'alert': return '🚨';
      case 'moonshot': return '🚀';
      default: return '📌';
    }
  };

  return (
    <div className={styles.container}>
      {/* ALERTAS DE NOVAS NOTÍCIAS - TOPO */}
      {newAlerts.length > 0 && (
        <div className={styles.alertsContainer}>
          {newAlerts.map(alert => (
            <div key={alert.id} className={styles.alertCard}>
              <span className={styles.alertIcon}>🆕</span>
              <span className={styles.alertText}>{alert.title}</span>
              {alert.link && (
                <a
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.alertLink}
                >
                  View →
                </a>
              )}
              <button
                className={styles.alertDismiss}
                onClick={() => dismissAlert(alert.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h2>Knowledge Base</h2>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          LIVE
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/market">📊 View Market</Link>
        <Link href="/news">📰 View News</Link>
        <Link href="/changelog">📋 Changelog</Link>
      </div>

      {/* Status de atualização */}
      <div className={styles.updateStatus}>
        <span className={styles.updateIcon}>🔄</span>
        Auto-updating every 30s...
      </div>

      {/* Feed */}
      <div className={styles.feed}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Fetching latest data...</span>
          </div>
        ) : (
          allItems.map((item) => (
            <article
              key={item.id}
              className={`${styles.post} ${item.isNew ? styles.newPost : ''} ${currentId === item.id ? styles.reading : ''}`}
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer' }}
            >
              {item.isNew && <span className={styles.newBadge}>NEW</span>}
              {currentId === item.id && (
                <span className={styles.readingBadge}>🔊 READING</span>
              )}

              {/* Post Header */}
              <div className={styles.postHeader}>
                <span className={styles.postIcon}>{getIcon(item.type, item.source)}</span>
                <span className={styles.postType}>{item.type.toUpperCase()}</span>
              </div>

              {/* Post Content */}
              <div className={styles.postContent}>
                <p>{item.content}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.postLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ({item.link})
                  </a>
                )}
              </div>

              {/* Post Footer */}
              <div className={styles.postFooter}>
                <span className={styles.postSource}>{item.source}</span>
                <span className={styles.postTime}>
                  {item.timestamp.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </span>
              </div>

              {/* Hint visual de clique */}
              {currentId !== item.id && (
                <span className={styles.clickHint}>Click to read aloud</span>
              )}
            </article>
          ))
        )}
      </div>

      {/* BOTÃO ADD KNOWLEDGE */}
      <button
        className={styles.addKnowledgeBtn}
        onClick={() => setIsModalOpen(true)}
      >
        <span className={styles.addIcon}>+</span>
        <div className={styles.addText}>
          <span>ADD KNOWLEDGE</span>
          <span className={styles.addSubtext}>EXPAND DATABASE</span>
        </div>
      </button>

      {/* Modal de adicionar */}
      <AddKnowledgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKnowledge}
      />
    </div>
  );
}

// ============ API FUNCTIONS ============

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

// fetch4chanThreads - REMOVIDO: CORS bloqueado

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
