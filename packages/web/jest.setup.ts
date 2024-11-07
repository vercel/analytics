import { beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
// Adds helpers like `.toHaveAttribute`
import '@testing-library/jest-dom/jest-globals';

beforeEach(() => {
  // reset dom before each test
  const html = document.getElementsByTagName('html')[0];
  if (html) {
    html.innerHTML = '';
  }
});
