import { withRequestContext, track } from '@vercel/analytics/server';
import { NextRequest } from 'next/server';

async function handler() {
  await track('Serverless Event', {
    data: 'serverless',
    router: 'app',
  });
  return new Response('OK');
}

export const GET = withRequestContext(handler);
