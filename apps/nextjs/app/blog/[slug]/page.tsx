import Link from 'next/link';

export default function BlogPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h2>{params.slug}</h2>

      <Link href="/blog">Back to blog</Link>
    </div>
  );
}
