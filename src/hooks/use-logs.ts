"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import * as logsApi from "@/lib/api/logs";
import type { AccessLog, AccessLogFilters, PaginatedResponse } from "@/types";

const QUERY_KEY = ["logs"] as const;

export function useLogs(
  filters: AccessLogFilters = {},
  initialData?: PaginatedResponse<AccessLog>,
) {
  const client = getClientApiClient();

  const query = useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => logsApi.getLogs(client, filters),
    initialData: initialData ?? undefined,
  });

  const items = query.data?.items ?? [];

  return {
    logs: items,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
