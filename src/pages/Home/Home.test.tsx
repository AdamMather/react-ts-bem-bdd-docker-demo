import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './Home';

const { fetchRecord, apiDelete, apiPost, apiPut } = vi.hoisted(() => ({
  fetchRecord: vi.fn(),
  apiDelete: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock('../../utils/data', () => ({
  default: () => ({
    fetchRecord,
  }),
}));

vi.mock('../../services/apiClient', () => ({
  default: {
    delete: apiDelete,
    post: apiPost,
    put: apiPut,
  },
}));

vi.mock('../../components/ActionBar/ActionBar', () => ({
  default: ({ onAdd, onDelete, apiUrl, selectedIds, domain }: { onAdd: () => void; onDelete: (apiUrl: string, selectedIds: number[]) => void; apiUrl: string; selectedIds: number[]; domain: string }) => (
    <div data-testid={`${domain.toLowerCase()}-action-bar`}>
      <button onClick={onAdd}>add-{domain}</button>
      <button onClick={() => onDelete(apiUrl, selectedIds)}>delete-{domain}</button>
    </div>
  ),
}));

vi.mock('../../components/ListView/ListView', () => ({
  default: ({ onSelected, onEdit }: { onSelected: (id: number) => void; onEdit: (record: Record<string, unknown>) => void }) => (
    <div data-testid="mock-list-view">
      <button onClick={() => onSelected(4)}>select-contact</button>
      <button
        onClick={() =>
          onEdit({
            id: 4,
            first_name: 'Edited',
            last_name: 'Contact',
            telephone: '0123456789',
            mobile: '07123456789',
            email: 'edited@example.com',
            primary_contact: 'telephone',
          })
        }
      >
        edit-contact
      </button>
    </div>
  ),
}));

vi.mock('../../components/ContactDetail/ContactDetail', () => ({
  default: ({
    contact,
    onAddAddress,
    onAddVehicle,
    onSaveContact,
  }: {
    contact?: { id?: number; first_name?: string } | null;
    onAddAddress: (contactId?: number) => void;
    onAddVehicle: (contactId?: number) => void;
    onSaveContact: (contact: Record<string, unknown>) => void;
  }) => (
    <div data-testid="mock-contact-detail">
      <span>{contact?.first_name ?? 'new-contact'}</span>
      <button onClick={() => onAddAddress(contact?.id ?? 0)}>go-address</button>
      <button onClick={() => onAddVehicle(contact?.id ?? 0)}>go-vehicle</button>
      <button
        onClick={() =>
          onSaveContact({
            id: contact?.id ?? 0,
            first_name: 'Alex',
            last_name: 'Taylor',
            telephone: '0123456789',
            mobile: '07123456789',
            email: 'alex@example.com',
            primary_contact: 'telephone',
          })
        }
      >
        save-contact
      </button>
    </div>
  ),
}));

vi.mock('../../components/AddressDetail/AddressDetail', () => ({
  default: ({ address, onSaveAddress }: { address?: { id?: number; contact_id?: number } | null; onSaveAddress: (address: Record<string, unknown>) => void }) => (
    <div data-testid="mock-address-detail">
      <span>{String(address?.contact_id ?? 0)}</span>
      <button
        onClick={() =>
          onSaveAddress({
            id: address?.id ?? 0,
            contact_id: address?.contact_id ?? 0,
            addressLine1: '12 High Street',
            addressLine2: '',
            addressLine3: '',
            addressLine4: '',
            postcode: 'AB1 2CD',
            occupyStart: '2026-01-01',
            occupyEnd: '2026-01-02',
          })
        }
      >
        save-address
      </button>
    </div>
  ),
}));

vi.mock('../../components/VehicleDetail/VehicleDetail', () => ({
  default: ({ vehicle, onSaveVehicle }: { vehicle?: { id?: number; contact_id?: number } | null; onSaveVehicle: (vehicle: Record<string, unknown>) => void }) => (
    <div data-testid="mock-vehicle-detail">
      <span>{String(vehicle?.contact_id ?? 0)}</span>
      <button
        onClick={() =>
          onSaveVehicle({
            id: vehicle?.id ?? 0,
            contact_id: vehicle?.contact_id ?? 0,
            make: 'Ford',
            model: 'Focus',
            registered: '2026-01-03',
            purchased: '2026-01-04',
          })
        }
      >
        save-vehicle
      </button>
    </div>
  ),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiDelete.mockResolvedValue({ data: null });
    apiPost.mockResolvedValue({ data: { id: 1 } });
    apiPut.mockResolvedValue({ data: { id: 1 } });
  });

  it('renders the contact list, deletes selections, and opens contact editing', async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    await user.click(screen.getByText('select-contact'));
    await user.click(screen.getByText('delete-Contact'));

    await waitFor(() => {
      expect(apiDelete).toHaveBeenCalledWith(expect.stringContaining('/api/contacts'), {
        data: { ids: [4] },
      });
    });
    expect(fetchRecord).toHaveBeenCalledWith(expect.stringContaining('/api/contacts'));

    await user.click(screen.getByText('edit-contact'));
    expect(screen.getByTestId('mock-contact-detail')).toHaveTextContent('Edited');
  });

  it('creates and updates contacts and shows a save banner', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByText('add-Contact'));
    await user.click(screen.getByText('save-contact'));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(expect.stringContaining('/api/contacts'), expect.objectContaining({ id: 0 }));
    });
    expect(screen.getByTestId('save-banner')).toHaveTextContent('Contact saved successfully.');

    await user.click(screen.getByText('edit-contact'));
    await user.click(screen.getByText('save-contact'));

    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith(expect.stringContaining('/api/contacts/4'), expect.objectContaining({ id: 4 }));
    });
  });

  it('creates and updates addresses and vehicles', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByText('add-Contact'));
    await user.click(screen.getByText('go-address'));
    expect(screen.getByTestId('mock-address-detail')).toHaveTextContent('0');
    await user.click(screen.getByText('save-address'));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(expect.stringContaining('/api/contact/address'), expect.objectContaining({ id: 0 }));
    });
    expect(fetchRecord).toHaveBeenCalledWith(expect.stringContaining('/api/contact/address'));

    await user.click(screen.getByText('edit-contact'));
    await user.click(screen.getByText('go-address'));
    expect(screen.getByTestId('mock-address-detail')).toHaveTextContent('4');
    await user.click(screen.getByText('save-address'));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(expect.stringContaining('/api/contact/address'), expect.objectContaining({ id: 0, contact_id: 4 }));
    });

    render(<Home />);
    await user.click(screen.getAllByText('edit-contact')[0]);
    await user.click(screen.getByText('go-vehicle'));
    expect(screen.getByTestId('mock-vehicle-detail')).toHaveTextContent('4');
    await user.click(screen.getByText('save-vehicle'));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(expect.stringContaining('/api/vehicles'), expect.objectContaining({ id: 0, contact_id: 4 }));
    });
  });

  it('handles save and delete failures without leaving the current view', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiPost.mockRejectedValueOnce(new Error('save failed'));

    render(<Home />);

    await user.click(screen.getByText('add-Contact'));
    await user.click(screen.getByText('save-contact'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error saving contact record:', expect.any(Error));
    });
    expect(screen.getByTestId('mock-contact-detail')).toBeInTheDocument();
    expect(screen.queryByTestId('save-banner')).not.toBeInTheDocument();

    cleanup();
    render(<Home />);
    await user.click(screen.getByText('edit-contact'));
    await user.click(screen.getByText('go-address'));
    await user.click(screen.getByText('save-address'));

    await waitFor(() => {
      expect(screen.getByTestId('save-banner')).toHaveTextContent('Address saved successfully.');
    });

    cleanup();
    render(<Home />);
    await user.click(screen.getByText('edit-contact'));
    await user.click(screen.getByText('go-vehicle'));
    await user.click(screen.getByText('save-vehicle'));

    await waitFor(() => {
      expect(screen.getByTestId('save-banner')).toHaveTextContent('Vehicle saved successfully.');
    });

    cleanup();
    render(<Home />);
    await user.click(screen.getByText('delete-Contact'));

    expect(apiDelete).toHaveBeenCalledTimes(0);

    consoleError.mockRestore();
  });
});
