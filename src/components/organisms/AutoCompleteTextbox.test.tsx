import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AutoCompleteTextbox from './AutoCompleteTextbox';

const fetchSuggestions = vi.fn();
const setSuggestions = vi.fn();

vi.mock('../../utils/data', () => ({
  default: () => ({
    suggestions: ['Ford', 'Focus'],
    setSuggestions,
    fetchSuggestions,
  }),
}));

describe('AutoCompleteTextbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches suggestions while typing and emits the selected suggestion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutoCompleteTextbox
        id="vehicleMake"
        name="make"
        label="Make"
        value=""
        onChange={onChange}
        ariaLabel="Vehicle make"
        apiUrl="/utils/vehiclemake"
      />
    );

    const input = screen.getByLabelText('Vehicle make');
    await user.type(input, 'Fo');

    expect(fetchSuggestions).toHaveBeenCalledWith('/utils/vehiclemake', 'F');
    expect(fetchSuggestions).toHaveBeenCalledWith('/utils/vehiclemake', 'o');
    expect(screen.getByTestId('make-suggestions')).toBeInTheDocument();

    const suggestion = screen.getByTestId('make-suggestion-0');
    Object.defineProperty(suggestion, 'innerText', {
      configurable: true,
      value: 'Ford',
    });
    fireEvent.click(suggestion);

    expect(onChange).toHaveBeenLastCalledWith({
      target: {
        name: 'make',
        value: 'Ford',
      },
    });
    expect(setSuggestions).toHaveBeenCalledWith([]);
  });

  it('clears suggestions when the input becomes empty', () => {
    const onChange = vi.fn();

    render(
      <AutoCompleteTextbox
        id="vehicleModel"
        name="model"
        label="Model"
        value="Focus"
        onChange={onChange}
        ariaLabel="Vehicle model"
        apiUrl="/utils/vehiclemodel"
      />
    );

    fireEvent.change(screen.getByLabelText('Vehicle model'), {
      target: { value: '', name: 'model' },
    });

    expect(onChange).toHaveBeenCalled();
    expect(setSuggestions).toHaveBeenCalledWith([]);
  });
});
