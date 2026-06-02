# ADR 0008: Mantis rebrand and progressive visual refactor

## Status

Accepted.

## Context

The frontend was branded as SISCAV and used visual patterns typical of auto-generated admin UIs (purple gradient login backgrounds, letter-in-a-box logos, heavy shadows, redundant inline styles). The product is being renamed to **Mantis** (inspired by the mantis shrimp) to establish a distinct identity for the vehicle access control system.

The stack remains Next.js, React, TypeScript, MUI, and TanStack Query. A full UI rewrite is out of scope; changes are applied incrementally, starting with the login screen.

## Decision

### Rebrand

- User-visible copy and metadata use **Mantis** instead of SISCAV.
- Package name: `mantis-web` (repository folder name may remain `siscav-web` until renamed separately).
- API base URL env: `NEXT_PUBLIC_MANTIS_API_URL` as primary; `NEXT_PUBLIC_SISCAV_API_URL` and `NEXT_PUBLIC_API_URL` kept as fallbacks.
- Browser storage keys and custom events use `mantis-*` prefixes (e.g. `mantis-web.camera.v1`, `mantis-camera-config-change`).

### Visual identity (Phase 1)

- **Palette:** Teal primary (`#0d9488`) replacing generic Tailwind blue.
- **Typography:** Inter (loaded in root layout) aligned with MUI `typography.fontFamily`.
- **Assets:** `public/mantis-logo-mark.png` (icon), `public/mantis-illustration.jpg` (login panel). Favicon deferred.
- **Icons:** Continue using `@mui/icons-material`; no new icon library in Phase 1.
- **Login:** Split layout (form column left, full-bleed illustration right on desktop; image strip + form on mobile). Removed gradient backgrounds, SVG pattern overlays, elevation-24 cards, and overlay marketing text on the illustration.
- **Auth routes:** `/login` and `/register` share `AuthPage` (no MUI tabs). Mode switch via footer links only. Welcome copy per route (`AuthWelcomeHeader`). Display font: Manrope on public auth layout.
- **Registration:** `POST /api/v1/register` via `useAuth.register` (auto-login after signup). Client validation: Zod schemas in `src/lib/auth-schema.ts` + `react-hook-form` (inline field errors). Password min 8 chars aligned with `UserCreate` in the API.
- **Theme:** Reduced hover transforms on buttons/cards; tighter border radius (8px base).

### Progressive rollout

| Phase | Scope                                                  |
| ----- | ------------------------------------------------------ |
| 1     | Login, global rename, theme tokens, sidebar brand text |
| 2     | Sidebar/AppBar visual polish                           |
| 3     | Dashboard (StatCard, GateControl)                      |
| 4     | Monitor, Camera, Whitelist, Logs, Settings             |

### Error handling

- API layer (`src/lib/api/auth.ts`): maps HTTP status to `ApiHttpError` with pt-BR messages per `siscav-api/docs/api/frontend-integration.md` (401, 409, 429, 400/422 on register). After login, user profile comes from `GET /api/v1/users/me`, not JWT payload decoding.
- FastAPI `detail` parsing (`src/lib/api/errors.ts`): supports string and Pydantic validation arrays (422).
- UI (`resolveAuthError` in `src/lib/auth-form.ts`): displays `ApiHttpError.detail`; register validation errors 400/422 use a fixed pt-BR message in the API layer (no raw English Pydantic text in the Alert).

## Consequences

- Existing users lose camera config in `localStorage` if they had data under `siscav-web.camera.v1` (key renamed; migration not implemented in Phase 1).
- CI/docs may still reference SISCAV until updated in a follow-up.
- Favicon and empty-state illustrations remain future work.
- Components that hardcoded blue (`#2563eb`) in `sx` may need per-file updates in later phases; theme and StatCard primary color were updated in Phase 1.

## Alternatives considered

- **shadcn/ui or Tailwind:** Rejected for Phase 1 to avoid stack churn; MUI already covers admin UI needs.
- **New icon library (Lucide/Phosphor):** Deferred; MUI icons are sufficient and already integrated.
- **Full redesign in one pass:** Rejected; incremental phases reduce risk and keep the app shippable.
