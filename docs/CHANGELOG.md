# Changelog

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
