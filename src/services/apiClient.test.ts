import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiPut = vi.fn();
const mockApiDelete = vi.fn();

vi.mock('./mockApi', () => ({
  default: {
    get: mockApiGet,
    post: mockApiPost,
    put: mockApiPut,
    delete: mockApiDelete,
  },
}));

const loadApiClient = async () => {
  vi.resetModules();
  const module = await import('./apiClient');
  return module.default;
};

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('uses fetch for GET requests and appends query params', async () => {
    const apiClient = await loadApiClient();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([{ id: 1 }]),
    } as unknown as Response);

    const response = await apiClient.get('/api/contacts', { params: { query: 'alex' } });

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/contacts?query=alex', {
      headers: { Accept: 'application/json' },
    });
    expect(response).toEqual({ data: [{ id: 1 }] });
  });

  it('returns null for 204 responses', async () => {
    const apiClient = await loadApiClient();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    } as unknown as Response);

    await expect(apiClient.delete('/api/contacts', { data: { ids: [2] } })).resolves.toEqual({ data: null });
  });

  it('falls back to the mock api when fetch fails', async () => {
    const apiClient = await loadApiClient();
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    mockApiGet.mockResolvedValue({ data: [{ id: 7 }] });
    mockApiPost.mockResolvedValue({ data: { id: 8 } });
    mockApiPut.mockResolvedValue({ data: { id: 9 } });
    mockApiDelete.mockResolvedValue({ data: null });

    await expect(apiClient.get('/api/contacts')).resolves.toEqual({ data: [{ id: 7 }] });
    await expect(apiClient.post('/api/contacts', { id: 0 })).resolves.toEqual({ data: { id: 8 } });
    await expect(apiClient.put('/api/contacts/9', { id: 9 })).resolves.toEqual({ data: { id: 9 } });
    await expect(apiClient.delete('/api/contacts', { data: { selectedIds: [9] } })).resolves.toEqual({ data: null });

    expect(mockApiGet).toHaveBeenCalledWith('/api/contacts', {});
    expect(mockApiPost).toHaveBeenCalledWith('/api/contacts', { id: 0 });
    expect(mockApiPut).toHaveBeenCalledWith('/api/contacts/9', { id: 9 });
    expect(mockApiDelete).toHaveBeenCalledWith('/api/contacts', { data: { selectedIds: [9] } });
  });

  it('throws when fetch returns a non-ok response', async () => {
    const apiClient = await loadApiClient();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response);

    await expect(apiClient.get('/api/contacts')).rejects.toThrow('Request failed with status 500');
  });

  it('uses the mock api directly when the env flag is enabled', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'true');
    const apiClient = await loadApiClient();
    mockApiGet.mockResolvedValue({ data: ['mocked'] });

    const response = await apiClient.get('/api/contacts');

    expect(fetch).not.toHaveBeenCalled();
    expect(mockApiGet).toHaveBeenCalledWith('/api/contacts', {});
    expect(response).toEqual({ data: ['mocked'] });
  });

  it('sends JSON payloads for post and put requests', async () => {
    const apiClient = await loadApiClient();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ id: 10 }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ id: 10, first_name: 'Updated' }),
      } as unknown as Response);

    await apiClient.post('/api/contacts', { id: 0, first_name: 'Alex' });
    await apiClient.put('/api/contacts/10', { id: 10, first_name: 'Updated' });

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: 0, first_name: 'Alex' }),
    });
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/contacts/10', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: 10, first_name: 'Updated' }),
    });
  });
});
