/**
 * Tipos da API REST de dispositivos (siscav-api).
 * Device scan/connect payloads from the REST API.
 */

/** Item devolvido por GET .../devices/scan (lista de dispositivos descobertos). */
export interface DeviceScanItem {
  id: string;
  name: string;
  address?: string;
  rssi?: number;
  paired?: boolean;
  connected?: boolean;
}

/**
 * Corpo de resposta de POST connect/disconnect quando o cliente não usa campos.
 * Ajustar campos quando o contrato OpenAPI estiver disponível.
 */
export interface DeviceOperationAck {
  status?: string;
  message?: string;
}
