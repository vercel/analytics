import { inject } from '../src/generic';

// TODO: test beforeSend as well

describe('inject', () => {
  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should add the script tag correctly', () => {
      inject();

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        return fail('Could not find script tag');
      }

      expect(script.src).toEqual(
        'https://cdn.vercel-insights.com/v1/script.debug.js',
      );
      expect(script).toHaveAttribute('defer');
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should add the script tag correctly', () => {
      inject();

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');

      if (!script) {
        return fail('Could not find script tag');
      }

      expect(script.src).toEqual('http://localhost/_vercel/insights/script.js');
      expect(script).toHaveAttribute('defer');
    });
  });
});
