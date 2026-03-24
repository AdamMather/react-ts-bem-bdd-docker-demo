import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Label from './Label';

describe('Label', () => {
  it('renders the label text and associated target', () => {
    render(<Label htmlFor="email" text="Email address" />);

    const label = screen.getByText('Email address');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'email');
  });
});
