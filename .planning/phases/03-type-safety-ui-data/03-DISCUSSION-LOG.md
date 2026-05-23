# Phase 3: Type safety & UI data - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `03-CONTEXT.md`.

**Date:** 2026-04-05  
**Phase:** 3 — Type safety & UI data  
**Areas discussed:** DataTable typing, LogsTable Select typing, devices API DTOs (requirements-bound capture)

---

## Session shape

| Aspect | Note |
|--------|------|
| Interactive gray-area menu | Not used in this session (single-turn `/gsd-discuss-phase 3`). |
| Basis for decisions | ROADMAP Phase 3 success criteria, REQUIREMENTS TYP-01–TYP-03, `.planning/codebase/CONCERNS.md`, and direct read of `DataTable.tsx`, `LogsTable.tsx`, `devices.ts`, `bluetooth.ts`. |

---

## DataTable (TYP-01)

| Option | Description | Selected |
|--------|-------------|----------|
| A | Tighten `Column.id` to `keyof T` and type `format` / cell read without `any` | ✓ |
| B | Keep loose `string` ids; only replace `any` with `unknown` in `format` | |
| C | Introduce a new table component | | |

**User's choice:** Requirements-bound default — **A** (aligns with success criterion “não depende de `any` … onde é possível expressar generics ou tipos de domínio”).  
**Notes:** Consumers like `LogsTable` already use column ids that match `AccessLog` keys.

---

## LogsTable Select (TYP-02)

| Option | Description | Selected |
|--------|-------------|----------|
| A | MUI `SelectChangeEvent<'ALL' \| 'Authorized' \| 'Denied'>` (or equivalent narrowing) | ✓ |
| B | Controlled wrapper component hiding the cast | |
| C | Enum + string conversion at boundary | | |

**User's choice:** **A** — removes `as any` while staying idiomatic for MUI.

---

## devices.ts DTOs (TYP-03)

| Option | Description | Selected |
|--------|-------------|----------|
| A | Reuse/extend types in `src/types/` (`BluetoothDevice`, new DTOs if JSON differs) | ✓ |
| B | Inline types only inside `devices.ts` | |
| C | Leave `unknown` until OpenAPI client exists | | |

**User's choice:** **A** — satisfies “DTOs alinhados a `src/types/`”. Executor confirms payload shape against API or usage.

---

## Claude's Discretion

- Exact generic shape for `Column<T>` and any minimal exceptions for edge consumers.

## Deferred Ideas

- Table library migration; Web Bluetooth pairing hardening — not Phase 3 (see CONTEXT `<deferred>`).
