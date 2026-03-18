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

const apiClient = {
  async get(url: string, options: RequestOptions = {}) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return mockApi.get(url, options);
    }

    let response: Response;

    try {
      response = await fetch(buildUrl(url, options.params), {
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      return mockApi.get(url, options);
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { data: await parseJson(response) };
  },

  async post(url: string, data: ApiPayload) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return mockApi.post(url, data as Contact | Address | Vehicle | BoardingOwnerRecord);
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data ?? {}),
      });
    } catch (error) {
      return mockApi.post(url, data as Contact | Address | Vehicle | BoardingOwnerRecord);
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { data: await parseJson(response) };
  },

  async put(url: string, data: ApiPayload) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return mockApi.put(url, data as Contact | Address | Vehicle | BoardingOwnerRecord);
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data ?? {}),
      });
    } catch (error) {
      return mockApi.put(url, data as Contact | Address | Vehicle | BoardingOwnerRecord);
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { data: await parseJson(response) };
  },

  async delete(url: string, options: RequestOptions = {}) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return mockApi.delete(url, options);
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(options.data ?? {}),
      });
    } catch (error) {
      return mockApi.delete(url, options);
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { data: await parseJson(response) };
  },
};

export default apiClient;
