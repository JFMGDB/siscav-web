# External Integrations

**Analysis Date:** 2026-04-04

## APIs & External Services

**SISCAV REST API (backend):**

- This frontend is the **siscav-web** half of a split system; the backend lives in a separate **`siscav-api`** repository (`README.md`).
- All product features (auth, whitelist, logs, devices, gate, images) call HTTP JSON endpoints on a configurable base URL.

**Base URL configuration:**

- **`NEXT_PUBLIC_API_URL`** — Exposed to the browser; default when unset: `http://localhost:8000` (`src/constants/index.ts`, `API_CONFIG.BASE_URL`).
- Endpoints are centralized in `src/constants/index.ts` under `API_CONFIG.ENDPOINTS` (prefix `/api/v1/...`).

**HTTP client:**

- **Native `fetch`** — No Axios or other HTTP SDK. Implementation: `src/lib/api/client.ts` (`ApiClient.request`), with refresh flow using `API_CONFIG.ENDPOINTS.AUTH.REFRESH`.
- **Domain modules** under `src/lib/api/` (e.g. `auth.ts`, `whitelist.ts`, `logs.ts`, `gate.ts`, `monitor.ts`, `devices.ts`) compose paths from `API_CONFIG`.
- **Facade** `src/lib/api-client.ts` re-exports behavior for legacy call sites; new code should use `getClientApiClient()` and domain modules per file comment.

**Representative routes consumed (from `src/constants/index.ts`):**

- Auth: `/api/v1/register`, `/api/v1/login/access-token`, `/api/v1/login/refresh-token`
- Whitelist: `/api/v1/whitelist`
- Access logs: `/api/v1/access_logs`; images: `/api/v1/access_logs/images`
- Devices: scan, connect, status, disconnect, video-frame under `/api/v1/devices/...`
- Gate: `/api/v1/gate_control/trigger`

**Third-party SaaS SDKs:**

- Not detected in `package.json` or typical import patterns (no Stripe, Supabase, OpenAI, etc.).

## Data Storage

**Databases:**

- **Not applicable in this repo** — Persistence is owned by **siscav-api**; the web app is a client.

**File storage:**

- **Backend-mediated** — Image paths are referenced via `API_CONFIG.ENDPOINTS.IMAGES` (`/api/v1/access_logs/images`); the browser loads assets through the API, not direct cloud bucket SDKs in this codebase.

**Caching:**

- **Client-side:** TanStack Query default cache (`src/components/providers.tsx`: `staleTime`, `refetchOnWindowFocus: false`).
- **No Redis/browser extension** or CDN config in-repo.

## Authentication & Identity

**Provider:**

- **Custom backend JWT** — Login returns tokens consumed by the SPA; not OAuth2 social providers or Auth0 in dependencies.

**Implementation:**

- **Bearer tokens** on API requests (`Authorization` header) via `src/lib/api/client.ts`.
- **Refresh** — On 401/403, client attempts token refresh then retries; failures clear tokens.
- **Storage:** **HTTP cookies** for `access_token` and `refresh_token` (names in `AUTH_CONFIG` in `src/constants/index.ts`). Client reads/writes cookies in `getClientApiClient()`; **server** path uses `next/headers` `cookies()` in `getServerApiClient()` (`src/lib/api/client.ts`).

## Monitoring & Observability

**Error tracking:**

- No Sentry, Datadog, or similar SDK in `package.json`.

**Logs:**

- Browser **console** only for typical client logging unless added elsewhere; no centralized logging service wired in-repo.

## CI/CD & Deployment

**CI pipeline:**

- **GitHub Actions** — `.github/workflows/ci.yml` on push/PR to `main` and `develop`: checkout, Node 20, `npm ci`, Prettier check, ESLint, Jest, `next build`.

**Hosting:**

- Not specified in code; `.gitignore` ignores `.vercel`, implying optional Vercel deployment.

## Environment Configuration

**Required env vars (inferred from code):**

- **`NEXT_PUBLIC_API_URL`** — Points the UI at the running **siscav-api** instance in each environment (dev/staging/prod). Omit only when default `http://localhost:8000` is correct.

**Secrets location:**

- Local/production secrets belong in ignored `.env*` files per `.gitignore`; do not commit values. No `.env.example` present in the tree at analysis time — consider adding one listing `NEXT_PUBLIC_API_URL` for contributors.

## Webhooks & Callbacks

**Incoming:**

- None defined in this Next.js app (no API route handlers observed as webhook receivers in the explored layout).

**Outgoing:**

- None beyond normal **REST calls** to **siscav-api**; no third-party webhook registrations in frontend code.

---

*Integration audit: 2026-04-04*
