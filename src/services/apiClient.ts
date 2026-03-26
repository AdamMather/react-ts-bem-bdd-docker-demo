import { Address, BoardingOwnerRecord, Contact, Vehicle } from '../types';
import mockApi from './mockApi';

type QueryParams = Record<string, string>;

type ApiPayload =
  | Contact
  | Address
  | Vehicle
  | BoardingOwnerRecord
  | { ids?: number[]; selectedIds?: number[] }
  | null;

interface RequestOptions {
  params?: QueryParams;
  data?: ApiPayload;
}

type MutationPayload = Contact | Address | Vehicle | BoardingOwnerRecord;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const buildUrl = (url: string, params?: QueryParams): string => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const target = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    target.searchParams.set(key, value);
  });

  return target.toString();
};

const parseJson = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const performRequest = (method: HttpMethod, url: string, options: RequestOptions = {}) => {
  if (method === 'GET') {
    return fetch(buildUrl(url, options.params), {
      headers: { Accept: 'application/json' },
    });
  }

  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(options.data ?? {}),
  });
};

const requestWithMockFallback = async (
  method: HttpMethod,
  url: string,
  options: RequestOptions = {}
) => {
  const mockHandlers = {
    GET: () => mockApi.get(url, options),
    POST: () => mockApi.post(url, options.data as MutationPayload),
    PUT: () => mockApi.put(url, options.data as MutationPayload),
    DELETE: () => mockApi.delete(url, options),
  } satisfies Record<HttpMethod, () => Promise<{ data: unknown }>>;

  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return mockHandlers[method]();
  }

  let response: Response;

  try {
    response = await performRequest(method, url, options);
  } catch (error) {
    if (error instanceof Error) {
      return mockHandlers[method]();
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return { data: await parseJson(response) };
};

const apiClient = {
  async get(url: string, options: RequestOptions = {}) {
    return requestWithMockFallback('GET', url, options);
  },

  async post(url: string, data: ApiPayload) {
    return requestWithMockFallback('POST', url, { data });
  },

  async put(url: string, data: ApiPayload) {
    return requestWithMockFallback('PUT', url, { data });
  },

  async delete(url: string, options: RequestOptions = {}) {
    return requestWithMockFallback('DELETE', url, options);
  },
};

export default apiClient;
