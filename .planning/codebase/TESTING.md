# Testing Patterns

**Analysis Date:** 2026-04-04

## Test Framework

**Runner:**
- Jest `^30.2.0` with `jest-environment-jsdom` — declared in `package.json`, script `"test": "jest"`.
- Config: `jest.config.mjs` wraps config with `next/jest` (`createJestConfig` from `next/jest.js`) so Next.js and `next.config` are applied in tests.

**Assertion Library:**
- Jest built-in `expect`; DOM matchers from `@testing-library/jest-dom` (loaded in setup).

**Run Commands:**
```bash
npm test              # Run all tests (Jest default)
npm run lint          # ESLint (often run before/with tests locally)
npm run format:check  # Prettier check (CI)
```

**CI:** `.github/workflows/ci.yml` runs `npm run format:check`, `npm run lint`, `npm test`, then `npm run build` on Node 20.

## Test File Organization

**Location:**
- Dedicated tree under `src/__tests__/` mirroring concern — e.g. `src/__tests__/hooks/use-snackbar.test.tsx` for `src/hooks/use-snackbar.tsx`.

**Naming:**
- `*.test.tsx` / `*.test.ts` (Jest default patterns via Next’s Jest integration).

**Structure:**
```
src/
  __tests__/
    hooks/
      use-snackbar.test.tsx
  hooks/
    use-snackbar.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useSnackbar, SnackbarProvider } from '@/hooks/use-snackbar';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SnackbarProvider>{children}</SnackbarProvider>;
}

describe('useSnackbar Hook', () => {
  it('initializes with null message', () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });
    expect(result.current.message).toBeNull();
  });
  // ...
});
```

**Patterns:**
- **Setup:** Local `wrapper` component supplying React context providers required by the hook — `src/__tests__/hooks/use-snackbar.test.tsx`.
- **Async / state updates:** Wrap mutations in `act(() => { ... })` from `@testing-library/react`.
- **Assertions:** `expect(result.current....)` for hook return values; jest-dom available for future component tests.

## Setup Files

**Global setup:**
- `jest.setup.mjs` imports `@testing-library/jest-dom` so matchers like `toBeInTheDocument` are available when used.
- `jest.config.mjs` sets `setupFilesAfterEnv: ["<rootDir>/jest.setup.mjs"]` and `testEnvironment: "jsdom"`.

## Mocking

**Framework:** Jest (`jest.fn`, module mocks) — available but **not yet used** in the single existing test file.

**Patterns:**
- When testing modules that call `fetch` or `apiClient`, prefer `jest.spyOn(global, 'fetch')` or mocking `@/lib/api-client` / `getClientApiClient` at the module boundary in `src/lib/api/`.
- For Next.js navigation, mock `next/navigation` (`useRouter`, `redirect`) in tests that trigger routing.

**What to Mock:**
- Network I/O, cookies, and browser-only APIs not fully implemented in jsdom (e.g. Web Bluetooth in `src/components/features/settings/BluetoothDeviceManager.tsx`).

**What NOT to Mock:**
- Simple hook state and context providers when a real provider wrapper is cheap — as in `use-snackbar` tests.

## Fixtures and Factories

**Test Data:**
- Inline strings and small arrays in `it` blocks — e.g. message types array in `src/__tests__/hooks/use-snackbar.test.tsx`.

**Location:**
- No shared `__fixtures__` or factory helpers yet; add under `src/__tests__/fixtures/` or co-located helpers if reuse grows.

## Coverage

**Requirements:** None enforced — `package.json` has no `test:coverage` script; CI does not run coverage.

**Config note:** `jest.config.mjs` sets `coverageProvider: "v8"` for when coverage is run manually:
```bash
npx jest --coverage
```

## Test Types

**Unit Tests:**
- Current scope: one hook unit test file. Extend with component tests using `@testing-library/react` (`render`, `userEvent`) for UI under `src/components/`.

**Integration Tests:**
- Not present; API behavior is exercised manually via UI — future tests could mount pages with mocked `fetch` in `src/app/...`.

**E2E Tests:**
- Not used (no Playwright/Cypress in `package.json`).

## Common Patterns

**Hook testing with context:**
```typescript
const { result } = renderHook(() => useSnackbar(), { wrapper });
act(() => {
  result.current.showMessage('Test', 'success');
});
expect(result.current.message).toEqual({ text: 'Test', type: 'success' });
```

**Error testing:**
- For hooks that throw outside providers, use `expect(() => renderHook(() => useSnackbar())).toThrow(...)` if you avoid passing `wrapper` — pattern not yet in repo; `useSnackbar` tests always supply `SnackbarProvider`.

**Async testing:**
- Use `await act(async () => { ... })` when testing async hook effects; current tests are synchronous after `act`.

## Gaps (for planners)

- No tests for `src/lib/api/client.ts`, auth flows, or App Router pages.
- Add tests when introducing new hooks or complex form validation; mirror `src/__tests__/hooks/` layout for other domains (`components/`, `lib/`).

---

*Testing analysis: 2026-04-04*
