---
phase: 04-monitor-ux-capture-truthfulness
status: complete
updated: 2026-04-05
---

# Phase 4 — Technical research (concise)

## Scope

Truthful last-capture data path (`getLastCapture`) and monitor UI states (MON-01/MON-02). Stack: TanStack Query **v5.90**, MUI 7.

## Findings

### Error propagation

- `queryFn` that throws marks the query **error**; `null` return is **success with empty data**. Removing `try/catch` that maps all failures to `null` is the minimal fix for MON-01.
- `getLogs` failures should surface as query errors, not as `null`.

### Confidence

- `AccessLog` has no `confidence` today. `Capture.confidence` becomes optional; object literal omits the property when absent (no `?? 0.95`).

### React Query surface

- Hook should expose `isError` (and optionally `isFetching`) so the UI can branch without inferring only from `error != null`.

## Validation Architecture

| Layer | Command |
|-------|---------|
| Typecheck / Next | `npm run build` |
| Regression | `npm test` |
| Manual | Smoke monitor page after implementation (optional UAT note) |

Executor runs from repository root.

## RESEARCH COMPLETE
