# Codebase Concerns

**Analysis Date:** 2026-04-04

## Tech Debt

**Dual API client surface:**
- New code is directed at `getClientApiClient()` in `src/lib/api/client.ts` plus modules under `src/lib/api/*.ts`, while `src/lib/api-client.ts` remains a compatibility facade with no-op `setAccessToken` / `setRefreshToken` and duplicate cookie reading logic.
- Impact: Two ways to reach the API; fixes to cookie or token behavior can be missed in one path.
- Fix approach: Migrate remaining imports to domain modules + `getClientApiClient()`, then delete or thin the facade.

**Type safety shortcuts:**
- `src/components/ui/DataTable.tsx` uses `any` for `Column.format` and `(row as any)[column.id]`.
- `src/components/features/logs/LogsTable.tsx` casts filter state with `as any` on a MUI `Select` `onChange`.
- `src/lib/api/devices.ts` returns `Promise<unknown[]>` / `Promise<unknown>` for device operations.
- Impact: Refactors and API shape changes fail at runtime instead of compile time.
- Fix approach: Replace `any`/`unknown` with concrete types from `src/types` or dedicated DTO types.

**Inconsistent HTTP entry for auth:**
- `src/lib/api/auth.ts` `register()` calls `fetch` directly against `API_CONFIG.BASE_URL` instead of `ApiClient.request`, while `login()` uses `client.setTokens` after a separate `fetch`.
- Impact: Behavior diverges from centralized refresh/retry logic if `register` ever needs auth headers or shared error handling.
- Fix approach: Route through `ApiClient` where appropriate or document why bypass is required.

**Hardcoded monitor metadata:**
- `src/lib/api/monitor.ts` `getLastCapture` sets `confidence: 0.95` regardless of backend data.
- Impact: UI misrepresents model confidence; operators cannot trust the value.
- Fix approach: Map from API fields when available or remove the field until the backend supplies it.

**Lint rule suppression:**
- `src/hooks/use-auth.tsx` disables `react-hooks/exhaustive-deps` for the initial auth bootstrap `useEffect`.
- Impact: Future dependency changes may not re-run the effect, causing stale auth state.
- Fix approach: Stabilize callbacks or split effects with explicit, documented dependencies.

## Known Bugs

**Silent failure on last capture:**
- `src/lib/api/monitor.ts` wraps `getLastCapture` in `try/catch` and returns `null` on any error.
- Symptoms: Monitor UI shows empty state with no distinction between “no logs” and “API/network failure”.
- Trigger: Any failure from `getLogs` in `src/lib/api/logs.ts`.
- Workaround: Inspect network tab or React Query error state (if surfaced).

**Cookie read path divergence:**
- `src/lib/api/client.ts` uses `encodeURIComponent` / `decodeURIComponent` in `getCookie` / `setCookie`.
- `src/lib/api-client.ts` `getAccessToken` and `getRefreshToken` parse `document.cookie` with string splits and no `decodeURIComponent`, and assume a single `=` delimiter.
- Symptoms: Tokens or future cookie values that need encoding or contain `=` could be read incorrectly compared to `getCookie`.
- Workaround: Use only `getClientApiClient()` token resolution for new code; align facade with `getCookie` helpers.

## Security Considerations

**Client-readable tokens and profile:**
- Access and refresh tokens are stored via `document.cookie` in `src/lib/api/client.ts` without `HttpOnly` (not available from `document.cookie` writes in the browser).
- User display state is duplicated in `localStorage` under `AUTH_CONFIG.USER_KEY` in `src/hooks/use-auth.tsx`.
- Risk: XSS can exfiltrate tokens and user JSON; cookies are within script reach.
- Current mitigation: Same-site `Lax` on client-set cookies; reliance on app hygiene and backend token expiry/refresh.
- Recommendations: Prefer HttpOnly cookies set by the backend or BFF; avoid storing redundant user blobs in `localStorage`; add CSP and strict XSS defenses if not already enforced at host level.

**Route protection only in the client:**
- `src/app/(auth)/layout.tsx` gates routes with `useAuth` and `useRouter().push('/login')` in `useEffect`.
- Risk: Brief render of protected subtrees, no server-enforced boundary; unauthenticated users can receive client bundles for protected routes.
- Current mitigation: API calls still require valid tokens.
- Recommendations: Add Next.js `middleware` or server-side checks for sensitive routes and data.

