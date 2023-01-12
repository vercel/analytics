import { inject, track } from './generic';

describe('inject', () => {
  describe('in development mode', () => {
    it('should add the script tag correctly', () => {
      inject({ mode: 'development' });

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        throw new Error('Could not find script tag');
      }

      expect(script.src).toEqual(
        'https://cdn.vercel-insights.com/v1/script.debug.js',
      );
      expect(script).toHaveAttribute('defer');
    });
  });

  describe('in production mode', () => {
    it('should add the script tag correctly', () => {
      inject({ mode: 'production' });

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        throw new Error('Could not find script tag');
      }

      expect(script.src).toEqual('http://localhost/_vercel/insights/script.js');
      expect(script).toHaveAttribute('defer');
    });
  });
});

describe('track custom events', () => {
  beforeEach(() => {
    // reset the internal queue before every test
    window.vaq = [];
  });

  describe('queue custom events', () => {
    it('should track event with name only', () => {
      inject();

      track('my event');

      expect(window.vaq).toBeDefined();

      if (!window.vaq) throw new Error('window.vaq is not defined');

      expect(window.vaq[0]).toEqual([
        'track',
        {
          name: 'my event',
        },
      ]);
    });

    it('should allow custom data to be tracked', () => {
      inject();

      track('custom event', {
        string: 'string',
        number: 1,
      });

      expect(window.vaq).toBeDefined();

      if (!window.vaq) throw new Error('window.vaq is not defined');

      expect(window.vaq[0]).toEqual([
        'track',
        {
          name: 'custom event',
          data: {
            string: 'string',
            number: 1,
          },
        },
      ]);
    });

    it('should strip data for nested objects', () => {
      inject({
        mode: 'production',
      });

      track('custom event', {
        string: 'string',
        number: 1,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        nested: {
          object: '',
        } as any,
      });

      expect(window.vaq).toBeDefined();

      if (!window.vaq) throw new Error('window.vaq is not defined');

      expect(window.vaq[0]).toEqual([
        'track',
        {
          name: 'custom event',
          data: {
            string: 'string',
            number: 1,
          },
        },
      ]);
    });
  });
});
