import Link from 'next/link';

function Page() {
  return (
    <div>
      <h1>First Page</h1>
      <Link href="/before-send/second?secret=vercel">Next</Link>
    </div>
  );
}

export default Page;
