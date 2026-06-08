"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { sampleVideoMotion, videoToJpegBlob } from "@/lib/camera/capture-frame";
import type {
  MonitorFrameCaptureFn,
  MonitorMotionSampleFn,
} from "@/contexts/monitor-frame-capture-context";

type Status = "starting" | "live" | "error";

export type UsbMonitorLiveProps = {
  preferredDeviceId?: string;
  minHeight?: number;
  maxVideoHeight?: number;
  borderRadius?: number;
  registerFrameCapture?: (fn: MonitorFrameCaptureFn | null) => void;
  registerMotionSample?: (fn: MonitorMotionSampleFn | null) => void;
};

/**
 * Inicia automaticamente getUserMedia para o monitor, usando deviceId guardado quando ainda válido.
 */
export default function UsbMonitorLive({
  preferredDeviceId,
  minHeight = 360,
  maxVideoHeight = 520,
  borderRadius = 2,
  registerFrameCapture,
  registerMotionSample,
}: UsbMonitorLiveProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const motionSnapshotRef = useRef<Uint8ClampedArray | null>(null);
  const cameraUnsupported =
    typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia;
  const [status, setStatus] = useState<Status>(() =>
    cameraUnsupported ? "error" : "starting",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    cameraUnsupported ? "Este navegador não suporta acesso à câmera." : null,
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) v.srcObject = null;
  }, []);

  useEffect(() => {
    if (cameraUnsupported) return;

    let cancelled = false;

    const start = async () => {
      setStatus("starting");
      setErrorMessage(null);
      stopStream();

      const tryExact = async (id: string) => {
        return navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: id } },
          audio: false,
        });
      };

      const tryDefault = async () => {
        return navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      };

      try {
        let stream: MediaStream;
        if (preferredDeviceId) {
          try {
            stream = await tryExact(preferredDeviceId);
          } catch {
            stream = await tryDefault();
          }
        } else {
          stream = await tryDefault();
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
        setStatus("live");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        if (e instanceof DOMException && e.name === "NotAllowedError") {
          setErrorMessage(
            "Permissão negada para a câmera. Abra Pré-visualização e permita o acesso.",
          );
        } else {
          setErrorMessage("Não foi possível iniciar a câmera USB no monitor.");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [cameraUnsupported, preferredDeviceId, stopStream]);

  useEffect(() => {
    if (!registerFrameCapture) return;
    const fn: MonitorFrameCaptureFn = async () => {
      const v = videoRef.current;
      if (!v?.videoWidth || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
        return null;
      return videoToJpegBlob(v);
    };
    registerFrameCapture(fn);
    return () => registerFrameCapture(null);
  }, [registerFrameCapture, status]);

  useEffect(() => {
    if (!registerMotionSample) return;
    const fn: MonitorMotionSampleFn = () => {
      const v = videoRef.current;
      if (!v?.videoWidth || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
        return 0;
      const { score, snapshot } = sampleVideoMotion(
        v,
        motionSnapshotRef.current,
      );
      motionSnapshotRef.current = snapshot;
      return score;
    };
    registerMotionSample(fn);
    return () => registerMotionSample(null);
  }, [registerMotionSample, status]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight,
        bgcolor: "#0f172a",
        borderRadius,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          maxHeight: maxVideoHeight,
          objectFit: "contain",
        }}
      />
      {status === "starting" && (
        <Typography
          variant="body2"
          sx={{ position: "absolute", color: "rgba(255,255,255,0.7)" }}
        >
          Iniciando câmera…
        </Typography>
      )}
      {status === "error" && errorMessage && (
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            color: "error.light",
            px: 2,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}
