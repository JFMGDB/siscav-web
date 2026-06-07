import type { ApiClient } from "./client";
import type {
  AccessLog,
  AccessLogFilters,
  AuthorizedPlate,
  PaginatedResponse,
} from "@/types";
import { API_CONFIG } from "@/constants";
import { getAccessLogImageFileName } from "@/lib/image-url";

export async function createAccessLog(
  client: ApiClient,
  plate: string,
  imageBlob: Blob,
  fileName = "capture.jpg",
): Promise<AccessLog> {
  if (!imageBlob || imageBlob.size === 0) {
    throw new Error(
      "Imagem vazia: capture um frame da câmara ou use a webcam em /camera.",
    );
  }

  return client.requestMultipartJson<AccessLog>(
    `${API_CONFIG.ENDPOINTS.LOGS}/`,
    () => {
      const form = new FormData();
      form.append("file", imageBlob, fileName);
      form.append("plate", plate);
      return form;
    },
    true,
  );
}

export async function fetchAccessLogImage(
  client: ApiClient,
  imageStorageKey: string,
): Promise<Blob> {
  const fileName = getAccessLogImageFileName(imageStorageKey);
  if (!fileName) {
    throw new Error("Chave de imagem inválida.");
  }
  const endpoint = `${API_CONFIG.ENDPOINTS.IMAGES.BASE}/${encodeURIComponent(fileName)}`;
  return client.requestBlob(endpoint);
}

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

export async function whitelistFromDeniedLog(
  client: ApiClient,
  logId: string,
  description?: string,
): Promise<AuthorizedPlate> {
  return client.request<AuthorizedPlate>(
    `${API_CONFIG.ENDPOINTS.LOGS}/${logId}/whitelist`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description ?? null }),
    },
  );
}
