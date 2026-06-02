import { validateCameraPreviewUrl } from "@/lib/camera/validate-camera-url";

export const CAMERA_CONFIG_STORAGE_KEY = "mantis-web.camera.v1";

export type CameraSource = "usb" | "network";

export interface CameraPersistedConfig {
  version: 1;
  source: CameraSource;
  /** URL guardada para modo rede (pode estar vazia). */
  networkUrl: string;
  /** deviceId USB preferido (pode deixar de ser válido entre sessões). */
  usbDeviceId: string;
}

export const defaultCameraConfig = (): CameraPersistedConfig => ({
  version: 1,
  source: "network",
  networkUrl: "",
  usbDeviceId: "",
});

export function parseCameraConfig(raw: string | null): CameraPersistedConfig {
  if (!raw) return defaultCameraConfig();
  try {
    const v = JSON.parse(raw) as Partial<CameraPersistedConfig>;
    if (v.version !== 1 || (v.source !== "usb" && v.source !== "network")) {
      return defaultCameraConfig();
    }
    return {
      version: 1,
      source: v.source,
      networkUrl: typeof v.networkUrl === "string" ? v.networkUrl : "",
      usbDeviceId: typeof v.usbDeviceId === "string" ? v.usbDeviceId : "",
    };
  } catch {
    return defaultCameraConfig();
  }
}

export function loadCameraConfig(): CameraPersistedConfig {
  if (typeof window === "undefined") return defaultCameraConfig();
  return parseCameraConfig(
    window.localStorage.getItem(CAMERA_CONFIG_STORAGE_KEY),
  );
}

export function saveCameraConfig(config: CameraPersistedConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CAMERA_CONFIG_STORAGE_KEY,
    JSON.stringify(config),
  );
  window.dispatchEvent(new Event("mantis-camera-config-change"));
}

/** Valida URL guardada no contexto da página actual (mixed content). */
export function resolveNetworkStreamFromConfig(
  networkUrl: string,
  pageIsHttps: boolean,
): { ok: true; href: string; isHls: boolean } | { ok: false; message: string } {
  const trimmed = networkUrl.trim();
  if (!trimmed) {
    return { ok: false, message: "URL não configurada." };
  }
  const result = validateCameraPreviewUrl(trimmed, { pageIsHttps });
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return { ok: true, href: result.href, isHls: result.isHls };
}
