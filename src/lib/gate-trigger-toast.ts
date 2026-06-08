import type { GateTriggerResponse, VehicleClassificationResult } from "@/types";
import { MESSAGES } from "@/constants";

const REASON_LABELS: Record<string, string> = {
  actuator_timeout: "timeout do atuador",
  connection_refused: "conexão recusada",
  actuator_http_error: "erro HTTP do atuador",
  actuator_network_error: "falha de rede",
};

export function getAccessLogToast(
  plate: string,
  status: "Authorized" | "Denied",
  gateTrigger?: GateTriggerResponse | null,
  vehicleClassification?: VehicleClassificationResult | null,
): { message: string; severity: "success" | "warning" | "info" } {
  const statusLabel = status === "Authorized" ? "autorizado" : "negado";

  const isAmbulanceAuthorized =
    status === "Authorized" &&
    vehicleClassification?.predicted_category === "ambulance";

  if (isAmbulanceAuthorized) {
    if (gateTrigger?.status === "error") {
      const reasonKey = gateTrigger.reason ?? "actuator_network_error";
      const reasonLabel = REASON_LABELS[reasonKey] ?? reasonKey;
      return {
        message: `${MESSAGES.GATE.AMBULANCE_AUTO_AUTHORIZED} ${MESSAGES.GATE.AUTO_OPEN_HARDWARE_ERROR.replace("{reason}", reasonLabel)}`,
        severity: "warning",
      };
    }
    return {
      message: MESSAGES.GATE.AMBULANCE_AUTO_AUTHORIZED,
      severity: "success",
    };
  }

  if (status === "Denied" || !gateTrigger) {
    return {
      message: `Tentativa registrada: ${plate} (${statusLabel}).`,
      severity: status === "Authorized" ? "success" : "warning",
    };
  }

  if (gateTrigger.acknowledged) {
    return {
      message: `${MESSAGES.GATE.AUTO_OPEN_SUCCESS} Placa ${plate}.`,
      severity: "success",
    };
  }

  if (gateTrigger.integration === "simulated") {
    return {
      message: `${MESSAGES.GATE.AUTO_OPEN_SIMULATED} Placa ${plate}.`,
      severity: "info",
    };
  }

  if (gateTrigger.status === "error") {
    const reasonKey = gateTrigger.reason ?? "actuator_network_error";
    const reasonLabel = REASON_LABELS[reasonKey] ?? reasonKey;
    return {
      message: MESSAGES.GATE.AUTO_OPEN_HARDWARE_ERROR.replace(
        "{reason}",
        reasonLabel,
      ),
      severity: "warning",
    };
  }

  return {
    message: `Tentativa registrada: ${plate} (${statusLabel}).`,
    severity: "success",
  };
}
