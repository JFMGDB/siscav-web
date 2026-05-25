import type { ApiClient } from "./client";
import type { DeviceOperationAck } from "@/types";
import { API_CONFIG } from "@/constants";

export async function connectDevice(
  client: ApiClient,
  deviceId: string,
): Promise<DeviceOperationAck> {
  return client.request<DeviceOperationAck>(
    API_CONFIG.ENDPOINTS.DEVICES.CONNECT,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId }),
    },
  );
}

export async function disconnectDevice(
  client: ApiClient,
): Promise<DeviceOperationAck> {
  return client.request<DeviceOperationAck>(
    API_CONFIG.ENDPOINTS.DEVICES.DISCONNECT,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
}
