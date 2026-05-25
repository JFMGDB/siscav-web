# Architecture

**Analysis Date:** 2026-04-04

## Pattern Overview

**Overall:** Single-page application built on the Next.js App Router with a **backend-for-frontend style** boundary: the UI talks to an external REST API only; there are no `route.ts` API handlers in this repo for domain logic.

**Key Characteristics:**

- **App Router** with **route groups** `(public)` and `(auth)` to separate unauthenticated and authenticated shells without affecting URLs.
- **Client-first UI:** Most feature pages and the authenticated layout are Client Components (`'use client'`), while the root layout and a few pages (e.g. login shell) remain Server Components where metadata is set.
- **Layered access to HTTP:** A shared `ApiClient` class (`src/lib/api/client.ts`) centralizes auth headers, token refresh, and JSON parsing; thin domain modules in `src/lib/api/*.ts` expose functions that accept an `ApiClient` instance.
- **Facade for legacy call sites:** `src/lib/api-client.ts` exposes a single `apiClient` object that delegates to `getClientApiClient()` and the domain modules—used heavily by `src/hooks/use-auth.tsx`.

## Layers

**Presentation (routes and composition):**

- Purpose: URL mapping, layout hierarchy, page-level composition.
- Location: `src/app/`
- Contains: `layout.tsx`, `page.tsx`, route-group layouts.
- Depends on: `@/components/*`, `@/hooks/*`, Next.js navigation and metadata APIs.
- Used by: Browser navigation to `/`, `/login`, `/dashboard`, `/monitor`, `/whitelist`, `/logs`, `/settings`.

**Feature UI:**

- Purpose: Screens and domain-specific widgets (forms, tables, gate control, camera UI).
- Location: `src/components/features/*`
- Contains: React components colocated by domain (`auth`, `gate`, `logs`, `monitor`, `settings`, `whitelist`).
- Depends on: `@/components/ui/*`, MUI, hooks, `apiClient` or `getClientApiClient()` + domain API functions.
- Used by: App Router pages under `src/app/(auth)/*/page.tsx` and `src/app/(public)/login/page.tsx`.

**Shared UI primitives:**

- Purpose: Reusable layout and display building blocks (sidebar, tables, cards, buttons).
- Location: `src/components/ui/`
- Contains: `Sidebar.tsx`, `DataTable.tsx`, `StatCard.tsx`, etc.
- Depends on: MUI, `useAuth`, `ROUTES` from `@/constants`.
- Used by: Feature components and `src/app/(auth)/layout.tsx`.

**Cross-cutting providers:**

- Purpose: Global React context, server/client theming bridge, async data defaults.
- Location: `src/components/providers.tsx`
- Contains: `QueryClientProvider`, MUI `ThemeProvider` + `AppRouterCacheProvider`, `AuthProvider`, `SnackbarProvider`.
- Depends on: `@tanstack/react-query`, `@mui/material-nextjs`, `@/theme`, `@/hooks/use-auth`, `@/hooks/use-snackbar`.
- Used by: `src/app/layout.tsx` wrapping all children.

**Application hooks:**

- Purpose: Auth state, TanStack Query data fetching, snackbars, monitor/whitelist helpers.
- Location: `src/hooks/`
- Contains: `use-auth.tsx` (context + provider), `use-logs.ts`, `use-whitelist.ts`, `use-monitor-capture.ts`, `use-snackbar.tsx`.
- Depends on: `apiClient` or `getClientApiClient()` + `src/lib/api/*`, `@tanstack/react-query`.
- Used by: Layouts, feature components, and pages.

**API and HTTP:**

- Purpose: Typed calls to the external backend; token lifecycle (cookies + refresh).
- Location: `src/lib/api/client.ts` (core), `src/lib/api/{auth,whitelist,logs,gate,monitor,devices}.ts` (domains), `src/lib/api-client.ts` (facade).
- Contains: `ApiClient`, `getClientApiClient()`, `getServerApiClient()`, `parseApiError`, domain `login`, `getLogs`, etc.
- Depends on: `API_CONFIG`, `AUTH_CONFIG` from `@/constants`; `next/headers` only in server factory paths.
- Used by: Hooks, `apiClient` facade, and any code that obtains a client instance.

**Pure utilities:**

- Purpose: Helpers with no React dependency (e.g. image URL building, access status logic).
- Location: `src/lib/access-status.ts`, `src/lib/image-url.ts`
- Used by: Components and tests under `src/__tests__/`.

**Types and configuration:**

