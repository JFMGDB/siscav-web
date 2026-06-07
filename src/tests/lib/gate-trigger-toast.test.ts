import { getAccessLogToast } from "@/lib/gate-trigger-toast";

describe("getAccessLogToast", () => {
  it("returns denied warning without gate_trigger", () => {
    const result = getAccessLogToast("XYZ-9999", "Denied");
    expect(result.severity).toBe("warning");
    expect(result.message).toContain("negado");
  });

  it("returns success when gate acknowledged", () => {
    const result = getAccessLogToast("ABC-1234", "Authorized", {
      integration: "live",
      message: "ok",
      acknowledged: true,
      status: "ok",
    });
    expect(result.severity).toBe("success");
    expect(result.message).toContain("cancela acionada");
  });

  it("returns warning on actuator timeout", () => {
    const result = getAccessLogToast("ABC-1234", "Authorized", {
      integration: "live",
      message: "timeout",
      acknowledged: false,
      status: "error",
      reason: "actuator_timeout",
    });
    expect(result.severity).toBe("warning");
    expect(result.message).toContain("timeout do atuador");
  });

  it("returns info when integration is simulated", () => {
    const result = getAccessLogToast("ABC-1234", "Authorized", {
      integration: "simulated",
      message: "simulated",
      acknowledged: false,
      status: "ok",
    });
    expect(result.severity).toBe("info");
    expect(result.message).toContain("simulado");
  });

  it("returns success toast for ambulance auto-authorize without gate_trigger", () => {
    const result = getAccessLogToast("AMB-0001", "Authorized", null, {
      predicted_category: "ambulance",
      confidence: 0.92,
      model_version: "test",
      classifier_backend: "onnx",
    });
    expect(result.severity).toBe("success");
    expect(result.message).toContain("Ambulância");
  });
});
