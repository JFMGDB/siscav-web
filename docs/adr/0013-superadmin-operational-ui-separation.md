# ADR 0013: Superadmin Operational UI Separation

## Status

Accepted.

## Context

ADR 0012 restricted user registration to superadmins but left the authenticated shell unchanged: superadmins saw the full client sidebar (dashboard, monitor, whitelist, logs) and could reach operational pages. API ADR 007 originally treated superadmin as satisfying operational admin checks; that was amended to block platform administrators from client operational endpoints.

## Decision

- Add [`src/lib/auth/roles.ts`](../../src/lib/auth/roles.ts) with `isPlatformSuperadmin` and `CLIENT_OPERATIONAL_PATHS`.
- **Sidebar:** platform superadmin menu = “Gestão de contas” (Settings) only; client administrators keep the full menu.
- **`(auth)/layout`:** redirect superadmin away from `/dashboard`, `/monitor`, `/camera`, `/whitelist`, `/logs`; redirect non-superadmin away from `/users/create`.
- **Login:** superadmin lands on `/settings`; others on `/dashboard`.
- **Settings:** hide camera configuration for superadmin; keep “Create user” block for superadmin.

Client guards remain UX only; the API enforces separation via `get_current_client_admin_user` (ADR 008: two roles only).

## Consequences

- Superadmins manage accounts without client operational UI.
- Users must re-login after deploy to refresh role flags in `localStorage`.
- Direct navigation to client URLs as superadmin redirects to Settings.

## Related

- API ADR 007 (amendment): platform vs client separation in `deps.py`.
- API ADR 008: two roles only; registered users are client administrators.
- Web ADR 0012: superadmin-only registration UI.
