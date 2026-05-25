import type { ApiClient } from './client';
import type { Capture } from '@/types';
import { getLogs } from './logs';
import { addPlate } from './whitelist';
import { getAccessLogImageUrl } from '@/lib/image-url';

export async function getLastCapture(client: ApiClient): Promise<Capture | null> {
  const response = await getLogs(client, { skip: 0, limit: 1 });
  if (response.items.length === 0) return null;
  const log = response.items[0];
  const imageUrl = log.image_storage_key ? getAccessLogImageUrl(log.image_storage_key) : '';
  return {
    id: log.id,
    plate: log.plate_string_detected,
    status: log.status,
    timestamp: log.timestamp,
    imageUrl,
  };
}

export async function registerUnknownPlate(
  client: ApiClient,
  plate: string,
  description: string
): Promise<void> {
  await addPlate(client, plate, description);
}
