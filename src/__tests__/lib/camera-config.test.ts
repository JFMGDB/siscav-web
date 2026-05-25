import {
  CAMERA_CONFIG_STORAGE_KEY,
  defaultCameraConfig,
  parseCameraConfig,
  resolveNetworkStreamFromConfig,
} from "@/lib/camera/camera-config";

describe("parseCameraConfig", () => {
  it("returns default for null", () => {
    expect(parseCameraConfig(null)).toEqual(defaultCameraConfig());
  });

  it("parses valid v1", () => {
    const raw = JSON.stringify({
      version: 1,
      source: "usb",
      networkUrl: "https://x/y",
      usbDeviceId: "abc",
    });
    expect(parseCameraConfig(raw)).toMatchObject({
      version: 1,
      source: "usb",
      networkUrl: "https://x/y",
      usbDeviceId: "abc",
    });
  });

  it("rejects bad version", () => {
    const raw = JSON.stringify({ version: 2, source: "usb" });
    expect(parseCameraConfig(raw)).toEqual(defaultCameraConfig());
  });
});

describe("resolveNetworkStreamFromConfig", () => {
  it("fails on empty url", () => {
    const r = resolveNetworkStreamFromConfig("", false);
    expect(r.ok).toBe(false);
  });

  it("resolves https when page https", () => {
    const r = resolveNetworkStreamFromConfig("https://cam.example/m.jpg", true);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.isHls).toBe(false);
  });
});

describe("CAMERA_CONFIG_STORAGE_KEY", () => {
  it("is stable", () => {
    expect(CAMERA_CONFIG_STORAGE_KEY).toBe("siscav-web.camera.v1");
  });
});
