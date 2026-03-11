/**
 * Centralized helpers for API image URLs.
 * Single place for base URL and path construction; components receive keys and call these helpers.
 */

import { API_CONFIG } from '@/constants';

/**
 * Returns the full URL for an access log image given its storage key.
 * Used for log thumbnails and capture images served at /api/v1/access_logs/images/{key}.
 */
export function getAccessLogImageUrl(key: string): string {
  if (!key) return '';
  const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const path = `${API_CONFIG.ENDPOINTS.IMAGES.BASE}/${encodeURIComponent(key)}`;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
