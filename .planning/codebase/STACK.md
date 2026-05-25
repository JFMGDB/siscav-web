# Technology Stack

**Analysis Date:** 2026-04-04

## Languages

**Primary:**

- **TypeScript** (5.x, `typescript` in `package.json`) — Application source under `src/**/*.ts` and `src/**/*.tsx`; strict mode enabled in `tsconfig.json` (`"strict": true`).

**Secondary:**

- **JavaScript (ES modules)** — Tooling configs: `eslint.config.mjs`, `jest.config.mjs`, `jest.setup.mjs`.

## Runtime

**Environment:**

- **Node.js** — CI pins **20** in `.github/workflows/ci.yml` (`node-version: "20"`). `README.md` recommends Node 20.x or newer for local development.

**Package Manager:**

- **npm** — Scripts and `npm ci` in CI.
- Lockfile: **`package-lock.json`** present at repository root.

## Frameworks

**Core:**

- **Next.js** `16.0.3` — App Router; entry under `src/app/` (`layout.tsx`, route groups). Config: `next.config.ts` enables **`reactCompiler: true`** (React Compiler integration).
- **React** `19.2.0` / **react-dom** `19.2.0` — UI layer.

**UI & styling:**

- **MUI (Material UI)** `^7.3.5` — `@mui/material`, `@mui/icons-material`, Emotion (`@emotion/react`, `@emotion/styled`).
- **MUI Next.js integration** — `@mui/material-nextjs` with `AppRouterCacheProvider` from `@mui/material-nextjs/v13-appRouter` in `src/components/providers.tsx`.
- **Theme** — `src/theme/index.ts` uses `createTheme` from MUI.
- **Global CSS** — `src/styles/globals.css`; README also references CSS Modules where used in components.

**Data fetching / client state:**

- **TanStack React Query** `^5.90.21` — `QueryClientProvider` and defaults in `src/components/providers.tsx`; hooks such as `src/hooks/use-whitelist.ts` use `useQuery` / `useMutation`.

**Testing:**

- **Jest** `^30.2.0` with **`jest-environment-jsdom`** — Config: `jest.config.mjs` uses `next/jest` from `next/jest.js` and `setupFilesAfterEnv`: `jest.setup.mjs`.
- **React Testing Library** — `@testing-library/react`, `@testing-library/jest-dom` (extended in `jest.setup.mjs`).

**Build / dev:**

- **Next.js built-in bundler** (Turbopack in dev per Next 16 defaults where applicable).
- **TypeScript** — `noEmit: true`, `moduleResolution: "bundler"`, Next plugin in `tsconfig.json`.

**Lint / format:**

- **ESLint** `^9` — Flat config `eslint.config.mjs`: `eslint-config-next` (core-web-vitals + typescript), `eslint-config-prettier`.
- **Prettier** `^3.6.2` — `npm run format` / `format:check`; config file `.prettierrc` (empty object = Prettier defaults).

**Compiler / tooling:**

- **babel-plugin-react-compiler** `1.0.0` (devDependency) — Aligns with `reactCompiler` in `next.config.ts`.

## Key Dependencies

**Critical (app behavior):**

- `next`, `react`, `react-dom` — Shell and rendering.
- `@tanstack/react-query` — Server state and cache for API-backed views.
- `@mui/material` (+ Emotion) — Component library and styling runtime.

**Infrastructure / quality:**

- `eslint`, `eslint-config-next`, `prettier`, `jest`, `@testing-library/*`, `@types/*` — Quality and tests.

## Configuration

**Environment:**

- Public API base URL: **`NEXT_PUBLIC_API_URL`** — Read in `src/constants/index.ts` (`API_CONFIG.BASE_URL`); falls back to `http://localhost:8000`.
- `.env*` files are gitignored per `.gitignore`; no committed `.env.example` was found — document required vars in README or add an example file for onboarding.

**Build:**

- `next.config.ts` — Next.js and React Compiler.
- `tsconfig.json` — Path alias `@/*` → `./src/*`.
- `next-env.d.ts` — Next.js TypeScript ambient types (generated/updated by Next).

## Platform Requirements

**Development:**

- Node.js 20+ and npm; clone repo, `npm install`, `npm run dev` (default dev server URL documented in `README.md` as http://localhost:3000).

**Production:**

- Standard **Next.js** production build: `npm run build` then `npm run start` — deploy target not fixed in-repo (e.g. Node host or Vercel-compatible); `.vercel` is gitignored.

---

*Stack analysis: 2026-04-04*
