"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import * as monitorApi from "@/lib/api/monitor";
import { UI_CONFIG } from "@/constants";

const QUERY_KEY = ["monitor", "lastCapture"] as const;

function subscribeVisibility(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function getVisibilitySnapshot() {
  return document.visibilityState;
}

function getVisibilityServerSnapshot(): DocumentVisibilityState {
  return "visible";
}

export function useMonitorCapture() {
  const client = getClientApiClient();
  const visibilityState = useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot,
  );
  const isVisible = visibilityState === "visible";
  const wasHiddenRef = useRef(false);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => monitorApi.getLastCapture(client),
    refetchInterval: isVisible ? UI_CONFIG.POLLING.CAPTURE_INTERVAL : false,
    refetchOnWindowFocus: true,
  });

  const refetchRef = useRef(query.refetch);
  useEffect(() => {
    refetchRef.current = query.refetch;
  }, [query.refetch]);

  useEffect(() => {
    if (!isVisible) {
      wasHiddenRef.current = true;
      return;
    }
    if (wasHiddenRef.current) {
      wasHiddenRef.current = false;
      void refetchRef.current();
    }
  }, [isVisible]);

  return {
    capture: query.data ?? null,
    loading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
