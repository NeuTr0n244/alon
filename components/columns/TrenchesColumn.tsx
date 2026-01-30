'use client';

import { useState, useEffect } from 'react';
import styles from './TrenchesColumn.module.css';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  isLiked: boolean;
  tag?: 'call' | 'meme' | 'alpha' | 'question';
}

export function TrenchesColumn() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filter, setFilter] = useState<'new' | 'hot' | 'alpha'>('new');

  useEffect(() => {
    // Mock posts
    setPosts([
      {
        id: '1',
        author: 'anon_whale',
        content: '🚀 $BONK looking ready to pump. Chart forming a beautiful cup and handle. NFA but I\'m loading up.',
        timestamp: new Date(Date.now() - 300000),
        likes: 42,
        replies: 12,
        isLiked: false,
        tag: 'call',
      },
      {
        id: '2',
        author: 'degen_larry',
        content: 'Who else got rugged by that fake Trump token? 💀 Lost 2 SOL learning that lesson',
        timestamp: new Date(Date.now() - 600000),
        likes: 89,
        replies: 34,
        isLiked: true,
        tag: 'meme',
      },
      {
        id: '3',
        author: 'alpha_hunter',
        content: '🔥 ALPHA: New memecoin launching in 2 hours. Dev is doxxed and based. Contract looks clean. DM for CA.',
        timestamp: new Date(Date.now() - 900000),
        likes: 156,
        replies: 67,
        isLiked: false,
        tag: 'alpha',
      },
      {
        id: '4',
        author: 'newbie_trader',
        content: 'How do you guys find new tokens before they moon? Any tips for a beginner?',
        timestamp: new Date(Date.now() - 1200000),
        likes: 23,
        replies: 45,
        isLiked: false,
        tag: 'question',
      },
      {
        id: '5',
        author: 'sol_maxi',
        content: 'ETH maxis are coping so hard rn. Solana is the future. 100 SOL = 100 SOL 👑',
        timestamp: new Date(Date.now() - 1500000),
        likes: 234,
        replies: 89,
        isLiked: false,
        tag: 'meme',
      },
    ]);
  }, []);

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: 'you',
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      isLiked: false,
      tag: selectedTag as any,
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setSelectedTag(null);
  };

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(post =>
      post.id === id
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case 'call': return '#00ff00';
      case 'alpha': return '#ff9900';
      case 'meme': return '#ff66ff';
      case 'question': return '#00aaff';
      default: return '#666';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>⚔️ Trenches</h2>
        <p className={styles.subtitle}>Degen talk, alpha calls, memecoin chaos</p>
      </div>

      {/* New Post */}
      <div className={styles.newPost}>
        <textarea
          placeholder="What's on your mind, anon?"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          className={styles.textarea}
          rows={3}
        />

        <div className={styles.postActions}>
          <div className={styles.tags}>
            {['call', 'alpha', 'meme', 'question'].map(tag => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${selectedTag === tag ? styles.active : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                style={{ borderColor: selectedTag === tag ? getTagColor(tag) : '#333' }}
              >
                {tag === 'call' && '📈'}
                {tag === 'alpha' && '🔥'}
                {tag === 'meme' && '😂'}
                {tag === 'question' && '❓'}
                {tag}
              </button>
            ))}
          </div>

          <button
            className={styles.postBtn}
            onClick={handlePost}
            disabled={!newPost.trim()}
          >
            Post
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className={styles.filters}>
        {['new', 'hot', 'alpha'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f as any)}
          >
            {f === 'new' && '🆕'} {f === 'hot' && '🔥'} {f === 'alpha' && '💎'}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className={styles.feed}>
        {posts.map(post => (
          <div key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <span className={styles.author}>@{post.author}</span>
              <span className={styles.time}>{formatTime(post.timestamp)}</span>
              {post.tag && (
                <span
                  className={styles.postTag}
                  style={{ background: getTagColor(post.tag) }}
                >
                  {post.tag}
                </span>
              )}
            </div>

            <p className={styles.postContent}>{post.content}</p>

            <div className={styles.postFooter}>
              <button
                className={`${styles.actionBtn} ${post.isLiked ? styles.liked : ''}`}
                onClick={() => toggleLike(post.id)}
              >
                {post.isLiked ? '❤️' : '🤍'} {post.likes}
              </button>
              <button className={styles.actionBtn}>
                💬 {post.replies}
              </button>
              <button className={styles.actionBtn}>
                🔗 Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
