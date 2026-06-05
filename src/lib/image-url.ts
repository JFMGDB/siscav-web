/**
 * Centralized helpers for API image URLs.
 * Single place for base URL and path construction; components receive keys and call these helpers.
 */

import { API_CONFIG, getApiBaseUrl } from "@/constants";

/** API stores keys like `uploads/uuid.jpg`; the image route expects the file name only. */
export function getAccessLogImageFileName(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/[/\\]/);
  return parts[parts.length - 1] ?? trimmed;
}

/**
 * Returns the full URL for an access log image given its storage key.
 * Prefer fetchAccessLogImage() with JWT — this URL alone cannot authenticate.
 */
export function getAccessLogImageUrl(key: string): string {
  const fileName = getAccessLogImageFileName(key);
  if (!fileName) return "";
  const base = getApiBaseUrl();
  const path = `${API_CONFIG.ENDPOINTS.IMAGES.BASE}/${encodeURIComponent(fileName)}`;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
