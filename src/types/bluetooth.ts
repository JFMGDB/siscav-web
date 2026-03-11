/**
 * Tipos relacionados ao gerenciamento de dispositivos Bluetooth
 */

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string; // MAC address
  rssi?: number; // Signal strength
  paired: boolean;
  connected: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
  connectedAt?: string;
  error?: string;
}










