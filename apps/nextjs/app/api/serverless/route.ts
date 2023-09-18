import { track } from '@vercel/analytics/server';

export const GET = async function handler() {
  await track('Serverless Event', {
    data: 'serverless',
    router: 'app',
  });
  return new Response('OK');
};

export const dynamic = 'force-dynamic';
