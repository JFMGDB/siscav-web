import type { ApiClient } from './client';
import { API_CONFIG } from '@/constants';

export async function openGate(client: ApiClient): Promise<{ status: string; message?: string }> {
  return client.request<{ status: string; message?: string }>(API_CONFIG.ENDPOINTS.GATE.TRIGGER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}
