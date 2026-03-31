import Link from 'next/link';
import { ExposureTracker } from './exposure-tracker';
import styles from './page.module.css';

export default function ExperimentPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link className={styles.back} href="/">
          Home
        </Link>
        <span className={styles.badge}>Experiment</span>
        <h1>See what we&apos;re testing</h1>
        <p className={styles.description}>
          This page is part of an active experiment. Your visit has been
          recorded as an exposure, and you can interact below to track
          additional events.
        </p>
        <ExposureTracker />
      </main>
    </div>
  );
}
