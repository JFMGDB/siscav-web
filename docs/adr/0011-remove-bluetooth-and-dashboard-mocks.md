# ADR 0011: Remove Bluetooth UI and Dashboard Mocks

## Status

Accepted.

## Context

Settings included a Web Bluetooth device manager backed by demo `/api/v1/devices/*` routes. The dashboard showed static metrics (authorized count, daily access, success rate, trends) with no real API aggregates. Camera capture already uses USB or network URL configuration in the browser; access logs use REST ingest.

## Decision

- Remove `BluetoothDeviceManager`, device API client, Bluetooth/Web Bluetooth types, and related constants/messages.
- Simplify Settings to camera configuration only (USB/network), linking to the preview page.
- Remove all hardcoded `StatCard` metrics from the dashboard; keep `GateControl` as the primary panel action.
- Do not add dashboard stats hooks or new API endpoints until list endpoints expose reliable totals.

## Consequences

- Smaller client bundle; no dependency on removed backend routes.
- Dashboard is action-focused until metrics APIs exist.
- `StatCard` remains in the UI library for future use.

## Related

- API ADR 006: removal of `/api/v1/devices/*` and `IOT_DEVICE_DEMO_API`.
