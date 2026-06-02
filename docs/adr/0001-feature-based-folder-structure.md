# ADR 0001: Feature-based folder structure

## Status

Accepted.

## Context

The Mantis frontend had grown with mixed naming (hyphenated vs PascalCase component files), shared and feature code interleaved, and no clear convention for where to place new code. This made navigation and onboarding harder and increased the risk of inconsistent patterns.

## Decision

- **App routes only under `app/`:** Next.js App Router structure is kept; no business logic or heavy components live directly in route files beyond composition and initial data passing.
- **Shared UI in `components/ui/`:** Reusable primitives (Button, Card, DataTable, Sidebar, StatCard, StatusChip) live under `src/components/ui/` with PascalCase file names.
- **Features under `components/features/<feature>/`:** One folder per domain (auth, gate, logs, monitor, settings, whitelist). Each contains only components (and optionally sub-components) for that feature. File names use **PascalCase** (e.g. `LoginForm.tsx`, `LogsTable.tsx`, `WhitelistTable.tsx`) to match the exported component name.
- **Supporting layers:** `lib/` for API and pure utilities, `hooks/` for client hooks, `types/` and `constants/` at `src/` root. No feature-specific code in these unless it is a shared abstraction.

## Consequences

- New features get a single place under `components/features/<name>/`.
- Naming is predictable: one PascalCase file per main component, easy to find and import.
- Clear separation between shared UI and feature-specific UI; refactors of shared components stay localized to `components/ui/`.
