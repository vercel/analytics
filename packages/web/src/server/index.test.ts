import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { track } from './index';
import { name as packageName, version } from '../../package.json';
// @vitest-environment node

const sdkn = `${packageName}/server`;
const sdkv = version;

describe('server track', () => {
  const envSave = { ...process.env };
  const consoleLog = vi.spyOn(console, 'log');
  const consoleError = vi.spyOn(console, 'error');
  global.fetch = vi.fn();
  const fetchMock = vi.mocked(global.fetch);

  const headers = {
    'user-agent': 'test',
    'x-forwarded-for': '127.0.0.1',
  };
  const appDomain = 'example.vercel.app';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    delete (global as { window?: unknown }).window;
    process.env.NODE_ENV = 'production';
    consoleLog.mockImplementation(() => {});
    consoleError.mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...envSave };
    vi.useRealTimers();
  });

  describe('given development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('prints tracked events to console', async () => {
      await track('test-event', { key: 'value' });

      expect(consoleLog).toHaveBeenCalledWith(
        '[Vercel Web Analytics] Track "test-event" with data {"key":"value"}',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not print DISABLE_LOGS is true', async () => {
      process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS = 'true';

      await track('test-event', { key: 'value' });

      expect(consoleLog).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws for invalid properties', async () => {
      const properties = {
        valid: 'test',
        anObject: { nested: 'object' },
      } as Record<string, unknown>;

      await expect(
        track('test', properties as never, { headers }),
      ).rejects.toThrow(
        'The following properties are not valid: anObject. Only strings, numbers, booleans, and null are allowed.',
      );

      // Should not make fetch call due to error
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('given production mode', () => {
    beforeEach(() => {
      process.env.VERCEL_URL = appDomain;
      fetchMock.mockResolvedValue({
        text: async () => 'ok',
      } as Response);
    });

    it('prints log in production when VERCEL_URL is missing', async () => {
      delete process.env.VERCEL_URL;
      await track('test-event');

      expect(consoleLog).toHaveBeenCalledWith(
        "[Vercel Web Analytics] Can't find VERCEL_URL in environment variables.",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('post an event with data', async () => {
      const data = { amount: 100 };
      const name = 'Purchase';

      await track(name, data, { headers: {} });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'x-va-server': '1',
          }),
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
          }),
        }),
      );
    });

    it('can track event without properties', async () => {
      const name = 'SimpleEvent';
      await track(name, undefined, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
          }),
        }),
      );
    });

    it('accepts valid property types', async () => {
      const name = 'TestEvent';
      const properties = {
        string: 'test',
        number: 42,
        boolean: true,
        nullable: null,
      };

      await track(name, properties, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: properties,
          }),
        }),
      );
    });

    it('strips out invalid properties', async () => {
      const name = 'TestEvent';
      const properties = {
        valid: 'test',
        invalid: { nested: 'object' },
        alsoInvalid: ['array'],
      } as Record<string, unknown>;

      await track(name, properties as never, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: { valid: properties.valid },
          }),
        }),
      );
    });

    it('reuses provided referer, user-agent, cookie and IP headers', async () => {
      const userAgent = 'custom-agent/2.0';
      const cookie = 'session=def456';
      const ip = '190.80.130.60';
      const referer = 'https://acme.org/blog';
      const headers = new Headers({
        'user-agent': userAgent,
        'x-forwarded-for': ip,
        'content-type': 'foo/bar',
        unused: 'whatever',
        cookie,
        referer,
      });
      const data = { count: 200 };
      const name = 'add_to_cart';

      await track(name, data, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': userAgent,
            'x-vercel-ip': ip,
            cookie,
            'x-va-server': '1',
          },
          body: JSON.stringify({
            o: referer,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
          }),
        }),
      );
    });

    it("reuses provided request's referer, user-agent, cookie and IP", async () => {
      const userAgent = 'mobile-agent/2.0';
      const cookie = 'session=def456';
      const ip = '10.0.0.1';
      const referer = 'https://test.com/awesomeness';
      const headers = new Headers({
        'user-agent': userAgent,
        'x-forwarded-for': ip,
        'content-type': 'foo/bar',
        unused: 'whatever',
        cookie,
        referer,
      });
      const data = { data: 'yeah' };
      const name = 'an_event';

      await track(name, data, { request: { headers } });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': userAgent,
            'x-vercel-ip': ip,
            cookie,
            'x-va-server': '1',
          },
          body: JSON.stringify({
            o: referer,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
          }),
        }),
      );
    });

    it('reuses provided referer, user-agent, cookie and IP options', async () => {
      const userAgent = 'custom-agent/1.0';
      const cookie = 'session=abc123';
      const ip = '196.82.138.67';
      const referer = 'https://example.com/page';
      const headers = {
        'user-agent': userAgent,
        'x-forwarded-for': ip,
        'content-type': 'foo/bar',
        unused: 'whatever',
        cookie,
        referer,
      };
      const data = { amount: 100 };
      const name = 'Purchase';

      await track(name, data, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': userAgent,
            'x-vercel-ip': ip,
            cookie,
            'x-va-server': '1',
          },
          body: JSON.stringify({
            o: referer,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
          }),
        }),
      );
    });

    it('uses VERCEL_WEB_ANALYTICS_ENDPOINT over VERCEL_URL', async () => {
      const endpoint = 'https://analytics.example.com/38189204861386';
      process.env.VERCEL_WEB_ANALYTICS_ENDPOINT = endpoint;

      await track('test', undefined, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: new URL(endpoint).origin,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: 'test',
          }),
        }),
      );
    });

    it('inclues the provided bypass secret', async () => {
      const bypassSecret = 'secretXYZ';
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET = bypassSecret;

      const data = { amount: 100 };
      const name = 'Purchase';

      await track(name, data, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
          }),
        }),
      );
    });

    it('includes the provided flags object', async () => {
      const name = 'event-with-flags';
      const data = { amount: 100 };
      const flags = { feature1: true, feature2: 'enabled' };

      await track(name, data, { headers, flags });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/event`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            ed: data,
            f: { p: flags },
          }),
        }),
      );
    });

    it('throws error when no headers are available', async () => {
      await track('test');

      expect(consoleError).toHaveBeenCalledWith(
        Error(
          'No session context found. Pass `request` or `headers` to the `track` function.',
        ),
      );
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('gracefully handles fetch errors ', async () => {
      const error = new Error('Network error');
      fetchMock.mockRejectedValueOnce(error);
      await track('test', undefined, { headers });

      expect(consoleError).toHaveBeenCalledWith(error);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('uses fetch error responses', async () => {
      const response = 'Server error';
      const errorWithResponse = new Error('Network error');
      (errorWithResponse as { response?: string }).response = response;
      fetchMock.mockRejectedValueOnce(errorWithResponse);
      await track('test', undefined, { headers });

      expect(consoleError).toHaveBeenCalledWith(response);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('reports general failures', async () => {
      const error = 'Synchronous error';
      fetchMock.mockImplementationOnce(() => {
        throw error;
      });
      await track('test', undefined, { headers });

      expect(consoleError).toHaveBeenCalledWith(error);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    describe('given request context', () => {
      const symbol = Symbol.for('@vercel/request-context');
      let requestContext: unknown = null;

      beforeEach(() => {
        (globalThis as Record<symbol, unknown>)[symbol] = {
          get: () => requestContext,
        };
      });

      afterEach(() => {
        // Cleanup
        delete (globalThis as Record<symbol, unknown>)[symbol];
      });

      it('uses headers from request context', async () => {
        const userAgent = 'custom-agent/2.0';
        const cookie = 'session=def456';
        const ip = '190.80.130.60';
        const referer = 'https://acme.org/blog';
        requestContext = {
          headers: new Headers({
            'user-agent': userAgent,
            'x-forwarded-for': ip,
            'content-type': 'foo/bar',
            unused: 'whatever',
            cookie,
            referer,
          }),
        };

        const data = { count: 200 };
        const name = 'add_to_cart';
        await track(name, data);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `https://${appDomain}/_vercel/insights/event`,
          expect.objectContaining({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'user-agent': userAgent,
              'x-vercel-ip': ip,
              cookie,
              'x-va-server': '1',
            },
            body: JSON.stringify({
              o: referer,
              ts: vi.getMockedSystemTime()?.getTime(),
              sdkn,
              sdkv,
              r: '',
              en: name,
              ed: data,
            }),
          }),
        );
      });

      it('picks flags values from request context', async () => {
        const name = 'event-with-flags';
        const flags = { feature1: true, feature2: 'enabled' };
        requestContext = {
          headers,
          url: `https://${appDomain}`,
          flags: {
            getValues: () => flags,
          },
        };

        // Mock request context for flags to work
        await track(name, undefined, { flags: ['feature1', 'feature2'] });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `https://${appDomain}/_vercel/insights/event`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              o: `https://${appDomain}`,
              ts: vi.getMockedSystemTime()?.getTime(),
              sdkn,
              sdkv,
              r: '',
              en: name,
              f: { p: flags },
            }),
          }),
        );
      });

      it('merges flags from request context and parameters', async () => {
        const name = 'event-with-flags';
        const flags = { feature1: true, feature2: 'enabled', feature3: 'off' };
        requestContext = {
          headers,
          url: `https://${appDomain}`,
          flags: {
            getValues: () => flags,
          },
        };

        // Mock request context for flags to work
        await track(name, undefined, {
          flags: ['feature1', 'feature2', { feature4: 'yeah' }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `https://${appDomain}/_vercel/insights/event`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              o: `https://${appDomain}`,
              ts: vi.getMockedSystemTime()?.getTime(),
              sdkn,
              sdkv,
              r: '',
              en: name,
              f: {
                p: {
                  feature1: flags.feature1,
                  feature2: flags.feature2,
                  feature4: 'yeah',
                },
              },
            }),
          }),
        );
      });

      it('uses waitUntil', async () => {
        const waitUntil = vi.fn();
        requestContext = { headers, waitUntil };
        await track('test');

        expect(waitUntil).toHaveBeenCalledTimes(1);
        expect(waitUntil).toHaveBeenCalledWith(expect.any(Promise));
      });
    });
  });
});
