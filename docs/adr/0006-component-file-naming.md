# ADR 0006: Component file naming (PascalCase)

## Status

Accepted.

## Context

Documentation and guides referenced a kebab-hybrid pattern (`Login-Form.tsx`, `Logs-Filter.tsx`) while [ADR 0001](./0001-feature-based-folder-structure.md) and the codebase use PascalCase filenames that match exported component names (`LoginForm.tsx`, `LogsFilter.tsx`). The mismatch caused confusion when onboarding contributors and when writing tests or imports.

## Decision

- **Feature and shared UI components** use **PascalCase** filenames aligned with the default export (e.g. `LoginForm.tsx`, `WhitelistTable.tsx`, `StatusChip.tsx`).
- **Do not** use `FeatureName-ComponentName.tsx` kebab-hybrid filenames for React components.
- **Hooks** remain in `src/hooks/` with kebab-case filenames (e.g. `use-auth.ts`), consistent with hook naming conventions.
- **Utilities and API modules** remain kebab-case under `src/lib/` (e.g. `api-client.ts`).

## Consequences

- Imports and file search match React ecosystem norms and ADR 0001.
- Styleguide and contributor docs must use PascalCase examples only.
- Any legacy references to `Login-Form.tsx`-style names in docs or guides are incorrect and should be updated.
