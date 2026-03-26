import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListView from './ListView';

const { apiGet } = vi.hoisted(() => ({
  apiGet: vi.fn(),
}));

vi.mock('../../services/apiClient', () => ({
  default: {
    get: apiGet,
  },
}));

describe('ListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fetched rows, supports searching, and emits select/edit actions', async () => {
    const user = userEvent.setup();
    const onSelected = vi.fn();
    const onEdit = vi.fn();

    apiGet.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Alice',
          registered: new Date('2026-01-02T00:00:00.000Z'),
          tags: ['vip', 'active'],
          optional: null,
        },
        {
          id: 2,
          name: 'Bob',
          registered: new Date('2026-01-03T00:00:00.000Z'),
          tags: ['new'],
          optional: { code: 7 },
        },
      ],
    });

    render(
      <ListView
        onSelected={onSelected}
        onEdit={onEdit}
        fields={['name', 'registered', 'tags', 'optional']}
        selectedIds={[1]}
        apiUrl="/api/example"
      />
    );

    await screen.findByTestId('list-row-1');

    expect(screen.getByTestId('select-row-1')).toBeChecked();
    expect(screen.getByText('2026-01-02')).toBeInTheDocument();
    expect(screen.getByText('vip, active')).toBeInTheDocument();
    expect(screen.getByText('{"code":7}')).toBeInTheDocument();

    await user.type(screen.getByTestId('list-view-search'), 'bob');
    expect(screen.queryByTestId('list-row-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('list-row-2')).toBeInTheDocument();

    await user.click(screen.getByTestId('select-row-2'));
    await user.click(screen.getByTestId('edit-row-2'));

    expect(onSelected).toHaveBeenCalledWith(2);
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        name: 'Bob',
      })
    );
  });

  it('handles empty and failing responses gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    apiGet.mockResolvedValueOnce({ data: [] }).mockRejectedValueOnce(new Error('boom'));

    const { rerender } = render(
      <ListView
        onSelected={vi.fn()}
        onEdit={vi.fn()}
        fields={['name']}
        selectedIds={[]}
        apiUrl="/api/empty"
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('list-row-1')).not.toBeInTheDocument();
    });

    rerender(
      <ListView
        onSelected={vi.fn()}
        onEdit={vi.fn()}
        fields={['name']}
        selectedIds={[3]}
        apiUrl="/api/failing"
      />
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching list:', expect.any(Error));
    });

    consoleError.mockRestore();
  });
});
