# ADR 0010: Vercel frontend deployment

## Status

Accepted.

## Context

The Mantis web application is a Next.js App Router frontend that consumes the SISCAV FastAPI backend through `NEXT_PUBLIC_MANTIS_API_URL`. The project needs a stable production URL to share with stakeholders while development continues in the repository.

The deployment target should keep operational overhead low, support production and preview deployments, and avoid changing the frontend architecture.

## Decision

- Deploy `siscav-web` to Vercel.
- Use the Vercel production domain or a custom domain as the stable public URL.
- Keep preview deployments for branch validation, but do not share preview URLs as delivery links.
- Configure `NEXT_PUBLIC_MANTIS_API_URL` in Vercel production to point to the stable Render API URL.
- Keep the existing `npm run build` build command and npm lockfile based install flow.
- Set an explicit Node.js version only if the validated Vercel build/runtime requires it.

## Consequences

- The frontend gets first-class Next.js hosting with minimal project changes.
- Future production deploys can update the app behind the same URL.
- API URL changes require a new frontend build because `NEXT_PUBLIC_*` variables are embedded at build time.
- CORS must be configured on the API to allow the stable Vercel production origin.

## Alternatives considered

- **Render for the frontend and API:** Viable, but weaker for this Next.js App Router app than Vercel's native Next.js deployment workflow.
- **Vercel for both frontend and API:** Rejected for the current release because the FastAPI API uses long-running service semantics and local upload persistence, which fit a web service better than Vercel Python serverless functions.
