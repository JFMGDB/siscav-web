---
phase: 06-monitor-polling-visibility
plan: 01
subsystem: ui
tags: [react-query, page-visibility, polling]

requires:
  - phase: 05-auth-hook-reliability
    provides: Stable auth bootstrap
provides:
  - Visibility-aware refetchInterval for last capture query
  - refetchOnWindowFocus true on monitor query; resume refetch hidden→visible
affects: [PlateRecognitionDisplay]

tech-stack:
  added: []
  patterns:
    - "useSyncExternalStore for document.visibilityState; refetchRef synced in useEffect for React 19 ref rules"

key-files:
  created: []
  modified:
    - src/hooks/use-monitor-capture.ts

key-decisions:
  - "refetchInterval false when hidden; CAPTURE_INTERVAL when visible"
  - "refetchRef + two useEffects to satisfy eslint (exhaustive-deps + refs)"

patterns-established: []

requirements-completed: [PERF-01]

duration: 25min
completed: 2026-04-05
---

# Phase 6 — Plan 01 Summary

**Last-capture polling pauses when the document is hidden, resumes at `UI_CONFIG.POLLING.CAPTURE_INTERVAL` when visible, refetches once after returning from hidden, and opts into `refetchOnWindowFocus` despite global default false.**

## Accomplishments

- `useSyncExternalStore` subscribes to `visibilitychange`.
- `refetchOnWindowFocus: true` on the `useQuery` for this hook only.

## Deviations from Plan

- Synced `refetchRef.current` in a dedicated `useEffect` to satisfy `react-hooks/refs` (no ref updates during render).

---
*Phase: 06-monitor-polling-visibility · Plan 01*
