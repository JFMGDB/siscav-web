# ADR 0004: Data fetching with Server Components and TanStack Query

## Status

Accepted (pending implementation).

## Context

Initial data was previously fetched in the client with ad-hoc `useState`/`useEffect` and direct API calls, leading to duplicated loading and error handling and no shared cache. We wanted fast initial render, clear separation of server vs client data, and consistent handling of mutations and real-time updates.

## Decision

- **Initial data: Server Components.** Main pages (e.g. whitelist, logs) fetch initial data on the server by calling `lib/api/` modules (using the cookie-aware client). Fetched data is passed as props to the UI. Pages remain Server Components where possible.
- **Client-side dynamics: TanStack Query.** Mutations (create/update/delete whitelist, gate trigger, manual registration, etc.), complex pagination, client-side filters, and continuous polling (e.g. Monitor) use TanStack Query. This removes manual loading and error state and provides a single cache and invalidation strategy.
- **Domain hooks as wrappers:** Hooks such as `useWhitelist`, `useLogs`, and `useMonitorCapture` are implemented as wrappers around `useQuery` and `useMutation`. They encapsulate endpoint calls, query keys, and optional snackbar feedback. Only Client Components that need mutations or polling use these hooks.

## Implementation note

TanStack Query is not yet installed or wired in `src/`. This ADR records the target pattern once server-side fetching and client mutations are implemented.

## Consequences

- Users see server-rendered content quickly; client hydration adds interactivity and updates.
- Single place to configure retries, cache time, and invalidation per domain.
- Clear pattern: server for initial load, TanStack Query for everything that happens after load on the client.
