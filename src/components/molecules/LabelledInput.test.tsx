import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LabelledInput from './LabelledInput';

describe('LabelledInput', () => {
  it('renders the label and input together with forwarded props', () => {
    render(
      <LabelledInput
        id="vehicle-make"
        name="make"
        label="Make"
        type="text"
        value="Toyota"
        onChange={vi.fn()}
        placeholder="Please enter the vehicle make"
        ariaLabel="Vehicle make"
        containerClassName="wrapper"
        inputClassName="textbox"
        inputRole="combobox"
        ariaExpanded={false}
        ariaControls="vehicle-make-options"
        ariaHaspopup="listbox"
        autoComplete="off"
      />
    );

    expect(screen.getByText('Make')).toHaveAttribute('for', 'vehicle-make');
    const input = screen.getByLabelText('Vehicle make');
    expect(input).toHaveValue('Toyota');
    expect(input).toHaveAttribute('placeholder', 'Please enter the vehicle make');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-controls', 'vehicle-make-options');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('forwards change events from the input', () => {
    const onChange = vi.fn();

    render(
      <LabelledInput
        id="pet-name"
        name="petName"
        label="Pet name"
        type="text"
        value=""
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Maple' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
