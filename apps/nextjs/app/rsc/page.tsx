import { cookies } from 'next/headers';
import { track } from '@vercel/analytics/server';

export default async function RSC() {
  cookies();
  track('Viewed Experiment');

  return <div>I did track a server action on render</div>;
}
