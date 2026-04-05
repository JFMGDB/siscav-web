---
phase: 02-api-client-http-consistency
plan: 02-01
completed: 2026-04-05
requirements:
  - API-01
---

# Plan 02-01 summary — API-01

## Done

- Exported `readBrowserAccessToken` and `readBrowserRefreshToken` in `src/lib/api/client.ts`, both delegating to the existing private `getCookie` (encode/decode aligned with `setCookie`).
- `getClientSingleton()` wires `getToken` / `getRefreshToken` to those helpers only.
- `src/lib/api-client.ts` facade `getAccessToken` / `getRefreshToken` delegate to the same exports; `setAccessToken` / `setRefreshToken` remain no-ops with comments pointing to `login` / `ApiClient.setTokens`.

## Verification

- `npm run build`: pass
- `npm test`: pass (after aligning `access-status` tests with `DEFAULT_CONFIG` / “Desconhecido” for unknown statuses)
