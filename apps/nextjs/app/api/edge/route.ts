import { track } from '@vercel/analytics/server';

export const runtime = 'edge';

export const GET = async function handler() {
  await track('Edge Event', {
    data: 'edge',
    router: 'app',
  });

  return new Response('OK');
};
