'use client';

import { useRouter } from 'next/navigation';
import styles from './BackButton.module.css';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      className={styles.backBtn}
      onClick={() => router.push('/')}
    >
      ← Back
    </button>
  );
}
