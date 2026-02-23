import { computeRoute } from '@vercel/analytics';

export default function DashboardPage() {
  const path = '/parallel-routes/dashboard';
  const route = computeRoute(path, {});

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard (Static Route)</h1>
      <p>This is a static page with no dynamic params.</p>

      <div
        style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e3f2fd' }}
      >
        <p>
          <strong>Path:</strong> {path}
        </p>
        <p>
          <strong>Computed route:</strong> {route}
        </p>
      </div>

      <p style={{ marginTop: '1rem', color: '#666' }}>
        The sidebar slot (<code>@sidebar/[...catchAll]</code>) matches this path
        with <code>catchAll: [&apos;dashboard&apos;]</code>. The{' '}
        <code>Analytics</code> component in the root layout sees both sets of
        params via <code>useParams()</code>, causing it to compute the wrong
        route.
      </p>
    </div>
  );
}
