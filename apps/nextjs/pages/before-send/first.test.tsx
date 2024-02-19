/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import Page from './first';

describe('blah', () => {
  it('blah', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'First Page'
    );
  });
});
