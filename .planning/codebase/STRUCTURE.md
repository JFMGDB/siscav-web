# Codebase Structure

**Analysis Date:** 2026-04-04

## Directory Layout

```
siscav-web/
├── src/
│   ├── app/                    # Next.js App Router: layouts, pages, metadata
│   │   ├── layout.tsx          # Root layout (Providers, fonts, globals)
│   │   ├── page.tsx            # "/" → redirect to dashboard
│   │   ├── (auth)/             # Authenticated route group (shared shell)
│   │   │   ├── layout.tsx      # Client guard + Sidebar
│   │   │   ├── dashboard/
│   │   │   ├── logs/
│   │   │   ├── monitor/
│   │   │   ├── settings/
│   │   │   └── whitelist/
│   │   └── (public)/           # Public route group
│   │       └── login/
│   ├── components/
│   │   ├── providers.tsx       # Query + MUI + Auth + Snackbar
│   │   ├── features/           # Domain-specific UI (by folder)
│   │   └── ui/                 # Shared presentational components
│   ├── constants/
│   │   └── index.ts            # API_CONFIG, AUTH_CONFIG, ROUTES, MESSAGES, UI_CONFIG
│   ├── hooks/                  # use-auth, use-logs, use-whitelist, etc.
│   ├── lib/
│   │   ├── api/                # ApiClient + per-domain API functions
│   │   ├── api-client.ts       # Facade object delegating to api modules
│   │   ├── access-status.ts
│   │   └── image-url.ts
│   ├── styles/
│   │   └── globals.css
│   ├── theme/
│   │   └── index.ts            # MUI createTheme
│   ├── types/                  # Domain TS types + barrel index.ts
│   └── __tests__/              # Jest tests (smoke, hooks, lib)
├── public/                     # Static assets (if present)
├── package.json
├── tsconfig.json               # paths: "@/*" → "./src/*"
├── next.config.ts
└── jest.config.mjs             # (test runner config at repo root)
```

## Directory Purposes

**`src/app/`:**

- Purpose: File-system routing, nested layouts, and per-route metadata.
- Contains: `layout.tsx`, `page.tsx`, route groups `(auth)` and `(public)`.
- Key files: `src/app/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/page.tsx`, `src/app/(public)/login/page.tsx`.

**`src/components/features/`:**

- Purpose: Feature-scoped components grouped by product area.
- Contains: One subdirectory per area (`auth`, `gate`, `logs`, `monitor`, `settings`, `whitelist`).
- Key files: e.g. `src/components/features/auth/LoginForm.tsx`, `src/components/features/gate/GateControl.tsx`.

**`src/components/ui/`:**

- Purpose: Reusable UI building blocks not tied to a single feature.
- Key files: `src/components/ui/Sidebar.tsx`, `src/components/ui/DataTable.tsx`, `src/components/ui/Button.tsx`.

**`src/hooks/`:**

- Purpose: React hooks and context providers (filename `use-*.ts` / `use-*.tsx`).
- Key files: `src/hooks/use-auth.tsx`, `src/hooks/use-logs.ts`, `src/hooks/use-snackbar.tsx`.

**`src/lib/api/`:**

- Purpose: HTTP client and domain-specific API wrappers.
- Key files: `src/lib/api/client.ts`, `src/lib/api/auth.ts`, `src/lib/api/logs.ts`, `src/lib/api/gate.ts`, `src/lib/api/monitor.ts`, `src/lib/api/whitelist.ts`, `src/lib/api/devices.ts`.

**`src/types/`:**

- Purpose: Shared TypeScript interfaces and types; `src/types/index.ts` re-exports all modules.

**`src/constants/`:**

- Purpose: Single module `src/constants/index.ts` for configuration and copy constants.

**`src/__tests__/`:**

- Purpose: Unit and smoke tests co-located under a top-level test tree (not beside every source file).

## Key File Locations

**Entry Points:**

- `src/app/layout.tsx`: Application root; imports `src/components/providers.tsx` and `src/styles/globals.css`.
- `src/app/page.tsx`: Root URL handler; redirects to dashboard.

**Configuration:**

- `next.config.ts`: Next.js config (e.g. React Compiler flag).
- `tsconfig.json`: TypeScript + `@/*` path alias to `src/*`.
- `package.json`: Scripts (`next dev`, `jest`, eslint/prettier).

**Core Logic:**

- `src/lib/api/client.ts`: `ApiClient`, token refresh, client/server factories.
- `src/lib/api-client.ts`: Backward-compatible `apiClient` surface.
- `src/hooks/use-auth.tsx`: Auth context, login/logout, token + user hydration.

**Testing:**

- `src/__tests__/smoke.test.ts`, `src/__tests__/hooks/use-snackbar.test.tsx`, `src/__tests__/lib/access-status.test.ts`

## Naming Conventions

**Files:**

- **App Router:** `layout.tsx`, `page.tsx` per segment (Next.js convention).
- **React components:** `PascalCase.tsx` (e.g. `LoginForm.tsx`, `GateControl.tsx`).
- **Hooks:** `use-kebab-name.ts` or `use-kebab-name.tsx` (e.g. `use-auth.tsx`, `use-logs.ts`).
- **Lib/API:** `kebab-case.ts` or single-purpose names (`client.ts`, `auth.ts` under `api/`).

**Directories:**

- **Route groups:** Parentheses, e.g. `(auth)`, `(public)`—do not appear in the URL.
- **Feature folders:** lowercase domain names under `src/components/features/`.

## Where to Add New Code

**New authenticated screen:**

- Route: add `src/app/(auth)/<segment>/page.tsx` (usually `'use client'` if it uses hooks or MUI interactively).
- UI: add components under `src/components/features/<segment>/`.
- If new API surface: add `src/lib/api/<segment>.ts` with functions taking `ApiClient`, wire endpoints in `src/constants/index.ts` under `API_CONFIG.ENDPOINTS`.

**New Component/Module:**

- Shared primitives: `src/components/ui/<Name>.tsx`.
- Feature-specific: `src/components/features/<area>/<Name>.tsx`.

**Utilities:**

- Shared helpers without React: `src/lib/<name>.ts` or extend `src/lib/api/*` for HTTP-related helpers.

**Types:**

- New models: `src/types/<domain>.ts`, export from `src/types/index.ts`.

**Tests:**

- Prefer `src/__tests__/<area>/...` mirroring the area under test (existing pattern for hooks and lib).

## Special Directories

**`.next/`:**

- Purpose: Next.js build output and dev cache.
- Generated: Yes.
- Committed: No (typically gitignored).

**Route groups `(auth)` and `(public)`:**

- Purpose: Organize layouts and share UI boundaries; URLs are `/dashboard`, `/login`, etc.—not `/(auth)/dashboard`.

---

*Structure analysis: 2026-04-04*
