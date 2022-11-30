import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  const mode =
    (process.env.NEXT_PUBLIC_ANALYTICS_MODE as 'development' | 'production') ||
    'auto';

  return (
    <>
      <Analytics
        __mode={mode}
        beforeSend={(event) => {
          const url = new URL(event.url);

          if (url.searchParams.has('secret')) {
            url.searchParams.set('secret', 'REDACTED');
          }

          return {
            ...event,
            url: url.toString(),
          };
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
