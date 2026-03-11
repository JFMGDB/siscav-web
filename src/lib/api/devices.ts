import type { ApiClient } from './client';
import type { ConnectionStatus } from '@/types';
import { API_CONFIG } from '@/constants';

export async function scanDevices(client: ApiClient): Promise<unknown[]> {
  return client.request<unknown[]>(API_CONFIG.ENDPOINTS.DEVICES.SCAN, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function connectDevice(client: ApiClient, deviceId: string): Promise<unknown> {
  return client.request<unknown>(API_CONFIG.ENDPOINTS.DEVICES.CONNECT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId }),
  });
}

export async function getConnectionStatus(client: ApiClient): Promise<ConnectionStatus> {
  return client.request<ConnectionStatus>(API_CONFIG.ENDPOINTS.DEVICES.STATUS, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function disconnectDevice(client: ApiClient): Promise<unknown> {
  return client.request<unknown>(API_CONFIG.ENDPOINTS.DEVICES.DISCONNECT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function sendVideoFrame(client: ApiClient, blob: Blob, deviceId: string): Promise<void> {
  const formData = new FormData();
  formData.append('frame', blob);
  formData.append('device_id', deviceId);
  await client.request<void>(API_CONFIG.ENDPOINTS.DEVICES.VIDEO_FRAME, {
    method: 'POST',
    body: formData,
  });
}
