import Link from 'next/link';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <h2>{slug}</h2>

      <Link href="/blog">Back to blog</Link>
    </div>
  );
}
