import * as React from 'react';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import type { AllowedPropertyValues, AnalyticsProps, Mode } from '../types';
import { Analytics, track } from './index';

describe('<Analytics />', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.va = undefined;
    // reset the internal queue before every test
    window.vaq = [];
  });

  describe.each([
    {
      mode: 'development',
      file: 'https://va.vercel-scripts.com/v1/script.debug.js',
    },
    {
      mode: 'production',
      file: 'http://localhost:3000/_vercel/insights/script.js',
    },
  ] as { mode: Mode; file: string }[])('in $mode mode', ({ mode, file }) => {
    it('adds the script tag correctly', () => {
      render(<Analytics mode={mode} />);

      const scripts = document.getElementsByTagName('script');
      expect(scripts).toHaveLength(1);

      const script = document.head.querySelector('script');
      expect(script).toBeDefined();
      expect(script?.src).toEqual(file);
      expect(script).toHaveAttribute('defer');
    });

    it('sets and changes beforeSend', () => {
      const beforeSend: Required<AnalyticsProps>['beforeSend'] = (event) =>
        event;
      const beforeSend2: Required<AnalyticsProps>['beforeSend'] = (event) =>
        event;
      const { rerender } = render(
        <Analytics beforeSend={beforeSend} mode="production" />
      );

      expect(window.vaq?.[0]).toEqual(['beforeSend', beforeSend]);
      expect(window.vaq).toHaveLength(1);
      window.vaq?.splice(0, 1);

      rerender(<Analytics beforeSend={beforeSend} mode="production" />);
      expect(window.vaq).toHaveLength(0);

      rerender(<Analytics beforeSend={beforeSend2} mode="production" />);
      expect(window.vaq?.[0]).toEqual(['beforeSend', beforeSend2]);
      expect(window.vaq).toHaveLength(1);
    });

    it('does not change beforeSend when undefined', () => {
      const beforeSend: Required<AnalyticsProps>['beforeSend'] = (event) =>
        event;
      const { rerender } = render(<Analytics beforeSend={beforeSend} />);

      expect(window.vaq?.[0]).toEqual(['beforeSend', beforeSend]);
      expect(window.vaq).toHaveLength(1);
      window.vaq?.splice(0, 1);

      rerender(<Analytics />);
      expect(window.vaq).toHaveLength(0);
    });
  });

  describe('track custom events', () => {
    describe('queue custom events', () => {
      it('tracks event with name only', () => {
        render(<Analytics mode="production" />);
        track('my event');

        expect(window.vaq?.[0]).toEqual([
          'event',
          {
            name: 'my event',
          },
        ]);
      });

      it('allows custom data to be tracked', () => {
        render(<Analytics mode="production" />);
        const name = 'custom event';
        const data = { string: 'string', number: 1 };
        track(name, data);

        expect(window.vaq?.[0]).toEqual(['event', { name, data }]);
      });

      it('strips data for nested objects', () => {
        render(<Analytics mode="production" />);
        const name = 'custom event';
        const data = { string: 'string', number: 1 };
        track(name, {
          ...data,
          nested: { object: '' } as unknown as AllowedPropertyValues,
        });

        expect(window.vaq?.[0]).toEqual(['event', { name, data }]);
      });
    });
  });
});
