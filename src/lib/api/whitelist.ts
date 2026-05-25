import type { ApiClient } from './client';
import type { AuthorizedPlate, AuthorizedPlateCreate, PaginatedResponse } from '@/types';
import { API_CONFIG } from '@/constants';

function normalizePaginated<T>(
  response: PaginatedResponse<T> | T[],
  skip: number,
  limit: number
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      skip,
      limit,
      has_next: response.length >= limit,
      has_prev: skip > 0,
    };
  }
  return response;
}

export async function getWhitelist(
  client: ApiClient,
  skip = 0,
  limit = 100
): Promise<PaginatedResponse<AuthorizedPlate>> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await client.request<PaginatedResponse<AuthorizedPlate> | AuthorizedPlate[]>(
    `${API_CONFIG.ENDPOINTS.WHITELIST}?${params}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  return normalizePaginated(res, skip, limit);
}

export async function addPlate(
  client: ApiClient,
  plate: string,
  description?: string
): Promise<AuthorizedPlate> {
  const payload: AuthorizedPlateCreate = { plate, description };
  return client.request<AuthorizedPlate>(API_CONFIG.ENDPOINTS.WHITELIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getPlate(client: ApiClient, id: string): Promise<AuthorizedPlate> {
  return client.request<AuthorizedPlate>(`${API_CONFIG.ENDPOINTS.WHITELIST}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updatePlate(
  client: ApiClient,
  id: string,
  plate: string,
  description?: string
): Promise<AuthorizedPlate> {
  const payload: AuthorizedPlateCreate = { plate, description };
  return client.request<AuthorizedPlate>(`${API_CONFIG.ENDPOINTS.WHITELIST}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function removePlate(client: ApiClient, id: string): Promise<AuthorizedPlate> {
  return client.request<AuthorizedPlate>(`${API_CONFIG.ENDPOINTS.WHITELIST}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}
