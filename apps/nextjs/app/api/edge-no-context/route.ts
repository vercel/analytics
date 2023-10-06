import { track } from '@vercel/analytics/server';

export const runtime = 'edge';

async function handler(request: Request) {
  await track(
    'Edge Event',
    {
      data: 'edge',
      router: 'app',
      manual: true,
    },
    {
      request,
    }
  );

  return new Response('OK');
}

export const GET = handler;
