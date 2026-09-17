// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { name as packageName, version } from '../../package.json';
import { withCdp } from '../test-utils';
import { trackExposure } from './experiments';

const sdkn = `${packageName}/server`;
const sdkv = version;

describe('trackExposure', () => {
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
  const exposure = {
    experimentId: 'checkout-redesign',
    variantId: 'treatment',
    unitKey: 'user' as const,
    unitValue: 'user_123',
  };

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

    it('prints exposures to console', async () => {
      await trackExposure(exposure);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Vercel Web Analytics] Exposure "checkout-redesign:treatment" with data {"variantId":"treatment","unitKey":"user","unitValue":"user_123"}',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not print when DISABLE_LOGS is true', async () => {
      process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS = 'true';

      await trackExposure(exposure);

      expect(consoleLog).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws for invalid props', async () => {
      const props = {
        valid: 'test',
        anObject: { nested: 'object' },
      } as Record<string, unknown>;

      await expect(
        trackExposure({ ...exposure, props: props as never }, { headers }),
      ).rejects.toThrow(
        'The following properties are not valid: anObject. Only strings, numbers, booleans, and null are allowed.',
      );

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
      await trackExposure(exposure);

      expect(consoleLog).toHaveBeenCalledWith(
        "[Vercel Web Analytics] Can't find VERCEL_URL in environment variables.",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts an exposure to the exposure endpoint', async () => {
      await trackExposure(exposure, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
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
            en: exposure.experimentId,
            ed: {
              variantId: exposure.variantId,
              unitKey: exposure.unitKey,
              unitValue: exposure.unitValue,
            },
          }),
        }),
      );
    });

    it('forwards the __cdp envelope untouched', async () => {
      const __cdp = {
        schemaVersion: 1,
        event: { type: 'track', context: { session: { id: 'abc' } } },
      };

      await trackExposure(exposure, withCdp({ headers, __cdp }));

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: exposure.experimentId,
            ed: {
              variantId: exposure.variantId,
              unitKey: exposure.unitKey,
              unitValue: exposure.unitValue,
            },
            __cdp,
          }),
        }),
      );
    });

    it('includes ramp data when provided', async () => {
      await trackExposure(
        {
          ...exposure,
          assignmentReason: 'experiment',
          rampId: 'ramp_1',
          rampPercentage: 25,
        },
        { headers },
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
        expect.objectContaining({
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: exposure.experimentId,
            ed: {
              variantId: exposure.variantId,
              unitKey: exposure.unitKey,
              unitValue: exposure.unitValue,
              assignmentReason: 'experiment',
              rampId: 'ramp_1',
              rampPercentage: 25,
            },
          }),
        }),
      );
    });

    it('includes attribution passed on the call side', async () => {
      await trackExposure(
        {
          ...exposure,
          userId: 'user_123',
          groupId: 'acme',
          props: { plan: 'pro', seats: 12 },
        },
        { headers },
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
        expect.objectContaining({
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            userId: 'user_123',
            groupId: 'acme',
            props: { plan: 'pro', seats: 12 },
            en: exposure.experimentId,
            ed: {
              variantId: exposure.variantId,
              unitKey: exposure.unitKey,
              unitValue: exposure.unitValue,
            },
          }),
        }),
      );
    });

    it('truncates long userId and groupId', async () => {
      const long = 'a'.repeat(300);
      await trackExposure(
        { ...exposure, userId: long, groupId: long },
        { headers },
      );

      const body = JSON.parse(
        (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)
          ?.body as string,
      ) as { userId: string; groupId: string };

      expect(body.userId).toHaveLength(256);
      expect(body.groupId).toHaveLength(256);
    });

    it('strips invalid props in production', async () => {
      await trackExposure(
        {
          ...exposure,
          props: { valid: 'test', invalid: { nested: 'object' } } as never,
        },
        { headers },
      );

      const body = JSON.parse(
        (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)
          ?.body as string,
      ) as { props: Record<string, unknown> };

      expect(body.props).toEqual({ valid: 'test' });
    });

    it('reuses provided referer, user-agent, cookie and IP headers', async () => {
      const userAgent = 'custom-agent/2.0';
      const cookie = 'session=def456';
      const ip = '190.80.130.60';
      const referer = 'https://acme.org/blog';

      await trackExposure(exposure, {
        headers: new Headers({
          'user-agent': userAgent,
          'x-forwarded-for': ip,
          cookie,
          referer,
        }),
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
        expect.objectContaining({
          headers: {
            'content-type': 'application/json',
            'user-agent': userAgent,
            'x-vercel-ip': ip,
            cookie,
            'x-va-server': '1',
          },
          body: expect.stringContaining(`"o":"${referer}"`) as string,
        }),
      );
    });

    it('accepts headers via request', async () => {
      await trackExposure(exposure, {
        request: { headers: new Headers(headers) },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('treats VERCEL_WEB_ANALYTICS_ENDPOINT as a base url', async () => {
      process.env.VERCEL_WEB_ANALYTICS_ENDPOINT =
        'https://analytics.example.com/38189204861386';

      await trackExposure(exposure, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://analytics.example.com/_vercel/insights/exposure',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('uses VERCEL_WEB_ANALYTICS_EXPOSURE_ENDPOINT verbatim', async () => {
      const endpoint = 'https://analytics.example.com/exposures/123';
      process.env.VERCEL_WEB_ANALYTICS_EXPOSURE_ENDPOINT = endpoint;

      await trackExposure(exposure, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('includes the provided bypass secret', async () => {
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET = 'secretXYZ';

      await trackExposure(exposure, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        `https://${appDomain}/_vercel/insights/exposure`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-vercel-protection-bypass': 'secretXYZ',
          }),
        }),
      );
    });

    it('reports an error when no headers are available', async () => {
      await trackExposure(exposure);

      expect(consoleError).toHaveBeenCalledWith(
        Error(
          'No session context found. Pass `request` or `headers` to the `trackExposure` function.',
        ),
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('gracefully handles fetch errors', async () => {
      const error = new Error('Network error');
      fetchMock.mockRejectedValueOnce(error);

      await trackExposure(exposure, { headers });

      expect(consoleError).toHaveBeenCalledWith(error);
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
        delete (globalThis as Record<symbol, unknown>)[symbol];
      });

      it('uses headers from request context', async () => {
        requestContext = { headers: new Headers(headers) };

        await trackExposure(exposure);

        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('uses waitUntil', async () => {
        const waitUntil = vi.fn();
        requestContext = { headers, waitUntil };

        await trackExposure(exposure);

        expect(waitUntil).toHaveBeenCalledTimes(1);
        expect(waitUntil).toHaveBeenCalledWith(expect.any(Promise));
      });
    });
  });
});
