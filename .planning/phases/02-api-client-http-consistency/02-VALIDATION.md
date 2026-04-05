---
phase: 02
slug: 02-api-client-http-consistency
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-05
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x (jsdom) |
| **Config file** | `jest.config.mjs`, `jest.setup.mjs` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run build` then `npm test` |
| **Estimated runtime** | ~1–3 minutes |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (or `npm run build` when only types/build affected)
- **After every plan wave:** Run `npm run build` and `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | API-01 | build | `npm run build` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | API-01 | unit | `npm test` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | API-02 | build | `npm run build` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | API-02 | unit | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing Jest + Next.js setup covers this phase; no Wave 0 stub files required.

- [x] *Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

*All phase behaviors targeted by these plans have automated verification via build + Jest; cookie/browser edge cases are covered by unit tests where present.*

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| — | — | — | — |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [ ] Feedback latency < 180s (confirm during execution)
- [ ] `nyquist_compliant: true` set in frontmatter after phase complete

**Approval:** pending
