# Coding Conventions

**Analysis Date:** 2026-04-04

## Naming Patterns

**Files:**
- React feature and UI components: PascalCase — e.g. `Button.tsx`, `LoginForm.tsx`, `GateControl.tsx` under `src/components/`.
- Custom hooks: kebab-case file with `use-` prefix — e.g. `use-snackbar.tsx`, `use-auth.tsx` under `src/hooks/`.
- App Router routes: Next.js conventions — `page.tsx`, `layout.tsx` inside route groups such as `src/app/(auth)/` and `src/app/(public)/`.
- Shared types: split by domain under `src/types/` (`auth.ts`, `logs.ts`, …) with barrel `src/types/index.ts`.
- API modules: lowercase kebab or single name under `src/lib/api/` — e.g. `client.ts`, `auth.ts`, `monitor.ts`.

**Functions:**
- Exported React components: `function ComponentName` or `export default function PageName` for route pages — see `src/components/ui/Button.tsx`, `src/components/features/auth/LoginForm.tsx`.
- Hooks: camelCase with `use` prefix — `useSnackbar`, `useAuth` in `src/hooks/use-snackbar.tsx`, `src/hooks/use-auth.tsx`.

**Variables:**
- camelCase for locals and state — consistent across `src/components/features/auth/LoginForm.tsx` and hooks.

**Types:**
- PascalCase for interfaces and types — e.g. `ButtonProps`, `ApiClientOptions`, `SnackbarContextValue` in `src/components/ui/Button.tsx`, `src/lib/api/client.ts`, `src/hooks/use-snackbar.tsx`.
- Shared domain types live in `src/types/` and are imported via `@/types`.

## Code Style

**Formatting:**
- Prettier — `package.json` scripts `format` / `format:check`; config is `c:\src\personal\siscav-web\.prettierrc` (empty object → Prettier defaults).
- CI enforces `npm run format:check` in `.github/workflows/ci.yml`.

**Linting:**
- ESLint 9 flat config in `eslint.config.mjs`: `eslint-config-next` (core-web-vitals + TypeScript) plus `eslint-config-prettier` to avoid rule clashes with Prettier.
- Run `npm run lint` / `npm run lint:fix` from `package.json`.

**TypeScript:**
- Strict mode enabled — `tsconfig.json` sets `"strict": true`, `"noEmit": true`, JSX `react-jsx`, path alias `"@/*": ["./src/*"]`.

## Import Organization

**Order (typical, not strictly enforced by a plugin):**
1. `'use client'` when required (first line).
2. External packages — e.g. `react`, `next/navigation`, `@mui/material`, `@mui/icons-material`.
3. Aliased app code — `@/hooks/...`, `@/components/...`, `@/lib/...`, `@/types`, `@/constants`.

**Path aliases:**
- Use `@/` for everything under `src/` — e.g. `import { useAuth } from '@/hooks/use-auth'` in `src/components/features/auth/LoginForm.tsx`.

**Barrel files:**
- `src/types/index.ts` re-exports domain modules — prefer `import { X } from '@/types'` for shared types.

## Error Handling

**Patterns:**
- **Invalid hook usage:** throw `new Error('...must be used within a ...Provider')` — see `src/hooks/use-snackbar.tsx`, `src/hooks/use-auth.tsx`.
- **HTTP / API:** `ApiClient` in `src/lib/api/client.ts` throws `new Error(...)` with messages from `parseApiError` or fixed strings (session, refresh). Domain helpers in `src/lib/api/auth.ts` map status codes to `throw new Error(...)`.
- **UI forms:** `try` / `catch` / `finally`, narrow unknown errors with `err instanceof Error` and map to user-facing strings — `src/components/features/auth/LoginForm.tsx`.
- **Auth provider:** log with `console.error`, rethrow after failed `login`/`register` — `src/hooks/use-auth.tsx`; corrupt stored user JSON clears storage and tokens in `catch`.
- **Fire-and-forget or non-critical paths:** empty `catch {}` or `catch` with minimal handling appears in `src/lib/api/monitor.ts`, `src/lib/api/auth.ts`, and some feature components — acceptable for swallowing parse/network noise but hides failures; prefer logging or surfacing when adding features.

## Logging

**Framework:** browser `console` — e.g. `console.error('Login failed', error)` in `src/hooks/use-auth.tsx`.

**Patterns:**
- Use for auth and parse failures where the user is not shown a dedicated UI message yet.

## Comments

**When to Comment:**
- File-level blocks explain purpose and UX/architecture decisions — e.g. `src/components/features/auth/LoginForm.tsx`, `src/lib/api/client.ts`, `src/types/index.ts`.
- Portuguese and English both appear in the repo; new code should match the surrounding file’s language for consistency.

**JSDoc/TSDoc:**
- Occasional block comments on modules; not required on every export. Interface fields sometimes documented in `src/lib/api/client.ts`.

## Function Design

**Size:** Large presentational components exist (e.g. `LoginForm`); prefer extracting subcomponents or hooks when extending.

**Parameters:** Explicit typed props extending MUI where applicable — `ButtonProps extends MuiButtonProps` in `src/components/ui/Button.tsx`.

**Return Values:** Hooks return typed context values; server/layout components return JSX consistent with Next.js App Router.

## Module Design

**Exports:**
- Named exports for shared UI and hooks; `default` for `page.tsx` and some feature entry components (e.g. `LoginForm`).

**Barrel Files:**
- `src/types/index.ts` is the main barrel; `src/lib/api-client.ts` aggregates API surface for backward compatibility — prefer `getClientApiClient()` and `src/lib/api/*` for new code per comment in `src/lib/api-client.ts`.

## Next.js & Client Boundaries

- Mark interactive components with `'use client'` at top — hooks, forms, MUI-heavy trees — see `src/hooks/use-auth.tsx`, `LoginForm.tsx`.
- Root layout stays a Server Component — `src/app/layout.tsx` imports `Providers` from `src/components/providers.tsx` for client-side QueryClient, theme, auth, snackbar.

---

*Convention analysis: 2026-04-04*
