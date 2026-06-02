# ADR 0009: Mantis favicon and web manifest

## Status

Accepted.

## Context

ADR 0008 deferred the browser favicon while the Mantis rebrand focused on login, theme tokens, and in-app logo assets (`mantis-logo-mark.png`). Users see the product in browser tabs, bookmarks, and mobile home-screen shortcuts; a missing or generic icon undermines the rebrand.

A complete raster icon kit already exists at the repository root (`favicon_io/`), generated from the mantis-shrimp silhouette. The UI logo mark is a separate export (different file hash) but shares the same visual motif.

## Decision

- **Canonical favicon source:** `favicon_io/` kit (not regenerated from `mantis-logo-mark.png` in this change).
- **Next.js App Router conventions:**
  - `src/app/favicon.ico` — browser tabs and legacy bookmarks.
  - `src/app/apple-icon.png` — Apple touch icon (from `apple-touch-icon.png`).
- **PWA / install icons:** `public/android-chrome-192x192.png` and `public/android-chrome-512x512.png`.
- **Web manifest:** `src/app/manifest.ts` (`MetadataRoute.Manifest`) with `name` / `short_name` **Mantis**, `theme_color` `#0d9488` (Mantis primary), `background_color` `#ffffff`, served at `/manifest.webmanifest`.
- **Root metadata:** `applicationName: "Mantis"` and `title.default` / `title.template` in `src/app/layout.tsx`. No duplicate `metadata.icons` entries (file conventions emit the icon link tags).
- **Archive:** `favicon_io/` remains at repo root as the generation source; the app does not reference it at runtime.

## Consequences

- Browser tabs, bookmarks, and add-to-home-screen flows show the mantis silhouette favicon with correct Mantis naming in the manifest.
- `mantis-logo-mark.png` in Sidebar and auth UI is unchanged.
- Optional follow-ups (out of scope): SVG favicon, dark-mode icon variant, Safari mask icon, or regenerating the kit from the UI logo mark if visual QA finds a mismatch.

## Alternatives considered

- **Copy all icons to `public/` and set `metadata.icons` only:** Rejected; App Router file conventions are less code and match Next.js docs.
- **Use `favicon_io/site.webmanifest` as-is:** Rejected; empty `name` / `short_name` and white `theme_color` do not match Mantis branding.
- **Regenerate from `mantis-logo-mark.png`:** Deferred; product chose the existing `favicon_io` kit.
