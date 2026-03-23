import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehicleDetail from './VehicleDetail';

const getContactNames = vi.fn();

vi.mock('../../utils/data', () => ({
  default: () => ({
    contactNames: [
      { id: 1, contact: 'Alex Driver' },
      { id: 2, contact: 'Jamie Driver' },
    ],
    getContactNames,
  }),
}));

vi.mock('../../utils/date', () => ({
  default: () => ({
    formatDate: (value: string | Date | null | undefined) => {
      if (!value) {
        return '';
      }

      return new Date(value).toISOString().slice(0, 10);
    },
  }),
}));

vi.mock('../organisms/AutoCompleteTextbox', () => ({
  default: ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={value} onChange={onChange} data-testid={`${name}-autocomplete`} />
    </div>
  ),
}));

describe('VehicleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads contact names, normalizes the vehicle, and submits edits', async () => {
    const user = userEvent.setup();
    const onSaveVehicle = vi.fn();

    render(
      <VehicleDetail
        onSaveVehicle={onSaveVehicle}
        vehicle={{
          id: 4,
          contact_id: 2,
          make: 'Ford',
          model: 'Focus',
          registered: '2024-02-03T00:00:00.000Z',
          purchased: '2024-03-04T00:00:00.000Z',
        } as never}
      />
    );

    expect(getContactNames).toHaveBeenCalledOnce();
    expect(screen.getByTestId('make-autocomplete')).toHaveValue('Ford');
    expect(screen.getByTestId('model-autocomplete')).toHaveValue('Focus');
    expect(screen.getByTestId('vehicle-registered-input')).toHaveValue('2024-02-03');

    await user.clear(screen.getByTestId('make-autocomplete'));
    await user.type(screen.getByTestId('make-autocomplete'), 'Tesla');
    await user.clear(screen.getByTestId('model-autocomplete'));
    await user.type(screen.getByTestId('model-autocomplete'), 'Model 3');
    fireEvent.change(screen.getByTestId('vehicle-contact-select'), { target: { name: 'contact_id', value: '1' } });
    fireEvent.change(screen.getByTestId('vehicle-purchased-input'), { target: { name: 'purchased', value: '2024-06-07' } });
    await user.click(screen.getByTestId('vehicle-save-button'));

    expect(onSaveVehicle).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 4,
        contact_id: '1',
        make: 'Tesla',
        model: 'Model 3',
        purchased: '2024-06-07',
      })
    );
  });
});
