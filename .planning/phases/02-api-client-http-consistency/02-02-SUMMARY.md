---
phase: 02-api-client-http-consistency
plan: 02-02
completed: 2026-04-05
requirements:
  - API-02
---

# Plan 02-02 summary — API-02

## Done

- `ApiClient.getBaseUrl()` returns the normalized instance base URL used by `request()`.
- `register(client, …)` in `src/lib/api/auth.ts` builds the URL with `client.getBaseUrl()` + `API_CONFIG.ENDPOINTS.AUTH.REGISTER`; still uses `fetch` + `parseApiError`; no `Authorization` and no `client.request`.
- English maintenance block above `register` documents intentional bypass of `ApiClient.request`, no refresh-on-401 path, `parseApiError` alignment, and base URL equivalence with the default singleton.

## Verification

- `npm run build`: pass
- `npm test`: pass
