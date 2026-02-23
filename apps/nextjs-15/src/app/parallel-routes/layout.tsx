import type { ReactNode } from 'react';

export default function ParallelRoutesLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
