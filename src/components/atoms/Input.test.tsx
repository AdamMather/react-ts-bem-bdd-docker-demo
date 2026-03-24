import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('renders the provided input attributes', () => {
    render(
      <Input
        id="pet-name"
        name="petName"
        type="text"
        value="Maple"
        onChange={vi.fn()}
        placeholder="Enter name"
        ariaLabel="Pet name"
        className="custom-class"
        role="combobox"
        ariaExpanded
        ariaControls="pet-name-list"
        ariaHaspopup="listbox"
        autoComplete="off"
      />
    );

    const input = screen.getByLabelText('Pet name');
    expect(input).toHaveAttribute('id', 'pet-name');
    expect(input).toHaveAttribute('name', 'petName');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Enter name');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'pet-name-list');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input.className).toContain('custom-class');
  });

  it('propagates change events', () => {
    const onChange = vi.fn();

    render(
      <Input
        id="first-name"
        name="firstName"
        type="text"
        value=""
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alex' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
