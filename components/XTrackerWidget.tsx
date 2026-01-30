'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './XTrackerWidget.module.css';

interface Tweet {
  id: string;
  author: string;
  username: string;
  content: string;
  timestamp: string;
  avatar: string;
}

export function XTrackerWidget() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Começa fechado
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const widgetRef = useRef<HTMLDivElement>(null);

  // Carregar preferência do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('xTrackerVisible');
    if (saved === 'true') {
      setIsVisible(true);
    }
  }, []);

  // Salvar preferência quando mudar
  useEffect(() => {
    localStorage.setItem('xTrackerVisible', String(isVisible));
  }, [isVisible]);

  // Escutar evento de toggle do header
  useEffect(() => {
    const handleToggle = () => {
      setIsVisible(prev => !prev);
    };

    window.addEventListener('toggle-x-tracker', handleToggle);
    return () => window.removeEventListener('toggle-x-tracker', handleToggle);
  }, []);

  // Fetch tweets
  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/x-tracker');
      const data = await response.json();
      setTweets(data.tweets || []);
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Só buscar tweets quando visível
  useEffect(() => {
    if (!isVisible) return;

    fetchTweets();

    // Auto-refresh a cada 60 segundos
    const interval = setInterval(fetchTweets, 60000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.controls}`)) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diff < 1) return 'now';
      if (diff < 60) return `${diff}m`;
      const hours = Math.floor(diff / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    } catch {
      return 'now';
    }
  };

  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .substring(0, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={widgetRef}
      className={`${styles.widget} ${isMinimized ? styles.minimized : ''} ${isDragging ? styles.dragging : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className={styles.header} onMouseDown={handleMouseDown}>
        <div className={styles.headerLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className={styles.title}>X Tracker</span>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.controlBtn}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => setIsVisible(false)}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Loading tweets...</span>
            </div>
          ) : tweets.length === 0 ? (
            <div className={styles.empty}>
              <span>No tweets available</span>
            </div>
          ) : (
            <div className={styles.tweets}>
              {tweets.map((tweet) => (
                <div key={tweet.id} className={styles.tweet}>
                  <div className={styles.tweetHeader}>
                    <img
                      src={tweet.avatar}
                      alt={tweet.author}
                      className={styles.avatar}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
                      }}
                    />
                    <div className={styles.tweetInfo}>
                      <div className={styles.tweetAuthor}>
                        <span className={styles.authorName}>{tweet.author}</span>
                        <span className={styles.username}>{tweet.username}</span>
                      </div>
                      <span className={styles.timestamp}>{formatTime(tweet.timestamp)}</span>
                    </div>
                  </div>

                  <p className={styles.tweetContent}>{stripHtml(tweet.content)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!isMinimized && (
        <div className={styles.footer}>
          <button className={styles.refreshBtn} onClick={fetchTweets}>
            🔄 Refresh
          </button>
          <span className={styles.count}>{tweets.length} tweets</span>
        </div>
      )}
    </div>
  );
}
