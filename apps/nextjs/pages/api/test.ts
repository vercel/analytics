import { track } from '@vercel/analytics/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

async function handler(_request: NextRequest, _event: NextFetchEvent) {
  track('Pages Api Route', {
    runtime: 'edge',
    router: 'pages',
  });

  return new Response('OK');
}

export default handler;
