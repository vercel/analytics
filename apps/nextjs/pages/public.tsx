import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1>Public</h1>
      <Link href="/private?secret=vercel">Private</Link>
    </div>
  );
}
