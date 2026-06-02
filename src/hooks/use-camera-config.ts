"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CAMERA_CONFIG_STORAGE_KEY,
  type CameraPersistedConfig,
  loadCameraConfig,
  saveCameraConfig,
} from "@/lib/camera/camera-config";

export function useCameraConfig() {
  const [config, setConfigState] = useState<CameraPersistedConfig>(() =>
    loadCameraConfig(),
  );

  const refresh = useCallback(() => {
    setConfigState(loadCameraConfig());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CAMERA_CONFIG_STORAGE_KEY || e.key === null) {
        refresh();
      }
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("mantis-camera-config-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mantis-camera-config-change", onCustom);
    };
  }, [refresh]);

  const setConfig = useCallback((next: CameraPersistedConfig) => {
    saveCameraConfig(next);
    setConfigState(next);
  }, []);

  return { config, setConfig, refresh };
}
