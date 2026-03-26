import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactDetail from './ContactDetail';

vi.mock('../ActionBar/ActionBar', () => ({
  default: ({ onAdd, onDelete, apiUrl, selectedIds, domain }: { onAdd: () => void; onDelete: (apiUrl: string, selectedIds: number[]) => void; apiUrl: string; selectedIds: number[]; domain: string }) => (
    <div data-testid={`${domain.toLowerCase()}-toolbar`}>
      <button onClick={onAdd}>add {domain}</button>
      <button onClick={() => onDelete(apiUrl, selectedIds)}>delete {domain}</button>
    </div>
  ),
}));

vi.mock('../ListView/ListView', () => ({
  default: ({ apiUrl, onSelected, onEdit }: { apiUrl: string; onSelected: (id: number) => void; onEdit: (record: Record<string, unknown>) => void }) => (
    <div data-testid={`list-view-${apiUrl}`}>
      <button onClick={() => onSelected(9)}>select-row</button>
      <button
        onClick={() =>
          onEdit(
            apiUrl.includes('/address/')
              ? { id: 6, addressLine1: 'Edited address', postcode: 'ZZ1 1ZZ' }
              : { id: 8, make: 'Edited make', model: 'Edited model' }
          )
        }
      >
        edit-row
      </button>
    </div>
  ),
}));

vi.mock('../AddressDetail/AddressDetail', () => ({
  default: ({ address }: { address?: { id?: number; addressLine1?: string } | null }) => (
    <div data-testid="mock-address-detail">{address?.addressLine1 ?? 'no-address'}</div>
  ),
}));

vi.mock('../VehicleDetail/VehicleDetail', () => ({
  default: ({ vehicle }: { vehicle?: { id?: number; make?: string } | null }) => (
    <div data-testid="mock-vehicle-detail">{vehicle?.make ?? 'no-vehicle'}</div>
  ),
}));

const baseProps = () => ({
  onAddAddress: vi.fn(),
  onAddVehicle: vi.fn(),
  onSaveContact: vi.fn(),
  onSaveAddress: vi.fn(),
  onSaveVehicle: vi.fn(),
  onDeleteAddress: vi.fn(),
  onDeleteVehicle: vi.fn(),
  selectedVehicles: vi.fn(),
});

describe('ContactDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the contact form and clears messages when fields change', async () => {
    const user = userEvent.setup();
    const props = baseProps();

    render(<ContactDetail {...props} />);

    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Forename is required');

    fireEvent.change(screen.getByTestId('contact-first-name-input'), {
      target: { name: 'first_name', value: 'Alex' },
    });
    expect(screen.queryByTestId('contact-error-message')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Last Name is required');

    fireEvent.change(screen.getByTestId('contact-last-name-input'), {
      target: { name: 'last_name', value: 'Taylor' },
    });
    fireEvent.change(screen.getByTestId('contact-telephone-input'), {
      target: { name: 'telephone', value: 'abc' },
    });
    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Telephone must be a valid number');

    fireEvent.change(screen.getByTestId('contact-telephone-input'), {
      target: { name: 'telephone', value: '0123456789' },
    });
    fireEvent.change(screen.getByTestId('contact-mobile-input'), {
      target: { name: 'mobile', value: 'xyz' },
    });
    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Mobile must be a valid number');

    fireEvent.change(screen.getByTestId('contact-mobile-input'), {
      target: { name: 'mobile', value: '07123456789' },
    });
    fireEvent.change(screen.getByTestId('contact-email-input'), {
      target: { name: 'email', value: 'invalid-email' },
    });
    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Email must be valid');

    fireEvent.change(screen.getByTestId('contact-email-input'), {
      target: { name: 'email', value: `${'a'.repeat(5000)}@${'b'.repeat(5000)}` },
    });
    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Email must be valid');
  }, 10000);

  it('submits a valid contact and wires address and vehicle actions to the current contact', async () => {
    const user = userEvent.setup();
    const props = baseProps();

    render(
      <ContactDetail
        {...props}
        contact={{
          id: 12,
          first_name: 'Alex',
          last_name: 'Taylor',
          telephone: '0123456789',
          mobile: '07123456789',
          email: 'alex@example.com',
          primary_contact: '',
        }}
      />
    );

    await user.click(screen.getByTestId('contact-save-button'));
    expect(screen.getByTestId('contact-error-message')).toHaveTextContent('Primary Contact must be selected');

    await user.selectOptions(screen.getByTestId('contact-primary-contact-select'), 'email');
    await user.click(screen.getByTestId('contact-save-button'));

    await waitFor(() => {
      expect(props.onSaveContact).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 12,
          first_name: 'Alex',
          primary_contact: 'email',
        })
      );
    });

    expect(screen.getByTestId('contact-success-message')).toHaveTextContent('Contact saved successfully');

    await user.click(screen.getByText('add Address'));
    await user.click(screen.getByText('add Vehicle'));

    expect(props.onAddAddress).toHaveBeenCalledWith(12);
    expect(props.onAddVehicle).toHaveBeenCalledWith(12);
  });

  it('routes list edit and delete actions to address and vehicle detail views', async () => {
    const user = userEvent.setup();
    const props = baseProps();

    render(
      <ContactDetail
        {...props}
        contact={{
          id: 5,
          first_name: 'Jamie',
          last_name: 'Stone',
          telephone: '0123456789',
          mobile: '07123456789',
          email: 'jamie@example.com',
          primary_contact: 'telephone',
        }}
      />
    );

    await user.click(screen.getAllByText('select-row')[0]);
    await user.click(screen.getByText('delete Address'));
    expect(props.onDeleteAddress).toHaveBeenCalledWith(expect.stringContaining('/api/contact/address'), [9]);

    await user.click(screen.getAllByText('edit-row')[0]);
    expect(screen.getByTestId('mock-address-detail')).toHaveTextContent('Edited address');

    render(
      <ContactDetail
        {...props}
        contact={{
          id: 5,
          first_name: 'Jamie',
          last_name: 'Stone',
          telephone: '0123456789',
          mobile: '07123456789',
          email: 'jamie@example.com',
          primary_contact: 'telephone',
        }}
      />
    );

    await user.click(screen.getAllByText('select-row')[1]);
    await user.click(screen.getByText('delete Vehicle'));
    expect(props.onDeleteVehicle).toHaveBeenCalledWith(expect.stringContaining('/api/vehicles'), [9]);

    await user.click(screen.getAllByText('edit-row')[1]);
    expect(screen.getByTestId('mock-vehicle-detail')).toHaveTextContent('Edited make');
  });
});
