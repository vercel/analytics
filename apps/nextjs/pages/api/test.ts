import { track } from '@vercel/analytics/server';
import { NextFetchEvent, NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

async function handler(request: NextRequest, event: NextFetchEvent) {
  track('Pages Api Route', {
    runtime: 'edge',
    router: 'pages',
  });

  return new Response('OK');
}

export default handler;
