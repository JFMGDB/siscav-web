---
phase: 04-monitor-ux-capture-truthfulness
plan: 01
subsystem: api
tags: [typescript, monitor, react-query]

requires:
  - phase: 03-type-safety-ui-data
    provides: Typed API and UI data patterns
provides:
  - Truthful getLastCapture (errors propagate; null only for empty logs)
  - Optional Capture.confidence without fabricated default
affects: [04-monitor-ux-capture-truthfulness]

tech-stack:
  added: []
  patterns:
    - "API helpers return null only for empty success, not for transport failures"

key-files:
  created: []
  modified:
    - src/types/monitor.ts
    - src/lib/api/monitor.ts

key-decisions:
  - "Omit confidence from mapped Capture until backend exposes a real field"

patterns-established: []

requirements-completed: [MON-01, MON-02]

duration: 15min
completed: 2026-04-04
---

# Phase 4 — Plan 01 Summary

**`getLastCapture` now surfaces `getLogs` failures to TanStack Query; `Capture.confidence` is optional and no longer hardcoded to 0.95.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Removed try/catch that masked errors as `null`.
- Dropped fabricated `confidence: 0.95` from the mapped object.

## Task Commits

1. **Task 1: Capture type + getLastCapture truthful mapping** — (see repo commit after squash)

## Files Created/Modified

- `src/types/monitor.ts` — `confidence?: number`
- `src/lib/api/monitor.ts` — direct `getLogs` await; `null` only when `items.length === 0`

## Decisions Made

None beyond the plan — omit `confidence` when not provided by the API.

## Deviations from Plan

None.

## Issues Encountered

None.

## Next Phase Readiness

Plan 04-02 can wire UI branches on query error vs empty success.

---
*Phase: 04-monitor-ux-capture-truthfulness · Plan 01*
