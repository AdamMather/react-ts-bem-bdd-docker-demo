import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiDelete, apiPost, apiPut } = vi.hoisted(() => ({
  apiDelete: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock('../services/apiClient', () => ({
  default: {
    delete: apiDelete,
    post: apiPost,
    put: apiPut,
  },
}));

import { deleteEntityRecords, saveEntityRecord } from './recordActions';

describe('recordActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves new and existing records and runs callbacks', async () => {
    const refresh = vi.fn();
    const onSaved = vi.fn();
    const showBanner = vi.fn();

    await saveEntityRecord({
      apiUrl: '/api/contacts',
      record: { id: 0, first_name: 'Alex' },
      entityLabel: 'Contact',
      refresh,
      onSaved,
      showBanner,
      errorMessage: 'save failed',
    });

    await saveEntityRecord({
      apiUrl: '/api/contacts',
      record: { id: 8, first_name: 'Alex' },
      entityLabel: 'Contact',
      refresh,
      onSaved,
      showBanner,
      errorMessage: 'save failed',
    });

    expect(apiPost).toHaveBeenCalledWith('/api/contacts', { id: 0, first_name: 'Alex' });
    expect(apiPut).toHaveBeenCalledWith('/api/contacts/8', { id: 8, first_name: 'Alex' });
    expect(refresh).toHaveBeenCalledWith('/api/contacts');
    expect(onSaved).toHaveBeenCalledTimes(2);
    expect(showBanner).toHaveBeenCalledWith('Contact saved successfully.');
  });

  it('logs save errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiPost.mockRejectedValueOnce(new Error('boom'));

    await saveEntityRecord({
      apiUrl: '/api/contacts',
      record: { id: 0 },
      entityLabel: 'Contact',
      errorMessage: 'save failed',
    });

    expect(consoleError).toHaveBeenCalledWith('save failed', expect.any(Error));
    consoleError.mockRestore();
  });

  it('deletes records, supports alternate payload keys, and short-circuits empty ids', async () => {
    const refresh = vi.fn();
    const onDeleted = vi.fn();

    await deleteEntityRecords({
      apiUrl: '/api/contacts',
      ids: [1, 2],
      refresh,
      onDeleted,
      errorMessage: 'delete failed',
    });

    await deleteEntityRecords({
      apiUrl: '/api/vehicles',
      ids: [9],
      payloadKey: 'selectedIds',
      errorMessage: 'delete failed',
    });

    await deleteEntityRecords({
      apiUrl: '/api/contacts',
      ids: [],
      errorMessage: 'delete failed',
    });

    expect(apiDelete).toHaveBeenNthCalledWith(1, '/api/contacts', { data: { ids: [1, 2] } });
    expect(apiDelete).toHaveBeenNthCalledWith(2, '/api/vehicles', { data: { selectedIds: [9] } });
    expect(apiDelete).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledWith('/api/contacts');
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  it('logs delete errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiDelete.mockRejectedValueOnce(new Error('boom'));

    await deleteEntityRecords({
      apiUrl: '/api/contacts',
      ids: [1],
      errorMessage: 'delete failed',
    });

    expect(consoleError).toHaveBeenCalledWith('delete failed', expect.any(Error));
    consoleError.mockRestore();
  });
});
