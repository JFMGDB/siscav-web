# Phase 6: Monitor polling & visibility - Discussion Log

> **Audit trail only.** Decisions are in `06-CONTEXT.md`.

**Date:** 2026-04-05  
**Phase:** 6-monitor-polling-visibility  
**Note:** Interactive multi-select was skipped; defaults below implement **PERF-01** and roadmap success criteria.

---

## Background polling strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Full pause while hidden | `refetchInterval` off when `visibilityState === 'hidden'` | ✓ |
| Reduced interval | e.g. 30s while hidden | |

**Captured as:** D-01, D-02  

---

## Resume when tab visible

| Option | Description | Selected |
|--------|-------------|----------|
| Refetch on visible | One refetch on `hidden` → `visible` | ✓ |
| Interval only | Wait for next 3s tick | |

**Captured as:** D-03  

---

## Implementation placement

| Option | Description | Selected |
|--------|-------------|----------|
| Hook only | `use-monitor-capture.ts` | ✓ |
| Page + hook | Extra wiring on monitor page | |

**Captured as:** D-04  

---

## Query scope

| Option | Description | Selected |
|--------|-------------|----------|
| lastCapture only | Key `['monitor','lastCapture']` | ✓ |
| All monitor queries | — | |

**Captured as:** D-05  

---

## Deferred ideas

- Global query defaults, WebSocket capture — out of phase.
