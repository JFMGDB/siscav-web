/** Connection status from the devices REST API. */

export interface ConnectionStatus {
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
  connectedAt?: string;
  error?: string;
}
