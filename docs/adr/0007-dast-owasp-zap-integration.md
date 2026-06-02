# ADR 0007: OWASP ZAP DAST Integration

## Status

Accepted

## Context

The **Mantis Web** frontend (`siscav-web` repository folder) is a Next.js (App Router) web application that authenticates against an external FastAPI backend using JWT (access/refresh tokens). The project currently has:

- No automated Dynamic Application Security Testing (DAST)
- No consistent security-header baseline (CSP/HSTS/anti-clickjacking/etc.)
- CI limited to formatting, lint, tests, and build

Given the academic nature of the project and the browser-exposed attack surface (routes, auth flows, cookies, HTTP integrations), we need a **clean, sustainable**, low-friction mechanism to continuously validate web security posture.

## Decision

Adopt **OWASP ZAP** as the DAST tool for Mantis Web, integrated into GitHub Actions with:

- **Baseline scans** (passive-focused) on every push and pull request
- **Full scans** (active + passive) on a weekly schedule and via manual dispatch
- Scan configuration and artifacts stored in-repo under `security/zap/`
- Reports uploaded as workflow artifacts (HTML + JSON)
- Pipeline failure criteria controlled via a `rules.tsv` threshold file

Additionally, establish a minimal, centralized security-header baseline in `next.config.ts` to reduce scan noise and improve security posture.

## Rationale

OWASP ZAP was chosen because it:

- Is open-source and widely used for web DAST
- Has official GitHub Actions for baseline/full scans
- Works well with containerized CI runners
- Produces auditable artifacts suitable for review and grading (HTML/JSON reports)
- Supports rule-based pass/fail gating without introducing complex infrastructure

The implementation keeps concerns separated:

- `ci.yml` remains focused on code quality (lint/test/build)
- `zap-scan.yml` focuses on security scanning (DAST)

## Scope (Phase 1)

Phase 1 intentionally focuses on **unauthenticated scanning** of the frontend. This still covers:

- Security headers and cookie attributes
- Redirect behavior (`/` → `/dashboard` → `/login`)
- Common web misconfigurations and information disclosure
- Frontend-exposed surfaces (public pages, login form)

Phase 1 does not require the backend to run in CI.

## Consequences

### Positive

- Continuous, automated web security validation
- Reproducible scanning via CI (GitHub Actions)
- Clear ownership and organization of security artifacts

### Negative / Trade-offs

- Adds runtime to CI (baseline scan time), kept separate from the main CI pipeline
- Some findings are environment-dependent (e.g., HSTS effectiveness depends on HTTPS)
- Authenticated scanning requires additional orchestration (backend in CI) and rate-limit awareness

## Implementation Details

### Files and conventions

- `security/zap/rules.tsv`: ZAP rule thresholds (FAIL/WARN/IGNORE)
- `.github/workflows/zap-scan.yml`: CI workflow running baseline and scheduled full scans

### Failure criteria

The pipeline fails when ZAP detects alerts configured as **FAIL** in `security/zap/rules.tsv`.

## Future evolution (Phase 2+)

- Authenticated scanning using the API login endpoint:
  - `POST /api/v1/login/access-token` (`application/x-www-form-urlencoded`, fields `username`/`password`)
  - Must respect API rate limiting (5 login attempts/min per IP) to avoid 429
- Run backend in CI via Docker Compose to scan protected routes
- Add CSP with MUI nonce integration
- Optionally emit SARIF to integrate into GitHub Security tab

## Alternatives considered

- **Burp Suite**: strong but commercial and heavier operationally
- **Nuclei**: great for templates but less integrated for browser/web-app behavior
- **Manual testing only**: not continuous and does not scale for CI/CD
