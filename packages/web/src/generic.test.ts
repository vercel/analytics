import { beforeEach, describe, expect, it, vi } from 'vitest';
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

    it('uses props over config string', () => {
      const dsn = 'test-dsn-value';
      const endpoint = 'https://example.com/analytics';
      const viewEndpoint = 'https://example.com/view';
      const eventEndpoint = 'https://example.com/event';
      const scriptSrc = 'https://example.com/custom-script.js';
      const framework = 'nuxt';
      inject(
        {
          framework,
          disableAutoTrack: true,
          endpoint,
          eventEndpoint,
          viewEndpoint,
          dsn,
          debug: false,
          scriptSrc,
        },
        JSON.stringify({
          analytics: {
            framework: 'nextjs',
            disableAutoTrack: false,
            endpoint: 'unused',
            eventEndpoint: 'unused',
            viewEndpoint: 'unused',
            dsn: 'unused',
            debug: true,
            scriptSrc: file,
          },
        }),
      );

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        throw new Error('Could not find script tag');
      }

      expect(script.src).toEqual(scriptSrc);
      expect(script).toHaveAttribute('defer');
      expect({ ...script.dataset }).toEqual({
        endpoint,
        viewEndpoint,
        eventEndpoint,
        dsn,
        debug: 'false',
        disableAutoTrack: '1',
        sdkn: expect.stringContaining(`/${framework}`) as string,
        sdkv: expect.any(String) as string,
      });
    });

    it('reads config string', () => {
      const dsn = 'test-dsn-value';
      const endpoint = 'https://example.com/analytics';
      const scriptSrc = 'https://example.com/custom-script.js';
      const viewEndpoint = 'https://example.com/view';
      const eventEndpoint = 'https://example.com/event';
      const framework = 'nuxt';
      inject(
        {},
        JSON.stringify({
          analytics: {
            framework,
            disableAutoTrack: true,
            endpoint,
            eventEndpoint,
            viewEndpoint,
            dsn,
            debug: false,
            scriptSrc,
          },
        }),
      );

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        throw new Error('Could not find script tag');
      }

      expect(script.src).toEqual(scriptSrc);
      expect(script).toHaveAttribute('defer');
      expect({ ...script.dataset }).toEqual({
        endpoint,
        viewEndpoint,
        eventEndpoint,
        dsn,
        debug: 'false',
        disableAutoTrack: '1',
        sdkn: expect.stringContaining(`/${framework}`) as string,
        sdkv: expect.any(String) as string,
      });
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
          expect(console.error).toHaveBeenCalledTimes(1);
        } else {
          expect(window.vaq?.[0]).toEqual(['event', { name, data }]);
        }
      });
    });
  });
});
