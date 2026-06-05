export type GateIntegration = "simulated" | "live";

export type GateTriggerReason =
  | "actuator_timeout"
  | "connection_refused"
  | "actuator_http_error"
  | "actuator_network_error";

export type GateTriggerStatus = "ok" | "error";

export interface GateTriggerResponse {
  integration: GateIntegration;
  message: string;
  acknowledged: boolean;
  downstream_status_code?: number | null;
  status?: GateTriggerStatus | null;
  reason?: GateTriggerReason | null;
}
