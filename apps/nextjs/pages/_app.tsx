import { Analytics } from '@vercel/analytics/next';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics
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
