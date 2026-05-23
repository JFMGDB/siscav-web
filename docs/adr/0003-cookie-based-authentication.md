# ADR 0003: Cookie-based authentication

## Status

Accepted.

## Context

The application previously stored JWT access and refresh tokens in `sessionStorage` and `localStorage`. That approach does not work for Server Components or Server Actions, which run only on the server and cannot access browser storage. It also increases exposure to XSS if the token is readable by client script.

## Decision

- **Migration to cookies:** The auth token (JWT or equivalent) is stored in cookies. Preference is for HttpOnly cookies when the backend supports them; otherwise cookies are managed via Next.js (e.g. session or secure cookies set by an API route or middleware).
- **Base HTTP client:** The shared API client in `lib/api/client.ts` does not use `sessionStorage` or `localStorage`. In Server Components and Server Actions it uses `cookies()` from `next/headers` to read the auth cookie and attach the token to request headers. For client-side requests (e.g. inside TanStack Query), the design aligns with backend capabilities: same-site cookies sent automatically, or a dedicated API route that reads the cookie and returns a short-lived token for client fetch.
- **Token handling:** Refresh logic, if still needed, is centralized in the client or in a server-side layer (e.g. middleware) that can read and set cookies. Logout clears the auth cookie.

## Consequences

- Server Components and Server Actions can perform authenticated API calls using the cookie.
- Reduced reliance on client-accessible token storage; HttpOnly cookies reduce XSS impact when supported.
- Backend and Next.js must agree on cookie name, domain, and security flags (HttpOnly, Secure, SameSite).
