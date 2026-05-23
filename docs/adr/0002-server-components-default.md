# ADR 0002: Server Components by default

## Status

Accepted.

## Context

Next.js App Router supports Server Components by default. Using Client Components everywhere increases bundle size, exposes more logic to the client, and can hurt performance. The previous codebase did not explicitly adopt a strategy for when to use each.

## Decision

- **Default: Server Components.** All components in `app/` and `components/` are treated as Server Components unless they require client-only behavior.
- **Client boundary at the lowest level:** Only components that need interactivity (forms, action buttons, polling, browser APIs such as Web Bluetooth, or React state for user input) use `"use client"` at the top of the file. The directive is applied at the leaf of the tree so that parent layout and siblings remain server-rendered.
- **Providers as the main client boundary:** The root layout wraps the app with a single client boundary (e.g. `providers.tsx`) that provides theme, auth context, TanStack Query, and Snackbar. Pages and feature components stay server-rendered until they need client hooks or event handlers.

## Consequences

- Smaller client bundles and better initial load; server-rendered HTML for static and data-driven content.
- Explicit, intentional use of Client Components; easier to audit and optimize.
- Auth and data-fetching design must account for server vs client: initial data in Server Components, mutations and real-time updates in Client Components via hooks.
