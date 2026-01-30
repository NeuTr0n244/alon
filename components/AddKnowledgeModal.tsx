'use client';

import { useState } from 'react';
import styles from './AddKnowledgeModal.module.css';

interface AddKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KnowledgeInput) => void;
}

export interface KnowledgeInput {
  content: string;
  url?: string;
  type: 'note' | 'link' | 'article' | 'insight' | 'alert';
  author: string;
}

export function AddKnowledgeModal({ isOpen, onClose, onSubmit }: AddKnowledgeModalProps) {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<KnowledgeInput['type']>('note');
  const [author, setAuthor] = useState('anon');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      url: url.trim() || undefined,
      type,
      author: author.trim() || 'anon',
    });

    // Limpar form
    setContent('');
    setUrl('');
    setType('note');
    setAuthor('anon');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>UPLOAD KNOWLEDGE</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {/* Text/Content */}
          <div className={styles.field}>
            <label>TEXT / CONTENT</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter your knowledge, insight, or note here..."
              rows={5}
            />
          </div>

          {/* URL */}
          <div className={styles.field}>
            <label>URL / SOURCE (OPTIONAL)</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>

          {/* Type & Author */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>TYPE</label>
              <select value={type} onChange={e => setType(e.target.value as any)}>
                <option value="note">Note</option>
                <option value="link">Link</option>
                <option value="article">Article</option>
                <option value="insight">Insight</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>AUTHOR</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="anon"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            CANCEL
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            UPLOAD KNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
}
