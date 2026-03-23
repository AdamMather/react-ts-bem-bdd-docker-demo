import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddressDetail from './AddressDetail';

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

describe('AddressDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads contact names, normalizes the address, and submits edits', async () => {
    const user = userEvent.setup();
    const onSaveAddress = vi.fn();

    render(
      <AddressDetail
        onSaveAddress={onSaveAddress}
        address={{
          id: 3,
          contact_id: 2,
          AddressLine1: '10 Market Street',
          AddressLine2: 'Suite 2',
          AddressLine3: 'Town Centre',
          AddressLine4: 'Countyshire',
          PostCode: 'AB1 2CD',
          occupyStart: '2026-01-02T00:00:00.000Z',
          occupyEnd: '2026-02-03T00:00:00.000Z',
        } as never}
      />
    );

    expect(getContactNames).toHaveBeenCalledOnce();
    expect(screen.getByTestId('address-line1-input')).toHaveValue('10 Market Street');
    expect(screen.getByTestId('address-postcode-input')).toHaveValue('AB1 2CD');
    expect(screen.getByTestId('address-moved-in-input')).toHaveValue('2026-01-02');

    await user.clear(screen.getByTestId('address-line2-input'));
    await user.type(screen.getByTestId('address-line2-input'), 'Apartment 7');
    fireEvent.change(screen.getByTestId('address-contact-select'), { target: { name: 'contact_id', value: '1' } });
    fireEvent.change(screen.getByTestId('address-moved-out-input'), { target: { name: 'occupyEnd', value: '2026-05-06' } });
    await user.click(screen.getByTestId('address-save-button'));

    expect(onSaveAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        contact_id: '1',
        addressLine1: '10 Market Street',
        addressLine2: 'Apartment 7',
        postcode: 'AB1 2CD',
        occupyEnd: '2026-05-06',
      })
    );
  });
});
