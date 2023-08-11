import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { track } from '@vercel/analytics/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    track(
      'Redirect',
      {
        path: request.nextUrl.pathname,
        type: 'waitUntil',
      },
      {
        request,
      },
    ),
  );
  return NextResponse.redirect(new URL('/server-actions', request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/middleware/:path*',
};
