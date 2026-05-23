# Phase 5: Auth hook reliability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `05-CONTEXT.md`.

**Date:** 2026-04-04  
**Phase:** 5-auth-hook-reliability  
**Areas discussed:** Bootstrap effect + exhaustive-deps; refresh race + `isLoading`; documentation surface; verification scope  
**Note:** Interactive multi-select for gray areas was skipped; defaults below follow **recommended** options from discuss-phase analysis (AUTH-01, roadmap, `CONCERNS.md`).

---

## Bootstrap `useEffect` and `exhaustive-deps`

| Option | Description | Selected |
|--------|-------------|----------|
| Refactor first | Restructure so lint passes or deps are explicit | ✓ (primary) |
| Mount-only + scoped disable | Keep `[]` with block comment + named rule disable | ✓ (acceptable fallback) |
| Leave as-is | Generic disable without narrative | |

**Captured as:** D-01, D-02 in CONTEXT.md  

---

## Refresh race / `isLoading`

| Option | Description | Selected |
|--------|-------------|----------|
| Fix in phase | Await refresh or explicit bootstrap states before clearing loading | ✓ |
| Document only | Comment without behavior change | |

**Captured as:** D-03, D-04 in CONTEXT.md  

---

## Documentation surface

| Option | Description | Selected |
|--------|-------------|----------|
| Inline only | Comments in `use-auth.tsx` | ✓ (required) |
| Planning pointer | Reference CONCERNS / CONTEXT | ✓ (optional) |
| Standalone ADR | New ADR file | |

**Captured as:** D-05, D-06 in CONTEXT.md  

---

## Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Manual checklist | Per roadmap success criterion 3 | ✓ (required) |
| Add Jest tests | AuthProvider bootstrap | (Claude discretion — D-08) |

**Captured as:** D-07, D-08 in CONTEXT.md  

---

## Claude's Discretion

- Implementation shape for bootstrap state machine and effect splitting (see CONTEXT § Claude's Discretion).

## Deferred Ideas

- Server-side auth hardening, HttpOnly migration, broad ApiClient test suite — out of phase scope.
