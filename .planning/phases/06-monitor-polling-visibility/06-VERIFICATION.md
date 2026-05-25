---
status: passed
phase: 06-monitor-polling-visibility
updated: 2026-04-05
---

# Phase 6 verification

## Goal (from roadmap)

Polling do monitor não mantém carga desnecessária com o separador em segundo plano; retoma ao voltar visível.

## Requirement IDs

| ID | Evidence |
|----|----------|
| PERF-01 | `useSyncExternalStore` + `refetchInterval` condicional + refetch na transição hidden→visible; `refetchOnWindowFocus: true` neste `useQuery` |

## Automated checks run

- `npm run build`: pass
- `npm test`: pass (18 tests)
- `npx eslint src/hooks/use-monitor-capture.ts`: pass

## Human verification

Ver `06-VALIDATION.md` — passos DevTools e separador em background.

## Verdict

**passed** — critérios de roadmap para Phase 6 cumpridos.
