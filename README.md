# Mantis Web — Frontend

[![CI Pipeline](https://github.com/JFMGDB/siscav-web/actions/workflows/ci.yml/badge.svg)](https://github.com/JFMGDB/siscav-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Code style: Prettier](https://img.shields.io/badge/code%20style-Prettier-ff69b4.svg)](https://prettier.io/)
[![License: Academic](https://img.shields.io/badge/license-Academic-green.svg)](https://portal.unicap.br/)

## Overview

**Mantis** is a vehicle access control system. The project is split across two repositories:

- **`siscav-api`** — Mantis API backend (REST)
- **`siscav-web`** — this repository; admin panel frontend

This repository contains the client-side application: an admin dashboard responsible for:

- Administrator login and access control
- CRUD management of the authorized vehicle whitelist
- Access log history
- Remote gate triggering

Further documentation lives under [`docs/`](docs/README.md) (ADRs, changelog, API reference).

## Features

- Login, registration, and access control
- Whitelist management panel
- Access log viewer with images
- Manual remote gate trigger
- Camera preview (`/camera`): USB or network stream (MJPEG / HLS); video does not pass through the API

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** MUI (Material UI) + Emotion
- **Testing:** Jest, React Testing Library
- **Code quality:** ESLint, Prettier
- **DevOps:** GitHub Actions

## Project Structure

```bash
siscav-web/
├── .github/workflows/     # CI and ZAP DAST pipelines
├── docs/                  # ADRs, changelog, API reference
├── public/                # Static assets
├── security/zap/          # OWASP ZAP rule thresholds
├── src/
│   ├── app/
│   │   ├── (auth)/        # Protected routes (e.g. /dashboard)
│   │   ├── (public)/      # Public routes (e.g. /login)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── features/      # Domain components with business logic
│   │   └── ui/            # Shared reusable UI primitives
│   ├── constants/
│   ├── hooks/
│   ├── lib/               # API client, utilities
│   ├── theme/
│   └── types/
├── eslint.config.mjs
├── jest.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later
- [npm](https://www.npmjs.com/)

### Setup

```bash
git clone https://github.com/JFMGDB/siscav-web.git
cd siscav-web
npm install
```

### API configuration

The frontend communicates with the Mantis API backend (`siscav-api`) over REST. Set the base URL via environment variables:

- **Preferred:** `NEXT_PUBLIC_MANTIS_API_URL`
- **Legacy fallbacks:** `NEXT_PUBLIC_SISCAV_API_URL`, `NEXT_PUBLIC_API_URL` (see `src/constants/index.ts`)

Typical development value: `http://localhost:8000`.

Copy the example env file and adjust if needed:

```bash
cp .env.example .env.local
```

Windows (PowerShell): `Copy-Item .env.example .env.local`

### Camera preview (`/camera`)

- **USB:** `navigator.mediaDevices.getUserMedia` requires a secure context — use **HTTPS** in production or **`http://localhost`** / **`https://localhost`** in development.
- **Mixed content:** if the panel is served over **HTTPS**, the browser blocks **HTTP** streams (e.g. IP cameras with `http://` only). Use an **https://** URL or access the frontend over HTTP on the local network during testing.
- **CORS / network:** preview via `<img>` is usually more tolerant than `fetch`; inaccessible streams show an error in the UI.
- **Safari / iOS:** `getUserMedia` and format support varies; HLS may work natively where `hls.js` is not required.
- **Monitoring:** under **Preview**, use **Save configuration** (USB or URL). The same live feed appears under **Monitoring**; configuration is stored in `localStorage` in this browser (see also **Settings**).
- **Server OCR:** under **Monitoring → Quick registration**, **Automatic OCR** (default) and **Read plate now** send a JPEG as `multipart` (`file`) to `POST /api/v1/ml/recognize-plate` with a JWT. After a token refresh the request is retried with a **new** `FormData` (multipart bodies can only be read once). Network streams on another domain **without CORS** cannot be captured on canvas — use USB or a CORS-enabled URL. Requires `requirements-ml.txt` on the API; otherwise **503**.

## Scripts

### `npm run dev`

Starts the development server. Open [http://localhost:3000](http://localhost:3000). The page reloads on file changes.

### `npm test`

Runs unit and component tests with Jest. Run before pushing changes.

### `npm run lint`

Runs ESLint for static analysis.

### `npm run format`

Formats the codebase with Prettier.

### `npm run build`

Production build. Validates TypeScript types and compilation.

## Continuous Integration

GitHub Actions runs on every pull request to `develop` (`.github/workflows/ci.yml`):

1. **Lint** — code style and conventions
2. **Build** — compilation succeeds
3. **Test** — existing logic is not broken

If any step fails, the pull request cannot be merged.

## Security Scanning (DAST)

Automated **Dynamic Application Security Testing** with **OWASP ZAP** is included. See [ADR 0007](docs/adr/0007-dast-owasp-zap-integration.md) for rationale.

### CI workflow

- **Baseline scan:** `.github/workflows/zap-scan.yml` on `push` (main/develop) and `pull_request` (develop)
- **Full scan:** weekly via `schedule`; manual trigger via `workflow_dispatch`

Reports are uploaded as GitHub Actions artifacts:

- `zap-baseline-report` (HTML + JSON)
- `zap-full-report` (HTML + JSON)

Thresholds (FAIL/WARN/IGNORE) are defined in `security/zap/rules.tsv`.

Scans run **only in CI** (GitHub Actions). No Docker is required in the repo: official ZAP actions (`zaproxy/action-baseline`, `zaproxy/action-full-scan`) run on the GitHub runner.

To download reports: **Actions** → **ZAP DAST** workflow → completed job → **Artifacts**.
