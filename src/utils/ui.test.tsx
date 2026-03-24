import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toggleSelectedId, useTimedBanner } from './ui';

const BannerHarness = () => {
  const { bannerMessage, showBanner } = useTimedBanner(100);

  return (
    <div>
      <button onClick={() => showBanner('Saved')}>show</button>
      <div data-testid="banner">{bannerMessage ?? ''}</div>
    </div>
  );
};

describe('ui helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('toggles selected ids', () => {
    expect(toggleSelectedId([], 2)).toEqual([2]);
    expect(toggleSelectedId([2, 3], 2)).toEqual([3]);
  });

  it('shows and clears timed banners', async () => {
    vi.useFakeTimers();

    render(<BannerHarness />);
    fireEvent.click(screen.getByText('show'));

    expect(screen.getByTestId('banner')).toHaveTextContent('Saved');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('banner')).toHaveTextContent('');
  });
});
