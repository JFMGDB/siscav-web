/**
 * Unit tests for access status helpers (lib/access-status.ts).
 * Uses AccessStatus 'Authorized' | 'Denied'; unknown values get default config.
 */

import {
  getAccessStatusConfig,
  getAccessStatusColor,
  getAccessStatusIconKey,
  getAccessStatusText,
} from "@/lib/access-status";

describe("access-status", () => {
  describe("getAccessStatusConfig", () => {
    it("returns correct config for Authorized", () => {
      const config = getAccessStatusConfig("Authorized");
      expect(config.color).toBe("success");
      expect(config.text).toBe("Autorizado");
      expect(config.icon).toBe("CheckCircle");
    });

    it("returns correct config for Denied", () => {
      const config = getAccessStatusConfig("Denied");
      expect(config.color).toBe("error");
      expect(config.text).toBe("Negado");
      expect(config.icon).toBe("Cancel");
    });

    it("returns default config for unknown status", () => {
      const config = getAccessStatusConfig("UNKNOWN");
      expect(config.color).toBe("default");
      expect(config.text).toBe("Desconhecido");
      expect(config.icon).toBe("HelpOutline");
    });

    it("returns default config for invalid status", () => {
      const config = getAccessStatusConfig("INVALID_STATUS");
      expect(config.color).toBe("default");
      expect(config.text).toBe("Desconhecido");
      expect(config.icon).toBe("HelpOutline");
    });
  });

  describe("getAccessStatusColor", () => {
    it("returns color for each valid status", () => {
      expect(getAccessStatusColor("Authorized")).toBe("success");
      expect(getAccessStatusColor("Denied")).toBe("error");
    });

    it("returns default for unknown status", () => {
      expect(getAccessStatusColor("UNKNOWN")).toBe("default");
    });
  });

  describe("getAccessStatusIconKey", () => {
    it("returns icon key for Authorized and Denied", () => {
      expect(getAccessStatusIconKey("Authorized")).toBe("CheckCircle");
      expect(getAccessStatusIconKey("Denied")).toBe("Cancel");
    });

    it("returns HelpOutline for unknown status", () => {
      expect(getAccessStatusIconKey("INVALID")).toBe("HelpOutline");
    });
  });

  describe("getAccessStatusText", () => {
    it("returns Portuguese text for valid status", () => {
      expect(getAccessStatusText("Authorized")).toBe("Autorizado");
      expect(getAccessStatusText("Denied")).toBe("Negado");
    });

    it("returns Desconhecido for unknown status", () => {
      expect(getAccessStatusText("UNKNOWN")).toBe("Desconhecido");
    });

    it("returns status string for invalid status", () => {
      expect(getAccessStatusText("INVALID_STATUS")).toBe("Desconhecido");
    });
  });
});
