import * as React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Analytics, track } from './react';

describe('<Analytics />', () => {
  afterEach(() => {
    cleanup();
  });

  describe('in development mode', () => {
    it('should add the script tag correctly', () => {
      render(<Analytics mode="development" />);

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
      render(<Analytics mode="production" />);

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

  describe('track custom events', () => {
    beforeEach(() => {
      // reset the internal queue before every test
      window.vaq = [];
    });

    describe('queue custom events', () => {
      it('should track event with name only', () => {
        render(<Analytics mode="production" />);

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
        render(<Analytics mode="production" />);

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
        render(<Analytics mode="production" />);

        track('custom event', {
          string: 'string',
          number: 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Intentional to trigger error
          nested: {
            object: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow
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
});
