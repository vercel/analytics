import { withSessionContext, track } from '@vercel/analytics/server';

async function handler() {
  await track('Serverless Event', {
    data: 'serverless',
    router: 'app',
  });
  return new Response('OK');
}

export const GET = withSessionContext(handler);
export const dynamic = 'force-dynamic';
