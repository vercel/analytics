'use client';
import { useEffect } from 'react';

export default function ErrorPage() {
  useEffect(() => {
    throw new Error('Error!');
  }, []);

  return <div>I should error</div>;
}
