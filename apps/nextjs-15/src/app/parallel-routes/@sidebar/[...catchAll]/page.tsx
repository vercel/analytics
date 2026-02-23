import { computeRoute } from '@vercel/analytics';
import Link from 'next/link';

export default async function SidebarCatchAll({
  params,
}: {
  params: Promise<{ catchAll: string[] }>;
}) {
  const { catchAll } = await params;
  const path = `/parallel-routes/${catchAll.join('/')}`;
  const route = computeRoute(path, { catchAll });

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#fff3e0',
        border: '2px dashed orange',
        marginTop: '1rem',
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>@sidebar Slot (Parallel Route)</h3>
      <p>
        <strong>catchAll param:</strong> [{catchAll?.join(', ')}]
      </p>
      <p>
        <strong>Computed route:</strong> {route}
      </p>

      <h3 style={{ marginTop: '1rem' }}>Test Routes:</h3>
      <ul style={{ padding: '1rem 0 0 1rem' }}>
        <li>
          <Link href="/parallel-routes/dashboard">Dashboard (static)</Link>
        </li>
        <li>
          <Link href="/parallel-routes/settings">Settings (static)</Link>
        </li>
      </ul>
    </div>
  );
}
