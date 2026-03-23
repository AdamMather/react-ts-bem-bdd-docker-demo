import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useFetchRecord from './data';

const { apiGet } = vi.hoisted(() => ({
  apiGet: vi.fn(),
}));

vi.mock('../services/apiClient', () => ({
  default: {
    get: apiGet,
  },
}));

const HookHarness = () => {
  const { contacts, contactNames, suggestions, fetchRecord, getContactNames, fetchSuggestions } = useFetchRecord();

  return (
    <div>
      <button onClick={() => fetchRecord('/api/contacts')}>fetch-record</button>
      <button onClick={() => getContactNames('/api/contact/names')}>fetch-names</button>
      <button onClick={() => fetchSuggestions('/utils/vehiclemake', 'fo')}>fetch-suggestions</button>
      <div data-testid="contacts">{contacts.map((contact) => contact.first_name).join(',')}</div>
      <div data-testid="names">{contactNames.map((contact) => contact.contact).join(',')}</div>
      <div data-testid="suggestions">{suggestions.join(',')}</div>
    </div>
  );
};

describe('useFetchRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads contacts, contact names, and suggestions', async () => {
    const user = userEvent.setup();
    apiGet
      .mockResolvedValueOnce({ data: [{ id: 1, first_name: 'Alex' }] })
      .mockResolvedValueOnce({ data: [{ id: 2, contact: 'Jamie Stone' }] })
      .mockResolvedValueOnce({ data: { suggestions: [{ name: 'Ford' }, { name: 'Focus' }] } });

    render(<HookHarness />);

    await user.click(screen.getByText('fetch-record'));
    await user.click(screen.getByText('fetch-names'));
    await user.click(screen.getByText('fetch-suggestions'));

    await waitFor(() => {
      expect(screen.getByTestId('contacts')).toHaveTextContent('Alex');
      expect(screen.getByTestId('names')).toHaveTextContent('Jamie Stone');
      expect(screen.getByTestId('suggestions')).toHaveTextContent('Ford,Focus');
    });

    expect(apiGet).toHaveBeenNthCalledWith(1, '/api/contacts');
    expect(apiGet).toHaveBeenNthCalledWith(2, '/api/contact/names');
    expect(apiGet).toHaveBeenNthCalledWith(3, '/utils/vehiclemake', {
      params: { query: 'fo' },
    });
  });

  it('handles fetch errors without crashing', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiGet.mockRejectedValue(new Error('network down'));

    render(<HookHarness />);

    await user.click(screen.getByText('fetch-record'));
    await user.click(screen.getByText('fetch-names'));
    await user.click(screen.getByText('fetch-suggestions'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledTimes(3);
    });

    consoleError.mockRestore();
  });
});