- Purpose: Shared TypeScript models and app-wide constants (routes, messages, API paths).
- Location: `src/types/` (barrel: `src/types/index.ts`), `src/constants/index.ts`
- Used by: API layer, hooks, and components.

**Theming:**

- Purpose: MUI theme (palette, typography, component overrides).
- Location: `src/theme/index.ts`
- Used by: `src/components/providers.tsx`.

## Data Flow

**Authenticated page load:**

1. `src/app/layout.tsx` renders `Providers`, which mount `AuthProvider` and React Query.
2. `AuthProvider` (`src/hooks/use-auth.tsx`) reads cookies via `apiClient.getAccessToken()` / refresh handling and hydrates `user` from `localStorage` key `AUTH_CONFIG.USER_KEY` when tokens exist.
3. `src/app/(auth)/layout.tsx` calls `useAuth()`; if no user after load, it redirects to `/login` via `next/navigation`; otherwise it wraps children in `Sidebar`.

**API call (client, recommended pattern for new code):**

1. Caller obtains `getClientApiClient()` from `src/lib/api/client.ts` (singleton with cookie read/write).
2. Domain function in `src/lib/api/<domain>.ts` invokes `client.request()` or `fetch` (auth registration uses raw `fetch` against `API_CONFIG.BASE_URL`).
3. On 401/403, `ApiClient.request` attempts refresh via `API_CONFIG.ENDPOINTS.AUTH.REFRESH`, then retries; failures clear tokens via configured callbacks.

**List/query data (example: logs):**

1. `useLogs` in `src/hooks/use-logs.ts` builds a `queryKey` and calls `logsApi.getLogs(client, filters)` inside `useQuery`.
2. UI components consume `{ logs, loading, error, refetch }` from the hook.

**State Management:**

- **Server state:** TanStack React Query (`staleTime` 60s, `refetchOnWindowFocus: false` defaults in `src/components/providers.tsx`).
- **Auth session:** React Context in `use-auth.tsx` plus cookies (tokens) and `localStorage` (user profile JSON).

## Key Abstractions

**`ApiClient`:**

- Purpose: Injectable HTTP client with `getToken`, optional cookie persistence, and refresh coordination.
- Examples: `src/lib/api/client.ts`
- Pattern: Class with `request<T>()`, `refreshTokens()`, factories `getClientApiClient()` / `getServerApiClient()` / `createServerApiClient()`.

**Domain API modules:**

- Purpose: One file per backend area; functions take `ApiClient` as first argument (except `register`, which uses standalone `fetch`).
- Examples: `src/lib/api/auth.ts`, `src/lib/api/logs.ts`, `src/lib/api/gate.ts`

**`apiClient` facade:**

- Purpose: Stable object API for existing consumers (`login`, `getWhitelist`, `openGate`, etc.).
- Examples: `src/lib/api-client.ts`

## Entry Points

**Next.js application bootstrap:**

- Location: `src/app/layout.tsx`
- Triggers: Every document request.
- Responsibilities: HTML shell, font (`next/font/google`), global CSS import, metadata, wraps tree with `Providers`.

**Default route:**

- Location: `src/app/page.tsx`
- Triggers: Visit `/`
- Responsibilities: `redirect('/dashboard')` (authenticated area still gated by `(auth)` layout).

**Public login:**

- Location: `src/app/(public)/login/page.tsx`
- Triggers: `/login`
- Responsibilities: Renders `LoginForm` from `src/components/features/auth/LoginForm.tsx`; exports page `metadata`.

## Error Handling

**Strategy:** Fail fast with `Error` instances carrying user-facing messages parsed from API responses where possible.

**Patterns:**

- `parseApiError` in `src/lib/api/client.ts` reads response body and prefers `detail` or `message` from JSON.
- Domain modules (e.g. `src/lib/api/auth.ts`) map status codes (401, 409, 429) to specific thrown messages.
- `ApiClient.request` throws on non-OK responses after refresh retry; callers use `try/catch` or React Query `error` state.

## Cross-Cutting Concerns

**Logging:** `console.error` in auth flows (`src/hooks/use-auth.tsx`); no centralized logging SDK in the frontend.

**Validation:** Form and input validation handled at component level (MUI forms); API contracts typed via `src/types/*`.

**Authentication:** JWT in cookies (`access_token`, `refresh_token` keys from `AUTH_CONFIG`); refresh endpoint and bearer header attachment in `ApiClient`; route protection in `src/app/(auth)/layout.tsx`.

---

*Architecture analysis: 2026-04-04*
