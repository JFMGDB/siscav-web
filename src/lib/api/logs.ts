import type { ApiClient } from "./client";
import type { AccessLog, AccessLogFilters, PaginatedResponse } from "@/types";
import { API_CONFIG } from "@/constants";

function normalizePaginated(
  response: PaginatedResponse<AccessLog> | AccessLog[],
  filters: AccessLogFilters,
): PaginatedResponse<AccessLog> {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      skip: filters.skip ?? 0,
      limit: filters.limit ?? 100,
      has_next: false,
      has_prev: false,
    };
  }
  return response;
}

export async function getLogs(
  client: ApiClient,
  filters: AccessLogFilters = {},
): Promise<PaginatedResponse<AccessLog>> {
  const params = new URLSearchParams();
  if (filters.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters.limit !== undefined)
    params.append("limit", String(filters.limit));
  if (filters.status) params.append("status", filters.status);
  if (filters.plate) params.append("plate", filters.plate);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  const qs = params.toString();
  const endpoint = qs
    ? `${API_CONFIG.ENDPOINTS.LOGS}?${qs}`
    : API_CONFIG.ENDPOINTS.LOGS;
  const res = await client.request<PaginatedResponse<AccessLog> | AccessLog[]>(
    endpoint,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  return normalizePaginated(res, filters);
}
