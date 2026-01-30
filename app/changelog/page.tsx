'use client';

import Link from 'next/link';
import styles from './changelog.module.css';

const changelogData = [
  {
    date: '2026-01-29',
    title: 'KNOWLEDGE BASE',
    description: [
      'Added Knowledge Base with live market data',
      'Integrated CoinGecko, DexScreener, and news feeds',
      'Real-time Fear & Greed index display',
    ],
    tags: ['MARKET', 'NEWS', 'API'],
  },
  {
    date: '2026-01-28',
    title: '3D CHARACTER SYSTEM',
    description: [
      'Integrated 3D character with GLB model support',
      'Added Draco compression loader',
      'Camera positioning from GLB file',
    ],
    tags: ['3D', 'VISUAL'],
  },
  {
    date: '2026-01-27',
    title: 'VOICE SYSTEM',
    description: [
      'Added Web Speech API for announcements',
      'Voice queue system for token alerts',
      'Removed ElevenLabs dependency',
    ],
    tags: ['AUDIO', 'TTS'],
  },
  {
    date: '2026-01-26',
    title: 'TOKEN FEED',
    description: [
      'Real-time new token detection via PumpPortal WebSocket',
      'Token cards with images and market cap',
      'Click to open on pump.fun',
    ],
    tags: ['WEBSOCKET', 'TOKENS'],
  },
  {
    date: '2026-01-25',
    title: 'INITIAL LAUNCH',
    description: [
      'Core layout with 3-column design',
      'Search bar with CA detection',
      'Basic styling and responsive design',
    ],
    tags: ['CORE', 'LAUNCH'],
  },
];

export default function ChangelogPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backButton}>← Back</Link>
          <div>
            <span className={styles.label}>RELEASE NOTES</span>
            <h1>CHANGELOG</h1>
            <p className={styles.subtitle}>MAJOR PRODUCT MILESTONES AND SYSTEM UPGRADES.</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div>ENTRIES: {changelogData.length}</div>
          <div>LAST UPDATED: {changelogData[0]?.date}</div>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <span className={styles.tabLabel}>DEVELOPMENT TIMELINE</span>
        <span className={styles.tabRight}>HIGH-SIGNAL UPDATES ONLY</span>
      </div>

      {/* Changelog List */}
      <div className={styles.list}>
        {changelogData.map((entry, i) => (
          <article key={i} className={styles.entry}>
            <div className={styles.entryHeader}>
              <div>
                <span className={styles.entryDate}>{entry.date}</span>
                <h2 className={styles.entryTitle}>{entry.title}</h2>
              </div>
              <div className={styles.entryTags}>
                {entry.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <ul className={styles.entryList}>
              {entry.description.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
