"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import * as metricsApi from "@/lib/api/metrics";

export function useDashboardMetrics(date: string) {
  const client = getClientApiClient();

  return useQuery({
    queryKey: ["dashboard", "metrics", date],
    queryFn: () => metricsApi.getDailyMetrics(client, date),
  });
}
