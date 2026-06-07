/**
 * Tipos relacionados aos logs de acesso
 */

import { AccessStatus } from "./common";
import type { GateTriggerResponse } from "./gate";
import type { VehicleClassificationResult } from "./ml";

export interface AccessLog {
  id: string;
  timestamp: string;
  plate_string_detected: string;
  status: AccessStatus;
  image_storage_key: string;
  authorized_plate_id?: string;
  is_automatic?: boolean;
  ocr_success?: boolean;
  gate_trigger?: GateTriggerResponse | null;
  vehicle_classification?: VehicleClassificationResult | null;
}

export interface AccessLogFilters {
  skip?: number;
  limit?: number;
  status?: AccessStatus;
  plate?: string;
  start_date?: string; // ISO 8601 format
  end_date?: string; // ISO 8601 format
}
