import { initQueue } from './queue';
import type { BeforeSend } from './types';

const isBrowser = typeof window !== 'undefined';

export const inject = ({
  beforeSend,
}: { beforeSend?: BeforeSend } = {}): void => {
  if (!isBrowser || window.vai) return;
  initQueue();

  if (beforeSend) {
    window.va?.('beforeSend', beforeSend);
  }

  const script = document.createElement('script');
  script.src = '/va/script.js';
  script.async = true;

  document.head.appendChild(script);
};
