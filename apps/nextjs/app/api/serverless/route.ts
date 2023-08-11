import { withSessionContext, track } from '@vercel/analytics/server';
import { cookies } from 'next/headers';

async function handler() {
  cookies();
  await track('Serverless Event', {
    data: 'serverless',
    router: 'app',
  });
  return new Response('OK');
}

export const GET = withSessionContext(handler);
export const dynamic = 'force-dynamic';
