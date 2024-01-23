import Link from 'next/link';

export default function Blog() {
  return (
    <div>
      <Link href="/blog/my-first-blogpost">My first blog post</Link>
      <Link href="/blog/new-feature-release">Feature just got released</Link>
    </div>
  );
}
