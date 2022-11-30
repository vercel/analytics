import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1>Index</h1>
      <Link href="/public">Public</Link>
      <Link href="/private?secret=vercel">Private</Link>
    </div>
  );
}
