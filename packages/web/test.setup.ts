import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  if (typeof document === 'undefined') {
    return;
  }
  // reset dom before each test
  const html = document.getElementsByTagName('html')[0];
  if (html) {
    html.innerHTML = '';
  }
});
