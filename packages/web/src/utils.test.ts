import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  computeRoute,
  getMode,
  loadProps,
  parseProperties,
  setMode,
} from './utils';

describe('utils', () => {
  describe('parse properties', () => {
    describe('strip', () => {
      it('should allow all properties', () => {
        const properties = {
          number: 10,
          string: 'some-string',
          boolean: true,
          nullable: null,
        };

        const parsed = parseProperties(properties, { strip: true });

        expect(properties).toEqual(parsed);
      });

      it('should dismiss array and object', () => {
        const properties = {
          string: 'some-string',
          array: [],
          object: {},
        };

        const parsed = parseProperties(properties, { strip: true });

        expect({
          string: 'some-string',
        }).toEqual(parsed);
      });
    });

    describe('throw error', () => {
      it('should allow all properties', () => {
        const properties = {
          number: 10,
          string: 'some-string',
          boolean: true,
          nullable: null,
        };

        const parsed = parseProperties(properties, {
          strip: false,
        });

        expect(properties).toEqual(parsed);
      });

      it('should throw an error for arrayProp and objectProp', () => {
        const properties = {
          string: 'some-string',
          arrayProp: [],
          objectProp: {},
        };

        expect(() => {
          parseProperties(properties, { strip: false });
        }).toThrow(/arrayProp, objectProp/);
      });
    });
  });

  describe('setMode', () => {
    describe('in production mode', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should set mode automatically if undefined', () => {
        setMode();
        expect(getMode()).toBe('production');
      });

      it('should overwrite when set manually', () => {
        setMode('development');
        expect(getMode()).toBe('development');
      });

      it('should set correctly when set to auto', () => {
        setMode('auto');
        expect(getMode()).toBe('production');
      });
    });

    describe('in development mode', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should set mode automatically if undefined', () => {
        setMode();
        expect(getMode()).toBe('development');
      });

      it('should overwrite when set manually', () => {
        setMode('production');
        expect(getMode()).toBe('production');
      });
    });
  });

  describe('computeRoute()', () => {
    it('returns unchanged pathname if no pathParams provided', () => {
      expect(computeRoute('/vercel/next-site/analytics', null)).toBe(
        '/vercel/next-site/analytics',
      );
    });

    it('returns null for null pathname', () => {
      expect(computeRoute(null, {})).toBe(null);
    });

    it('replaces segments', () => {
      const input = '/vercel/next-site/analytics';
      const params = {
        teamSlug: 'vercel',
        project: 'next-site',
      };
      const expected = '/[teamSlug]/[project]/analytics';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('replaces segments even one param is not used', () => {
      const input = '/vercel/next-site/analytics';
      const params = {
        lang: 'en',
        teamSlug: 'vercel',
        project: 'next-site',
      };
      const expected = '/[teamSlug]/[project]/analytics';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('must not replace partial segments', () => {
      const input = '/next-site/vercel-site';
      const params = {
        teamSlug: 'vercel',
      };
      const expected = '/next-site/vercel-site'; // remains unchanged because "vercel" is a partial match
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles array segments', () => {
      const input = '/en/us/next-site';
      const params = {
        langs: ['en', 'us'],
      };
      const expected = '/[...langs]/next-site';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles array segments and individual segments', () => {
      const input = '/en/us/next-site';
      const params = {
        langs: ['en', 'us'],
        team: 'next-site',
      };
      const expected = '/[...langs]/[team]';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles special characters in url', () => {
      const input = '/123/test(test';
      const params = {
        teamSlug: '123',
        project: 'test(test',
      };

      const expected = '/[teamSlug]/[project]';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles special more characters', () => {
      const input = '/123/tes\\t(test/3.*';
      const params = {
        teamSlug: '123',
      };

      const expected = '/[teamSlug]/tes\\t(test/3.*';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('parallel routes where params matched both individually and within arrays', () => {
      const params = {
        catchAll: ['m', 'john', 'p', 'shirt'],
        merchantId: 'john',
        productSlug: 'shirt',
      };
      expect(computeRoute('/m/john/p/shirt', params)).toBe(
        '/m/[merchantId]/p/[productSlug]',
      );
    });

    describe('edge case handling (same values for multiple params)', () => {
      it('replaces based on the priority of the pathParams keys', () => {
        const input = '/test/test';
        const params = {
          teamSlug: 'test',
          project: 'test',
        };
        const expected = '/[teamSlug]/[project]'; // 'teamSlug' takes priority over 'project' based on their order in the params object
        expect(computeRoute(input, params)).toBe(expected);
      });

      it('handles reversed priority', () => {
        const input = '/test/test';
        const params = {
          project: 'test',
          teamSlug: 'test',
        };
        const expected = '/[project]/[teamSlug]'; // 'project' takes priority over 'teamSlug' here due to the reversed order in the params object
        expect(computeRoute(input, params)).toBe(expected);
      });
    });
  });

  describe('loadProps()', () => {
    const envSave = { ...process.env };

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      window.vam = undefined;
      process.env = { ...envSave };
    });

    describe('script src', () => {
      it('returns debug script in development', () => {
        process.env.NODE_ENV = 'development';
        expect(loadProps({}).src).toBe(
          'https://va.vercel-scripts.com/v1/script.debug.js',
        );
      });

      it('uses the override prop in development', () => {
        const scriptSrc = `https://example.com/${Math.random()}/script.js`;
        process.env.NODE_ENV = 'development';
        expect(loadProps({ scriptSrc }).src).toBe(scriptSrc);
      });

      it('returns generic route in production', () => {
        expect(loadProps({}).src).toBe('/_vercel/insights/script.js');
      });

      it('uses base path in production', () => {
        const basePath = `/_vercel-${Math.random()}`;
        expect(loadProps({ basePath }).src).toBe(
          `${basePath}/insights/script.js`,
        );
      });

      it('uses the override prop in production', () => {
        const scriptSrc = `https://example.com/${Math.random()}/script.js`;
        expect(loadProps({ scriptSrc }).src).toBe(scriptSrc);
      });

      it('uses value from config string', () => {
        const scriptSrc = `https://example.com/${Math.random()}.js`;
        expect(
          loadProps({}, JSON.stringify({ analytics: { scriptSrc } })).src,
        ).toBe(scriptSrc);
      });

      it('adds leading slash to config value', () => {
        const scriptSrc = `${Math.random()}.js`;
        expect(
          loadProps({}, JSON.stringify({ analytics: { scriptSrc } })).src,
        ).toBe(`/${scriptSrc}`);
      });

      it('uses props over config string', () => {
        const scriptSrc = `https://example.com/${Math.random()}.js`;
        expect(
          loadProps(
            { scriptSrc },
            JSON.stringify({ analytics: { scriptSrc: 'notused' } }),
          ).src,
        ).toBe(scriptSrc);
      });

      it('adds leading slash to props value', () => {
        const scriptSrc = `${Math.random()}.js`;
        expect(
          loadProps(
            { scriptSrc },
            JSON.stringify({ analytics: { scriptSrc: 'notused' } }),
          ).src,
        ).toBe(`/${scriptSrc}`);
      });
    });

    describe('dataset', () => {
      it('returns default dataset with version and package name only', () => {
        expect(loadProps({}).dataset).toEqual({
          sdkn: expect.stringMatching(/@vercel\/analytics/) as string,
          sdkv: expect.any(String) as string,
        });
      });

      it('includes the provided framework in sdkn', () => {
        expect(loadProps({ framework: 'react' }).dataset).toEqual(
          expect.objectContaining({
            sdkn: expect.stringContaining('/react') as string,
          }),
        );
      });

      it('sets disableAutoTrack on demand', () => {
        expect(
          loadProps({ disableAutoTrack: true }).dataset.disableAutoTrack,
        ).toBe('1');
      });

      it('uses the provided endpoint', () => {
        const endpoint = 'https://example.com/analytics';
        expect(loadProps({ endpoint }).dataset.endpoint).toEqual(endpoint);
      });

      it('uses the provided basepath', () => {
        const basePath = '/custom-base';
        expect(loadProps({ basePath }).dataset.endpoint).toEqual(
          `${basePath}/insights`,
        );
      });

      it('prefers explicit endpoint over basePath', () => {
        const endpoint = 'https://example.com/analytics';
        const basePath = '/custom-base';
        expect(loadProps({ endpoint, basePath }).dataset.endpoint).toEqual(
          endpoint,
        );
      });

      it('uses the provided dsn', () => {
        const dsn = 'test-dsn-value';
        expect(loadProps({ dsn }).dataset.dsn).toEqual(dsn);
      });

      it('can override debug in development', () => {
        process.env.NODE_ENV = 'development';
        expect(loadProps({ debug: false }).dataset.debug).toBe('false');
      });

      it('can not set debug in production', () => {
        expect(loadProps({ debug: false }).dataset).not.toHaveProperty('debug');
      });

      it('returns complete dataset with all properties', () => {
        process.env.NODE_ENV = 'development';
        const dsn = 'test-dsn-value';
        const endpoint = 'https://example.com/analytics';
        const framework = 'nuxt';
        expect(
          loadProps({
            framework,
            disableAutoTrack: true,
            endpoint,
            dsn,
            debug: false,
          }).dataset,
        ).toEqual(
          expect.objectContaining({
            sdkn: expect.stringContaining(`/${framework}`) as string,
            sdkv: expect.any(String) as string,
            disableAutoTrack: '1',
            endpoint,
            dsn,
            debug: 'false',
          }),
        );
      });

      it('uses values from config string', () => {
        process.env.NODE_ENV = 'development';
        const dsn = 'test-dsn-value';
        const endpoint = 'https://example.com/analytics';
        const framework = 'nuxt';
        expect(
          loadProps(
            {},
            JSON.stringify({
              analytics: {
                framework,
                disableAutoTrack: true,
                endpoint,
                dsn,
                debug: false,
              },
            }),
          ).dataset,
        ).toEqual(
          expect.objectContaining({
            sdkn: expect.stringContaining(`/${framework}`) as string,
            sdkv: expect.any(String) as string,
            disableAutoTrack: '1',
            endpoint,
            dsn,
            debug: 'false',
          }),
        );
      });

      it('uses props over config string', () => {
        process.env.NODE_ENV = 'development';
        const dsn = 'test-dsn-value';
        const endpoint = 'https://example.com/analytics';
        const framework = 'nuxt';
        expect(
          loadProps(
            {
              framework,
              disableAutoTrack: true,
              endpoint,
              dsn,
              debug: false,
            },
            JSON.stringify({
              analytics: {
                framework: 'nextjs',
                disableAutoTrack: false,
                endpoint: 'unused',
                dsn: 'unused',
                debug: true,
              },
            }),
          ).dataset,
        ).toEqual(
          expect.objectContaining({
            sdkn: expect.stringContaining(`/${framework}`) as string,
            sdkv: expect.any(String) as string,
            disableAutoTrack: '1',
            endpoint,
            dsn,
            debug: 'false',
          }),
        );
      });
    });
  });
});
