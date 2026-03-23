import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>,
  };
});

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
