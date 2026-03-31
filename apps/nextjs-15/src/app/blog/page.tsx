import Link from 'next/link';
import styles from './layout.module.css';

export default function Blog() {
  return (
    <>
      <span className={styles.badge}>Blog</span>
      <h1>Posts</h1>
      <nav className={styles.posts}>
        <Link className={styles.post} href="/blog/my-first-blogpost">
          My first blog post
        </Link>
        <Link className={styles.post} href="/blog/new-feature-release">
          Feature just got released
        </Link>
      </nav>
    </>
  );
}
