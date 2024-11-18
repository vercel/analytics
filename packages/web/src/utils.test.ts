import { afterEach, beforeAll, describe, it, expect } from 'vitest';
import {
  computeRoute,
  getBasePath,
  getMode,
  getScriptSrc,
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
        '/vercel/next-site/analytics'
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
        '/m/[merchantId]/p/[productSlug]'
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

  describe('getBasePath()', () => {
    const processSave = { ...process };
    const envSave = { ...process.env };

    afterEach(() => {
      global.process = { ...processSave };
      process.env = { ...envSave };
    });

    it('returns null without process', () => {
      // @ts-expect-error -- yes, we want to completely drop process for this test!!
      global.process = undefined;
      expect(getBasePath()).toBe(null);
    });

    it('returns null without process.env', () => {
      // @ts-expect-error -- yes, we want to completely drop process.env for this test!!
      process.env = undefined;
      expect(getBasePath()).toBe(null);
    });

    it('returns basepath set for Nextjs', () => {
      const basepath = `/_vercel-${Math.random()}/insights`;
      process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH = basepath;
      expect(getBasePath()).toBe(basepath);
    });

    it('returns basepath set for Sveltekit, Nuxt, Vue, Remix', () => {
      const basepath = `/_vercel-${Math.random()}/insights`;
      import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH = basepath;
      expect(getBasePath()).toBe(basepath);
    });

    it('returns basepath set for Astro', () => {
      const basepath = `/_vercel-${Math.random()}/insights`;
      import.meta.env.PUBLIC_VERCEL_OBSERVABILITY_BASEPATH = basepath;
      expect(getBasePath()).toBe(basepath);
    });

    it('returns basepath set for CRA', () => {
      const basepath = `/_vercel-${Math.random()}/insights`;
      process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH = basepath;
      expect(getBasePath()).toBe(basepath);
    });

    it('returns null without import.meta', () => {
      // @ts-expect-error -- yes, we want to completely drop import.meta.env for this test!!
      import.meta.env = undefined;
      expect(getBasePath()).toBe(null);
    });
  });

  describe('getScriptSrc()', () => {
    const envSave = { ...process.env };

    afterEach(() => {
      window.vam = undefined;
      process.env = { ...envSave };
    });

    it('returns debug script in development', () => {
      window.vam = 'development';
      expect(getScriptSrc({})).toBe(
        'https://va.vercel-scripts.com/v1/script.debug.js'
      );
    });

    it('returns the specified prop in development', () => {
      const scriptSrc = `https://example.com/${Math.random()}/script.js`;
      window.vam = 'development';
      expect(getScriptSrc({ scriptSrc })).toBe(scriptSrc);
    });

    it('returns generic route in production', () => {
      expect(getScriptSrc({})).toBe('/_vercel/insights/script.js');
    });

    it('returns base path in production', () => {
      const basepath = `/_vercel-${Math.random()}`;
      process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH = basepath;
      expect(getScriptSrc({})).toBe(`${basepath}/insights/script.js`);
    });

    it('returns the specified prop in production', () => {
      const scriptSrc = `https://example.com/${Math.random()}/script.js`;
      expect(getScriptSrc({ scriptSrc })).toBe(scriptSrc);
    });
  });
});
