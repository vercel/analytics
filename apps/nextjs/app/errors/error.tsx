'use client';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';

export default function Error({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.log('throwing error');
    track('thrown-error', {
      message: error.message,
      time: new Date().toLocaleString(),
    });
  }, [error.message]);

  return <div>Error</div>;
}
