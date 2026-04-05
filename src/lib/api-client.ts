/**
 * Backward-compatible API client. Delegates to lib/api (cookie-based client + domain modules).
 * Use getClientApiClient() and domain modules directly in new code.
 */

import {
  getClientApiClient,
  readBrowserAccessToken,
  readBrowserRefreshToken,
} from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import * as whitelistApi from '@/lib/api/whitelist';
import * as logsApi from '@/lib/api/logs';
import * as gateApi from '@/lib/api/gate';
import * as monitorApi from '@/lib/api/monitor';
import * as devicesApi from '@/lib/api/devices';
import type {
  AuthResponse,
  AuthorizedPlate,
  AuthorizedPlateCreate,
  PaginatedResponse,
  AccessLog,
  AccessLogFilters,
  Capture,
  ConnectionStatus,
} from '@/types';

function client() {
  return getClientApiClient();
}

export const apiClient = {
  setAccessToken(_token: string | null) {
    // No-op: cookies set via login / ApiClient.setTokens only.
  },
  setRefreshToken(_token: string | null) {
    // No-op: cookies set via login / ApiClient.setTokens only.
  },
  getAccessToken(): string | null {
    return readBrowserAccessToken();
  },
  getRefreshToken(): string | null {
    return readBrowserRefreshToken();
  },
  async refreshTokens(): Promise<void> {
    return client().refreshTokens();
  },
  async register(email: string, password: string) {
    return authApi.register(client(), email, password);
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    return authApi.login(client(), email, password);
  },
  async getWhitelist(skip = 0, limit = 100): Promise<PaginatedResponse<AuthorizedPlate>> {
    return whitelistApi.getWhitelist(client(), skip, limit);
  },
  async addPlate(plate: string, description?: string): Promise<AuthorizedPlate> {
    return whitelistApi.addPlate(client(), plate, description);
  },
  async getPlate(id: string): Promise<AuthorizedPlate> {
    return whitelistApi.getPlate(client(), id);
  },
  async updatePlate(id: string, plate: string, description?: string): Promise<AuthorizedPlate> {
    return whitelistApi.updatePlate(client(), id, plate, description);
  },
  async removePlate(id: string): Promise<AuthorizedPlate> {
    return whitelistApi.removePlate(client(), id);
  },
  async getLogs(filters: AccessLogFilters = {}): Promise<PaginatedResponse<AccessLog>> {
    return logsApi.getLogs(client(), filters);
  },
  async openGate(): Promise<{ status: string; message?: string }> {
    return gateApi.openGate(client());
  },
  async getLastCapture(): Promise<Capture | null> {
    return monitorApi.getLastCapture(client());
  },
  async registerUnknownPlate(plate: string, description: string): Promise<void> {
    return monitorApi.registerUnknownPlate(client(), plate, description);
  },
  async scanDevices(): Promise<unknown[]> {
    return devicesApi.scanDevices(client());
  },
  async connectDevice(deviceId: string): Promise<unknown> {
    return devicesApi.connectDevice(client(), deviceId);
  },
  async getConnectionStatus(): Promise<ConnectionStatus> {
    return devicesApi.getConnectionStatus(client());
  },
  async disconnectDevice(): Promise<unknown> {
    return devicesApi.disconnectDevice(client());
  },
  async sendVideoFrame(blob: Blob, deviceId: string): Promise<void> {
    return devicesApi.sendVideoFrame(client(), blob, deviceId);
  },
  clearTokens(): void {
    client().clearTokens();
  },
};
