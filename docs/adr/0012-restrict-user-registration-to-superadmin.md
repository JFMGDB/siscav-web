# ADR 0012: Restrict User Registration to Superadmin

## Status

Accepted.

## Context

The web app exposed public `/register` with a login-page footer link. Registration called `POST /api/v1/register` without authentication. The API now requires a superadmin JWT for that endpoint (API ADR 007).

## Decision

- Remove public `/register` route and the login-page “Criar conta” link.
- Add protected `/users/create` under `(auth)` with a client-side superadmin guard (redirect non-superadmins to dashboard).
- Call `POST /api/v1/register` via authenticated `ApiClient.request()` (Bearer token).
- Extend `User` with `is_admin` and `is_superadmin` from `GET /users/me`.
- After creating a user, do **not** auto-login as the new account — the superadmin session stays active.
- Optional entry: “Create user” link on Settings visible only when `user.is_superadmin`.

Client guards are UX only; the API enforces authorization.

## Consequences

- End users cannot discover or access self-registration in the UI.
- Superadmins manage accounts from an authenticated page.
- Users must re-login after deploy to refresh role fields in `localStorage`.

## Alternatives considered

- **Next.js middleware for superadmin:** Rejected — roles are not in JWT; would require an extra API call per navigation.
- **Keep public register with master password:** Rejected — aligns with API ADR 007.

## Related

- API ADR 007: `is_superadmin`, protected `POST /api/v1/register`.
- Web ADR 0013: superadmin UI limited to account management (no client operational shell).
- API ADR 008: registered users are always client administrators (`is_admin=true`).