**Web Bluetooth breadth:**
- `src/components/features/settings/BluetoothDeviceManager.tsx` uses `navigator.bluetooth.requestDevice` with `acceptAllDevices: true`.
- Risk: Users may pair unintended devices; broader attack surface for confused-deputy style issues in physical environments.
- Current mitigation: User consent dialog from the browser; optional service UUID list.
- Recommendations: Restrict to known service UUIDs when hardware allows.

## Performance Bottlenecks

**Fixed-interval polling:**
- `src/hooks/use-monitor-capture.ts` uses React Query with `refetchInterval` from `UI_CONFIG.POLLING.CAPTURE_INTERVAL` (`3000` ms in `src/constants/index.ts`).
- Problem: Steady load on `src/lib/api/monitor.ts` → `getLogs` even when the tab is inactive.
- Improvement path: Pause polling on `document.visibilityState`, backoff on errors, or move to push/WebSocket if the API supports it.

## Fragile Areas

**Bluetooth and media stack:**
- Files: `src/components/features/settings/BluetoothDeviceManager.tsx`, `src/types/web-bluetooth.d.ts`.
- Why fragile: Browser-specific APIs (Chrome/Edge/Opera messaging in UI), `getUserMedia` for video, and backend registration errors only logged with `console.warn` / `console.log` while UI may still show success paths.
- Safe modification: Test in supported browsers; ensure `showMessage` reflects backend `connectDevice` / `disconnectDevice` outcomes consistently.
- Test coverage: No automated tests for this flow (`src/__tests__` has no coverage here).

**Auth bootstrap race:**
- Files: `src/hooks/use-auth.tsx`, `src/app/(auth)/layout.tsx`.
- Why fragile: `refreshToken && !accessToken` triggers `refreshTokens()` without awaiting before `setIsLoading(false)`; layout may redirect or render based on `user` from `localStorage` while refresh is in flight.
- Safe modification: Model loading as explicit states (bootstrapping refresh vs ready); avoid clearing deps without fixing the eslint suppression.

## Scaling Limits

**Public API URL in the client bundle:**
- `src/constants/index.ts` sets `API_CONFIG.BASE_URL` from `process.env.NEXT_PUBLIC_API_URL` with a localhost default.
- Current capacity: Single backend origin; all clients hit the same URL.
- Limit: No built-in multi-tenant or regional routing in the frontend.
- Scaling path: Environment-specific builds or runtime config injection behind a gateway.

## Dependencies at Risk

**Bleeding-edge framework versions:**
- `package.json` pins `next` `16.0.3`, `react` / `react-dom` `19.2.0`, `eslint-config-next` `16.0.3`.
- Risk: Ecosystem churn, subtle compiler or RSC behavior changes, frequent security advisories requiring upgrades.
- Impact: CI (`jest.config.mjs`, `next/jest`) and production builds may break on minor upgrades.
- Migration plan: Track Next/React release notes; keep `npm audit` and lockfile updates on a schedule.

## Missing Critical Features

**Server-side auth for data fetching:**
- `src/lib/api/client.ts` exports `getServerApiClient()` using `next/headers` `cookies()`, but the constructor path omits refresh/setters compared to the browser singleton.
- Problem: Server Components cannot transparently refresh tokens like the client singleton.
- Blocks: Secure server-rendered fetches for logged-in users without additional BFF patterns.

## Test Coverage Gaps

**Narrow automated test surface:**
- Present tests: `src/__tests__/smoke.test.ts`, `src/__tests__/hooks/use-snackbar.test.tsx`, `src/__tests__/lib/access-status.test.ts` with `jest.config.mjs` and `jest.setup.mjs`.
- What's not tested: `ApiClient` refresh and `401` retry paths in `src/lib/api/client.ts`, auth flows in `src/hooks/use-auth.tsx`, monitor/logs/whitelist pages, and `BluetoothDeviceManager`.
- Risk: Regressions in gate control, whitelist, and token handling ship unnoticed.
- Priority: High for `client.ts` and auth; Medium for feature pages; Low for purely presentational components if covered indirectly later.

**No enforced coverage threshold:**
- `jest.config.mjs` sets `coverageProvider: "v8"` but no `coverageThreshold` is defined.
- Risk: Coverage can drift to zero for new modules without CI failure.

## CI/CD Notes

**Branch filters:**
- `.github/workflows/ci.yml` runs on pull requests targeting `develop` and pushes to `main` / `develop`.
- Gap: Feature branches opened against other base branches may not run CI unless policy ensures targets match.

---

*Concerns audit: 2026-04-04*
