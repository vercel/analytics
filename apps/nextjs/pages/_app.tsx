import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  const mode =
    (process.env.NEXT_PUBLIC_ANALYTICS_MODE as 'development' | 'production') ||
    'auto';

  return (
    <>
      <Analytics __mode={mode} />
      <Component {...pageProps} />
    </>
  );
}
