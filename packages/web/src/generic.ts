import { initQueue } from './queue';
import type { BeforeSend } from './types';

const isBrowser = typeof window !== 'undefined';

export const inject = ({
  beforeSend,
}: { beforeSend?: BeforeSend } = {}): void => {
  if (!isBrowser) return;
  initQueue();

  if (beforeSend) {
    window.va?.('beforeSend', beforeSend);
  }

  if (document.head.querySelector('script[src="/va/script.js"]')) return;

  const script = document.createElement('script');
  script.src = '/va/script.js';
  script.async = true;

  document.head.appendChild(script);
};
