# ADR 0005: Centralized status and URL helpers

## Status

Accepted.

## Context

Access status (Authorized/Denied) was displayed in multiple components with duplicated logic (colors, icons, labels). Image URLs for access logs and captures were built inline in several places, leading to inconsistency and magic strings.

## Decision

- **Access status (OCP and DRY):** Implement a single source of truth in `lib/access-status.ts` using typed data dictionaries (`Record<AccessStatus, Config>`) instead of long conditionals. Export pure helpers (e.g. get config, color, icon, text) and a single configuration object. New status values require only adding an entry to the record. A shared **StatusChip** component in `components/ui/StatusChip.tsx` consumes this config and is used everywhere status is displayed (e.g. LogsTable, PlateRecognitionDisplay).
- **Image URLs:** Centralize construction of API image URLs in `lib/image-url.ts` using the base URL from config or environment. Components receive only a key (e.g. `image_storage_key`) and call the helper to get the full URL. The API layer or types can expose this when returning capture/log data so UI does not depend on URL shape.

## Consequences

- One place to change status appearance or add new statuses; StatusChip stays consistent across the app.
- One place to change image URL format or base URL; no scattered string concatenation.
- Pure helpers in `lib/` are easy to unit test; StatusChip is a thin UI wrapper.
