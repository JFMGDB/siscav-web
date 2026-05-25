"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";

export type MonitorFrameCaptureFn = () => Promise<Blob | null>;

type MonitorFrameCaptureContextValue = {
  registerFrameCapture: (fn: MonitorFrameCaptureFn | null) => void;
  captureFrame: () => Promise<Blob | null>;
};

const MonitorFrameCaptureContext =
  createContext<MonitorFrameCaptureContextValue | null>(null);

export function MonitorFrameCaptureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handlerRef = useRef<MonitorFrameCaptureFn | null>(null);

  const registerFrameCapture = useCallback(
    (fn: MonitorFrameCaptureFn | null) => {
      handlerRef.current = fn;
    },
    [],
  );

  const captureFrame = useCallback(async () => {
    if (!handlerRef.current) return null;
    return handlerRef.current();
  }, []);

  const value = React.useMemo(
    () => ({ registerFrameCapture, captureFrame }),
    [registerFrameCapture, captureFrame],
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
