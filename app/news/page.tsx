'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './news.module.css';

interface NewsItem {
  id: string;
  source: string;
  title: string;
  link: string;
  pubDate: string;
  timestamp: Date;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [storyCount, setStoryCount] = useState(0);

  // Função de fetch
  const fetchNews = useCallback(async () => {
    console.log('📰 Buscando notícias...');

    try {
      const sources = [
        { name: 'COINTELEGRAPH', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss' },
        { name: 'DECRYPT', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed' },
        { name: 'BBC', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/technology/rss.xml' },
        { name: 'WIRED', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.wired.com/feed/rss' },
      ];

      const allNews: NewsItem[] = [];

      for (const source of sources) {
        try {
          const res = await fetch(source.url, {
            cache: 'no-store',  // IMPORTANTE: Não cachear
            next: { revalidate: 0 }
          });
          const data = await res.json();

          if (data.status === 'ok' && data.items) {
            data.items.slice(0, 15).forEach((item: any) => {
              allNews.push({
                id: item.guid || item.link || Math.random().toString(),
                source: source.name,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                timestamp: new Date(item.pubDate),
              });
            });
          }
        } catch (e) {
          console.error(`Erro ao buscar ${source.name}:`, e);
        }
      }

      // Ordenar por data (mais recente primeiro)
      allNews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNews(allNews);
      setStoryCount(allNews.length);

      // ATUALIZAR TIMESTAMP COM HORA ATUAL
      const now = new Date();
      setLastUpdate(now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      console.log(`✅ ${allNews.length} notícias carregadas às ${now.toLocaleTimeString()}`);

    } catch (err) {
      console.error('Erro geral ao buscar notícias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar na montagem e a cada 60 segundos
  useEffect(() => {
    fetchNews();

    // Atualizar a cada 60 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de notícias...');
      fetchNews();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNews]);

  // Dividir em 4 colunas
  const columns: NewsItem[][] = [[], [], [], []];
  news.forEach((item, i) => {
    columns[i % 4].push(item);
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backButton}>← Back</Link>
          <div>
            <span className={styles.label}>NEWS DESK</span>
            <h1>NEWS RACK</h1>
            <p className={styles.subtitle}>HEADLINES AND ARTICLE LINKS SURFACED IN THE LIVE LOOP.</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div>STORIES: {storyCount}</div>
          <div>LATEST: {lastUpdate || 'Loading...'}</div>
          {/* Botão de refresh manual */}
          <button
            onClick={fetchNews}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <span className={styles.tabLabel}>THE DAILY FEED</span>
        <span className={styles.tabRight}>CHRONOLOGICAL ARCHIVE</span>
      </div>

      {/* News Grid */}
      <div className={styles.newsGrid}>
        {loading && news.length === 0 ? (
          <div className={styles.loading}>Loading news...</div>
        ) : (
          columns.map((column, colIndex) => (
            <div key={colIndex} className={styles.column}>
              {column.map((item) => (
                <article key={item.id} className={styles.newsCard}>
                  <div className={styles.newsHeader}>
                    <span className={styles.newsSource}>{item.source}</span>
                    <span className={styles.newsTime}>
                      {item.timestamp.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readLink}
                  >
                    READ ARTICLE →
                  </a>
                </article>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
