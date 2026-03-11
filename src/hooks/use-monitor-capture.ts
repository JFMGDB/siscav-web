'use client';

import { useQuery } from '@tanstack/react-query';
import { getClientApiClient } from '@/lib/api/client';
import * as monitorApi from '@/lib/api/monitor';
import type { Capture } from '@/types';
import { UI_CONFIG } from '@/constants';

const QUERY_KEY = ['monitor', 'lastCapture'] as const;

export function useMonitorCapture() {
  const client = getClientApiClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => monitorApi.getLastCapture(client),
    refetchInterval: UI_CONFIG.POLLING.CAPTURE_INTERVAL,
  });

  return {
    capture: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
