# Changelog

## [Unreleased]

### Added

- Auth routes `/login` and `/register` sharing `AuthPage` (footer links only, no tabs)
- `AuthWelcomeHeader`, `AuthBrandPanel`, `AuthCredentialsForm` (react-hook-form + Zod)
- `src/lib/auth-schema.ts` and `src/lib/api/errors.ts` (`ApiHttpError`, FastAPI `detail` parsing)
- `GET /api/v1/users/me` (backend) and `fetchCurrentUser` after login (no JWT decode on client)
- Tests for auth schema, API error formatting, and `resolveAuthError`

### Changed

- Mantis rebrand on login/register (teal theme, Manrope display font on auth pages)
- `src/lib/api/auth.ts`: errors by HTTP status with pt-BR copy; register 400/422 → fixed validation message
- `parseApiError` in API client uses `formatApiErrorDetail` for 422 arrays
- Removed deprecated client validators from `auth-form.ts` (validation lives in Zod)

### Documentation

- `docs/api/mantis-api-reference.md`: register 422, `GET /users/me`, rate limits aligned with backend (3/min register)
- ADR 0008 updated for auth UX (routes, Zod, error handling)
- Documentation rebrand and consolidation (Mantis, English)

## [0.4.0] - 2025-12-06

### Added

- Real backend integration (removed API mocks)
- Pagination for whitelist and logs
- OAuth2 form-data authentication
- TypeScript types aligned with backend schemas (`AccessStatus`, `PaginatedResponse`, plate/log fields)

### Changed

- API endpoints in `constants/index.ts` (auth, logs, gate paths)
- `api-client` refactored for real HTTP calls and error handling
- Components updated for new API shapes (`use-auth`, whitelist, logs, monitor)

## [0.3.0] - 2025-01

### Added

- Centralized types under `src/types/`
- Centralized constants under `src/constants/`
- Architecture documentation

### Changed

- `api-client.ts`, hooks, and components migrated to shared types and constants

## [0.2.0] - 2025-11-28

### Added

- Bluetooth device manager UI
- Device API methods (scan, connect, status, disconnect)

### Removed

- Legacy camera config API (`CameraConfig`)

## [0.1.0] - 2025-11-16

### Added

- Next.js 16 App Router project scaffold
- MUI, ESLint, Prettier, Jest
- GitHub Actions CI (lint, test, build)
- Developer README and PR template
