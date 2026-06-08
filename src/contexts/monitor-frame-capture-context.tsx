"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";

export type MonitorFrameCaptureFn = () => Promise<Blob | null>;
export type MonitorMotionSampleFn = () => number;

type MonitorFrameCaptureContextValue = {
  registerFrameCapture: (fn: MonitorFrameCaptureFn | null) => void;
  registerMotionSample: (fn: MonitorMotionSampleFn | null) => void;
  captureFrame: () => Promise<Blob | null>;
  sampleMotion: () => number;
  tryBeginOcr: () => boolean;
  endOcr: () => void;
};

const MonitorFrameCaptureContext =
  createContext<MonitorFrameCaptureContextValue | null>(null);

export function MonitorFrameCaptureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handlerRef = useRef<MonitorFrameCaptureFn | null>(null);
  const motionRef = useRef<MonitorMotionSampleFn | null>(null);
  const ocrInFlightRef = useRef(false);

  const registerFrameCapture = useCallback(
    (fn: MonitorFrameCaptureFn | null) => {
      handlerRef.current = fn;
    },
    [],
  );

  const registerMotionSample = useCallback(
    (fn: MonitorMotionSampleFn | null) => {
      motionRef.current = fn;
    },
    [],
  );

  const captureFrame = useCallback(async () => {
    if (!handlerRef.current) return null;
    return handlerRef.current();
  }, []);

  const sampleMotion = useCallback(() => {
    if (!motionRef.current) return 0;
    return motionRef.current();
  }, []);

  const tryBeginOcr = useCallback(() => {
    if (ocrInFlightRef.current) return false;
    ocrInFlightRef.current = true;
    return true;
  }, []);

  const endOcr = useCallback(() => {
    ocrInFlightRef.current = false;
  }, []);

  const value = React.useMemo(
    () => ({
      registerFrameCapture,
      registerMotionSample,
      captureFrame,
      sampleMotion,
      tryBeginOcr,
      endOcr,
    }),
    [
      registerFrameCapture,
      registerMotionSample,
      captureFrame,
      sampleMotion,
      tryBeginOcr,
      endOcr,
    ],
  );

  return (
    <MonitorFrameCaptureContext.Provider value={value}>
      {children}
    </MonitorFrameCaptureContext.Provider>
  );
}

export function useMonitorFrameCapture(): MonitorFrameCaptureContextValue {
  const ctx = useContext(MonitorFrameCaptureContext);
  if (!ctx) {
    throw new Error(
      "useMonitorFrameCapture must be used within MonitorFrameCaptureProvider",
    );
  }
  return ctx;
}
