import { computeRoute } from '@vercel/analytics';

export default function SettingsPage() {
  const path = '/parallel-routes/settings';
  const route = computeRoute(path, {});

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Settings (Static Route)</h1>
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
    </div>
  );
}
