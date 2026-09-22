// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { name as packageName, version } from '../../package.json';
import { withCdp } from '../test-utils';
import { group, identify } from './attribution';

const sdkn = `${packageName}/server`;
const sdkv = version;

// Shared across both suites: `describe.each` bodies all run at collection
// time, so per-suite `global.fetch = vi.fn()` would leave only the last one.
const envSave = { ...process.env };
const consoleLog = vi.spyOn(console, 'log');
const consoleError = vi.spyOn(console, 'error');
global.fetch = vi.fn();
const fetchMock = vi.mocked(global.fetch);

describe.each([
  {
    fn: identify,
    name: 'identify' as const,
    label: 'Identify',
    idKey: 'userId',
    id: 'user_123',
  },
  {
    fn: group,
    name: 'group' as const,
    label: 'Group',
    idKey: 'groupId',
    id: 'team_456',
  },
])('$name', ({ fn, name, label, idKey, id }) => {
  const headers = {
    'user-agent': 'test',
    'x-forwarded-for': '127.0.0.1',
  };
  const appDomain = 'example.vercel.app';
  const endpoint = `https://${appDomain}/_vercel/insights/${name}`;
  const traits = { plan: 'pro', seats: 12, active: true, churned: null };

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

    it('prints the call to console', async () => {
      await fn(id, { plan: 'pro' });

      expect(consoleLog).toHaveBeenCalledWith(
        `[Vercel Web Analytics] ${label} "${id}" with traits {"plan":"pro"}`,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not print when DISABLE_LOGS is true', async () => {
      process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS = 'true';

      await fn(id);

      expect(consoleLog).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    // The ingestion endpoint only accepts primitive trait values, like it does
    // for custom event properties. Nested data belongs in `__cdp`.
    it('throws for nested traits', async () => {
      const invalid = {
        plan: 'pro',
        address: { city: 'Paris' },
        tags: ['a', 'b'],
      } as Record<string, unknown>;

      await expect(fn(id, invalid as never, { headers })).rejects.toThrow(
        'The following properties are not valid: address, tags. Only strings, numbers, booleans, and null are allowed.',
      );

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws in a browser environment', async () => {
      (global as { window?: { vam?: string } }).window = {
        vam: 'development',
      };

      await expect(fn(id)).rejects.toThrow(
        new RegExp(
          `imported the \`${name}\` function from \`@vercel/analytics/server\` in a browser environment`,
        ),
      );
    });
  });

  describe('given production mode', () => {
    beforeEach(() => {
      process.env.VERCEL_URL = appDomain;
      fetchMock.mockResolvedValue({
        text: async () => 'ok',
      } as Response);
    });

    it('prints log when VERCEL_URL is missing', async () => {
      delete process.env.VERCEL_URL;
      await fn(id);

      expect(consoleLog).toHaveBeenCalledWith(
        "[Vercel Web Analytics] Can't find VERCEL_URL in environment variables.",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns early in a browser environment', async () => {
      (global as { window?: object }).window = {};

      await fn(id);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it(`posts flat traits, including null, to the ${name} endpoint`, async () => {
      await fn(id, traits, { headers });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
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
            [idKey]: id,
            ed: traits,
          }),
        }),
      );
    });

    it('omits traits when none are provided', async () => {
      await fn(id, undefined, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            [idKey]: id,
          }),
        }),
      );
    });

    it('strips nested traits', async () => {
      const invalid = {
        plan: 'pro',
        address: { city: 'Paris' },
        tags: ['a', 'b'],
      } as Record<string, unknown>;

      await fn(id, invalid as never, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            [idKey]: id,
            ed: { plan: 'pro' },
          }),
        }),
      );
    });

    it('truncates long identifiers', async () => {
      await fn('x'.repeat(300), undefined, { headers });

      const body = JSON.parse(
        fetchMock.mock.calls[0]?.[1]?.body as string,
      ) as Record<string, string>;
      expect(body[idKey]).toHaveLength(256);
    });

    it('forwards the __cdp envelope untouched', async () => {
      const __cdp = {
        schemaVersion: 1,
        event: {
          type: name,
          context: { attribution: { touches: [{ source: null }] } },
        },
      };

      await fn(id, { plan: 'pro' }, withCdp({ headers, __cdp }));

      expect(fetchMock).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          body: JSON.stringify({
            o: `https://${appDomain}`,
            ts: vi.getMockedSystemTime()?.getTime(),
            sdkn,
            sdkv,
            r: '',
            en: name,
            [idKey]: id,
            ed: { plan: 'pro' },
            __cdp,
          }),
        }),
      );
    });

    it('treats VERCEL_WEB_ANALYTICS_ENDPOINT as a base url', async () => {
      process.env.VERCEL_WEB_ANALYTICS_ENDPOINT =
        'https://analytics.example.com/ingest';

      await fn(id, undefined, { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        `https://analytics.example.com/_vercel/insights/${name}`,
        expect.anything(),
      );
    });

    it(`uses VERCEL_WEB_ANALYTICS_${name.toUpperCase()}_ENDPOINT verbatim`, async () => {
      const override = `https://analytics.example.com/custom/${name}`;
      process.env[`VERCEL_WEB_ANALYTICS_${name.toUpperCase()}_ENDPOINT`] =
        override;

      await fn(id, undefined, { headers });

      expect(fetchMock).toHaveBeenCalledWith(override, expect.anything());
    });

    it('reports an error when no headers are available', async () => {
      await fn(id);

      expect(consoleError).toHaveBeenCalledWith(
        Error(
          `No session context found. Pass \`request\` or \`headers\` to the \`${name}\` function.`,
        ),
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
