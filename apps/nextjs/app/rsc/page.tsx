import { headers } from 'next/headers';
import { track } from '@vercel/analytics/server';

export default async function RSC() {
  track('Viewed Experiment', undefined, {
    headers: headers(),
  });

  return <div>I did track a server action on render</div>;
}
