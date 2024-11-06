import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div>Testing web analytics</div>
      <ul>
        <li>
          <Link href="/blog-pages/page-a">Pages directory A</Link>
        </li>
        <li>
          <Link href="/blog-pages/page-b">Pages directory B</Link>
        </li>
        <li>
          <Link href="/blog">App directory</Link>
        </li>
      </ul>
    </>
  );
}
