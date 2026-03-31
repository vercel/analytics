import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Next.js 15 Analytics Demo</h1>
        <nav className={styles.nav}>
          <Link className={styles.link} href="/blog">
            Blog
          </Link>
          <Link className={styles.link} href="/experiment">
            Experiment
          </Link>
        </nav>
      </main>
    </div>
  );
}
