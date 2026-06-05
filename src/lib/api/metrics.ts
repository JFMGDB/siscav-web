import type { ApiClient } from "./client";
import type { DashboardDailyMetrics } from "@/types/metrics";
import { API_CONFIG } from "@/constants";

export async function getDailyMetrics(
  client: ApiClient,
  date: string,
): Promise<DashboardDailyMetrics> {
  const params = new URLSearchParams({ date });
  return client.request<DashboardDailyMetrics>(
    `${API_CONFIG.ENDPOINTS.METRICS}?${params}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
}
