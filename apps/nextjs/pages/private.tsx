import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1>Private</h1>
      <Link href="/public">Public</Link>
    </div>
  );
}
