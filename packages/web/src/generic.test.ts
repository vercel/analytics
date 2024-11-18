import { beforeEach, describe, it, expect, vi } from 'vitest';
import { inject, track } from './generic';
import type { AllowedPropertyValues, Mode } from './types';

describe.each([
  {
    mode: 'development',
    file: 'https://va.vercel-scripts.com/v1/script.debug.js',
  },
  {
    mode: 'production',
    file: 'http://localhost:3000/_vercel/insights/script.js',
  },
] as { mode: Mode; file: string }[])('in $mode mode', ({ mode, file }) => {
  describe('inject', () => {
    it('adds the script tag correctly', () => {
      inject({ mode });

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        throw new Error('Could not find script tag');
      }

      expect(script.src).toEqual(file);
      expect(script).toHaveAttribute('defer');
    });
  });

  describe('track custom events', () => {
    beforeEach(() => {
      // reset the internal queue before every test
      window.vaq = [];
      inject({ mode });
    });

    describe('queue custom events', () => {
      it('tracks event with name only', () => {
        const name = 'my event';
        track(name);
        expect(window.vaq?.[0]).toEqual(['event', { name }]);
      });

      it('allows custom data to be tracked', () => {
        const name = 'custom event';
        const data = { string: 'string', number: 1 };
        track(name, data);
        expect(window.vaq?.[0]).toEqual(['event', { name, data }]);
      });

      it('should strip data for nested objects', () => {
        vi.spyOn(global.console, 'error').mockImplementation(() => void 0);

        const name = 'custom event';
        const data = { string: 'string', number: 1 };
        track(name, {
          ...data,
          nested: { object: '' } as unknown as AllowedPropertyValues,
        });

        if (mode === 'development') {
          // eslint-disable-next-line no-console -- only in development
          expect(console.error).toHaveBeenCalledTimes(1);
        } else {
          expect(window.vaq?.[0]).toEqual(['event', { name, data }]);
        }
      });
    });
  });
});
