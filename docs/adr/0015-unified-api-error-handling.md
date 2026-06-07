# ADR 0015: Unified API error handling (pt-BR UI)

## Status

Accepted

## Context

The web client had two error paths: `auth.ts` threw `ApiHttpError`, while `ApiClient` threw plain `Error` with English fallbacks (`"API Error"`, `"Session expired..."`, `"Failed to fetch"`). Mutation hooks ignored API `detail` and always showed generic Portuguese toasts.

## Decision

1. **`ApiHttpError` is the single error type** for all API calls (`status`, `detail`, derived `kind`).
2. **`resolveApiError(err, fallback)`** bridges thrown values to user-facing pt-BR strings; API `detail` wins over generic fallbacks.
3. **`ApiClient`**:
   - Default headers: `Accept: application/json`; inject `Content-Type: application/json` for JSON bodies.
   - Throws `ApiHttpError` on HTTP errors; wraps network failures with `kind: "network"`.
   - Retries token refresh **only on 401** (not 403) for multipart/blob requests.
4. **UI components and hooks** use `resolveApiError` in `onError` handlers and query error alerts.
5. **Constants** `MESSAGES.COMMON.*` hold session, network, and status fallbacks.

## Error kind taxonomy

Derived from HTTP status (no extra JSON field from API):

| Kind | Status |
|------|--------|
| `authentication` | 401 |
| `authorization` | 403 |
| `not_found` | 404 |
| `conflict` | 409 |
| `validation` | 422 |
| `business` | 400, 413 |
| `network` | fetch failure |
| `unexpected` | 5xx |

## Consequences

- Operators always see pt-BR messages.
- Callers can branch on `ApiHttpError.status` or `kind` when needed.
- Auth-specific mapping in `auth.ts` remains for login/register status codes; other endpoints use shared parsing.

## Alternatives considered

- **Axios interceptors**: rejected — native `fetch` is sufficient and already in use.
- **Global React Query `onError`**: rejected — explicit per-hook/component handling is clearer with minimal code.
