import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./pages/Home/Home', () => ({
  default: () => <div>Home page</div>,
}));

vi.mock('./pages/KennelBoarding/KennelBoarding', () => ({
  default: () => <div>Kennel boarding page</div>,
}));

describe('App', () => {
  it('renders the home route', async () => {
    const module = await import('./App');
    render(<module.default />);

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
