# Phase 4: Monitor UX & capture truthfulness - Discussion Log

> **Audit trail only.** Decisions live in `04-CONTEXT.md`.

**Date:** 2026-04-05  
**Phase:** 4 — Monitor UX & capture truthfulness  
**Areas discussed:** Error vs empty UX, confidence sourcing (requirements-bound capture)

---

## Session shape

| Aspect | Note |
|--------|------|
| Interactive gray-area menu | Not used — single-turn `/gsd-discuss-phase 4`. |
| Basis | ROADMAP Phase 4, REQUIREMENTS MON-01/MON-02, `CONCERNS.md`, `monitor.ts`, `PlateRecognitionDisplay.tsx`, `use-monitor-capture.ts`, `Capture` / `AccessLog` types. |

---

## Error vs. empty vs. loading (MON-01)

| Option | Description | Selected |
|--------|-------------|----------|
| A | Stop swallowing errors in `getLastCapture`; use React Query `error` + distinct UI states | ✓ |
| B | Return discriminated union from `getLastCapture` instead of Query error | |
| C | Only improve copy without changing error propagation | |

**Choice:** **A** — minimal change, aligns with existing hook surface.

---

## Confidence display (MON-02)

| Option | Description | Selected |
|--------|-------------|----------|
| A | Optional `confidence` on `Capture`; hide UI when absent; remove `0.95` hack | ✓ |
| B | Show “N/D” when missing | |
| C | Keep numeric default in UI | |

**Choice:** **A** — matches requirement “não inventado”.

---

## Deferred

- Tab visibility polling — Phase 6 (PERF-01).
- Backend `confidence` field — extend types when API provides it.
