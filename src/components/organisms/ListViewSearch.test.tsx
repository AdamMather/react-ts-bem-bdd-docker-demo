import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ListViewSearch from './ListViewSearch';

describe('ListViewSearch', () => {
  it('renders with default accessibility and styling props', () => {
    render(<ListViewSearch value="" onChange={vi.fn()} />);

    const input = screen.getByTestId('list-view-search');
    expect(input).toHaveAttribute('placeholder', 'Search...');
    expect(input).toHaveAttribute('aria-label', 'Search list');
    expect(input).toHaveClass('list-view__search');
  });

  it('supports custom props and forwards input changes', () => {
    const onChange = vi.fn();

    render(
      <ListViewSearch
        value="al"
        onChange={onChange}
        placeholder="Search contacts"
        ariaLabel="Search contacts"
        testId="contact-search"
        className="custom-search"
      />
    );

    const input = screen.getByTestId('contact-search');
    fireEvent.change(input, { target: { value: 'alex' } });

    expect(input).toHaveValue('al');
    expect(input).toHaveAttribute('placeholder', 'Search contacts');
    expect(input).toHaveAttribute('aria-label', 'Search contacts');
    expect(input).toHaveClass('custom-search');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
