'use client';

import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copyright}>© 2025 ALON TERMINAL. All rights reserved.</span>
      <div className={styles.links}>
        <a href="#" className={styles.footerLink}>Docs</a>
        <a href="#" className={styles.footerLink}>Twitter</a>
        <a href="#" className={styles.footerLink}>Discord</a>
      </div>
    </footer>
  );
}
