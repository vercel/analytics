import Link from 'next/link';
import styles from '../layout.module.css';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <span className={styles.badge}>Blog</span>
      <h1>{slug.replace(/-/g, ' ')}</h1>
      <p className={styles.description}>
        This is the post content for &ldquo;{slug}&rdquo;.
      </p>
      <Link className={styles.back} href="/blog">
        All posts
      </Link>
    </>
  );
}
