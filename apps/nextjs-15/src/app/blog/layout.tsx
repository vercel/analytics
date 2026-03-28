import Link from 'next/link';
import styles from './layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link className={styles.back} href="/">
          Home
        </Link>
        {children}
      </main>
    </div>
  );
}
