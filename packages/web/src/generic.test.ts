import { beforeEach, describe, expect, it, vi } from 'vitest';
import { group, identify, inject, pageview, reset, track } from './generic';
import { withCdp } from './test-utils';
import type { AllowedPropertyValues, Mode } from './types';

const cdpEnvelope = {
  schemaVersion: 1,
  event: {
    type: 'track',
    eventId: '018f4f7e-7b8a-7c9d-a012-3456789abcde',
    context: {
      attribution: { touches: [{ source: 'search', campaign: null }] },
    },
  },
  routing: { sendTo: { web_analytics: true } },
};

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
      const viewEndpoint = 'https://example.com/page-view';
      const eventEndpoint = 'https://example.com/custom-event';
      const sessionEndpoint = 'https://example.com/sticky-session';
      const scriptSrc = 'https://example.com/custom-script.js';
      const framework = 'nuxt';
      inject(
        {
          framework,
          disableAutoTrack: true,
          endpoint,
          eventEndpoint,
          viewEndpoint,
          sessionEndpoint,
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
            sessionEndpoint: 'unused',
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
        sessionEndpoint,
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
      const viewEndpoint = 'https://example.com/page-view';
      const eventEndpoint = 'https://example.com/custom-event';
      const sessionEndpoint = 'https://example.com/sticky-session';
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
            sessionEndpoint,
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
        sessionEndpoint,
        dsn,
        debug: 'false',
        disableAutoTrack: '1',
        sdkn: expect.stringContaining(`/${framework}`) as string,
        sdkv: expect.any(String) as string,
      });
    });
  });

  describe('track before inject', () => {
    beforeEach(() => {
      // simulate a fresh page load where inject hasn't run yet
      window.va = undefined;
      window.vaq = undefined;
    });

    it('initializes the queue and buffers events with properties', () => {
      track('exposure', { variant: 'A' });
      expect(window.vaq?.[0]).toEqual([
        'event',
        { name: 'exposure', data: { variant: 'A' }, options: {} },
      ]);
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
        expect(window.vaq?.[0]).toEqual(['event', { name, options: {} }]);
      });

      it('allows custom data to be tracked', () => {
        const name = 'custom event';
        const data = { string: 'string', number: 1 };
        track(name, data);
        expect(window.vaq?.[0]).toEqual(['event', { name, data, options: {} }]);
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
          expect(window.vaq?.[0]).toEqual([
            'event',
            { name, data, options: {} },
          ]);
        }
      });

      it('lifts __cdp out of options into the command payload', () => {
        const name = 'custom event';
        const data = { string: 'string' };
        const flags = ['my-flag'];
        track(name, data, withCdp({ flags, __cdp: cdpEnvelope }));
        expect(window.vaq?.[0]).toEqual([
          'event',
          { name, data, options: { flags }, __cdp: cdpEnvelope },
        ]);
      });

      it('sends __cdp without properties', () => {
        const name = 'custom event';
        track(
          name,
          undefined,
          withCdp<{ flags?: string[] }>({ __cdp: cdpEnvelope }),
        );
        expect(window.vaq?.[0]).toEqual([
          'event',
          { name, options: {}, __cdp: cdpEnvelope },
        ]);
      });
    });
  });

  describe('pageview', () => {
    beforeEach(() => {
      window.vaq = [];
      inject({ mode });
    });

    it('omits __cdp when not provided', () => {
      pageview({ route: '/blog/[slug]', path: '/blog/hello' });
      expect(window.vaq?.[0]).toEqual([
        'pageview',
        { route: '/blog/[slug]', path: '/blog/hello' },
      ]);
    });

    it('forwards __cdp', () => {
      pageview(
        withCdp({
          route: '/blog/[slug]',
          path: '/blog/hello',
          __cdp: cdpEnvelope,
        }),
      );
      expect(window.vaq?.[0]).toEqual([
        'pageview',
        { route: '/blog/[slug]', path: '/blog/hello', __cdp: cdpEnvelope },
      ]);
    });
  });

  describe.each([
    {
      fn: identify,
      command: 'identify',
      idKey: 'userId',
      id: 'user_123',
    },
    {
      fn: group,
      command: 'group',
      idKey: 'groupId',
      id: 'team_456',
    },
  ])('$command', ({ fn, command, idKey, id }) => {
    beforeEach(() => {
      window.va = undefined;
      window.vaq = undefined;
    });

    it('queues the call even before inject', () => {
      fn(id);
      expect(window.vaq?.[0]).toEqual([command, { [idKey]: id }]);
    });

    it('sends flat traits, including null', () => {
      inject({ mode });
      const traits = { plan: 'pro', seats: 12, active: true, churned: null };
      fn(id, traits);
      expect(window.vaq?.[0]).toEqual([command, { [idKey]: id, traits }]);
    });

    it('forwards __cdp', () => {
      inject({ mode });
      (fn as (...args: unknown[]) => void)(
        id,
        { plan: 'pro' },
        {
          __cdp: cdpEnvelope,
        },
      );
      expect(window.vaq?.[0]).toEqual([
        command,
        { [idKey]: id, traits: { plan: 'pro' }, __cdp: cdpEnvelope },
      ]);
    });

    // The ingestion endpoint only accepts primitive trait values, like it does
    // for custom event properties. Nested data belongs in `__cdp`.
    it('rejects nested traits like track does with properties', () => {
      const consoleError = vi
        .spyOn(global.console, 'error')
        .mockImplementation(() => void 0);
      consoleError.mockClear();
      inject({ mode });
      fn(id, {
        plan: 'pro',
        address: { city: 'Paris' } as unknown as AllowedPropertyValues,
        tags: ['a', 'b'] as unknown as AllowedPropertyValues,
      });

      if (mode === 'development') {
        expect(consoleError).toHaveBeenCalledWith(
          new Error(
            'The following properties are not valid: address, tags. Only strings, numbers, booleans, and null are allowed.',
          ),
        );
        expect(window.vaq).toBeUndefined();
      } else {
        expect(consoleError).not.toHaveBeenCalled();
        expect(window.vaq?.[0]).toEqual([
          command,
          { [idKey]: id, traits: { plan: 'pro' } },
        ]);
      }
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      window.va = undefined;
      window.vaq = undefined;
    });

    it('queues the call even before inject', () => {
      reset();
      expect(window.vaq?.[0]).toEqual(['reset']);
    });

    it('queues the call after identify and group', () => {
      inject({ mode });
      identify('user_123');
      group('team_456');
      reset();
      expect(window.vaq?.map(([command]) => command)).toEqual([
        'identify',
        'group',
        'reset',
      ]);
    });
  });
});
