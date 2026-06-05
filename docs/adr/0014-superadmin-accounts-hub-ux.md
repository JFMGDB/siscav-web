# ADR 0014: Superadmin Accounts Hub UX

## Status

Accepted.

## Context

ADR 0013 limited the superadmin shell to account management at `/settings`, but the page showed a single `Paper` with one button — low information density and no global system state. API ADR 009 adds `GET /users/stats`, paginated `GET /users`, and PATCH/DELETE for superadmin account management.

## Decision

- Replace the superadmin branch of `/settings` with `SuperadminAccountsHub`:
  - Three `StatCard` widgets fed by `GET /users/stats`
  - Primary action card linking to `/users/create`
  - Info alert explaining platform vs. client admin separation
  - `AccountsTable` with edit-email dialog and delete for client admins only
- Data via `use-users.ts` (TanStack Query), not browser localStorage
- Improve `/users/create`: `Card` wrapper, back link, custom submit label, form reset on success, query invalidation
- Shell tweaks: AppBar title for `/users/create`, superadmin chip in sidebar, hide notification badge for superadmin
- Optional `submitLabel` prop on `AuthCredentialsForm` (no stack change)

Landing route remains `/settings` (ADR 0013).

## Consequences

- Superadmin sees real account counts and a manageable list
- Client admin `/settings` (camera config) unchanged
- Depends on API ADR 009 endpoints

## Related

- Web ADR 0012, 0013
- API ADR 009
