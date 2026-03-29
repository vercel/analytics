'use client';
import { track } from '@vercel/analytics/next';
import { useEffect } from 'react';
import styles from './page.module.css';

let tracked = false;

export function ExposureTracker() {
  useEffect(() => {
    if (tracked) return;
    tracked = true;
    track('exposure');
  }, []);

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => track('click_cta')}
    >
      Try it out
    </button>
  );
}
