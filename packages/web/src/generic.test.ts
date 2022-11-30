import { inject } from './generic';

describe('inject', () => {
  describe('in development mode', () => {
    it('should add the script tag correctly', () => {
      inject({ mode: 'development' });

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
    it('should add the script tag correctly', () => {
      inject({ mode: 'production' });

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
