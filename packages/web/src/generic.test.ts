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
        'https://va.vercel-scripts.com/v1/script.debug.js'
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

  describe('in production mode', () => {
    beforeEach(() => {
      inject({
        mode: 'production',
      });
    });

    describe('queue custom events', () => {
      it('should track event with name only', () => {
        track('my event');

        expect(window.vaq).toBeDefined();

        if (!window.vaq) throw new Error('window.vaq is not defined');

        expect(window.vaq[0]).toEqual([
          'event',
          {
            name: 'my event',
          },
        ]);
      });

      it('should allow custom data to be tracked', () => {
        track('custom event', {
          string: 'string',
          number: 1,
        });

        expect(window.vaq).toBeDefined();

        if (!window.vaq) throw new Error('window.vaq is not defined');

        expect(window.vaq[0]).toEqual([
          'event',
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
        track('custom event', {
          string: 'string',
          number: 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is intentional
          nested: {
            object: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is intentional
          } as any,
        });

        expect(window.vaq).toBeDefined();

        if (!window.vaq) throw new Error('window.vaq is not defined');

        expect(window.vaq[0]).toEqual([
          'event',
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

  describe('in development mode', () => {
    beforeEach(() => {
      inject({
        mode: 'development',
      });
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- This is intentional
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
    });

    describe('queue custom events', () => {
      it('should track event with name only', () => {
        track('my event');

        expect(window.vaq).toBeDefined();

        if (!window.vaq) throw new Error('window.vaq is not defined');

        expect(window.vaq[0]).toEqual([
          'event',
          {
            name: 'my event',
          },
        ]);
      });

      it('should allow custom data to be tracked', () => {
        track('custom event', {
          string: 'string',
          number: 1,
        });

        expect(window.vaq).toBeDefined();

        if (!window.vaq) throw new Error('window.vaq is not defined');

        expect(window.vaq[0]).toEqual([
          'event',
          {
            name: 'custom event',
            data: {
              string: 'string',
              number: 1,
            },
          },
        ]);
      });

      it('should log an error when nested properties are sent', () => {
        track('custom event', {
          string: 'string',
          number: 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is intentional
          nested: {
            object: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is intentional
          } as any,
        });

        // eslint-disable-next-line no-console -- Logging to console is intentional
        expect(console.error).toHaveBeenCalledTimes(1);
      });
    });
  });
});
