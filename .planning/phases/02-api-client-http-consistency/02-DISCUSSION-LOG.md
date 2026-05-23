# Phase 2: API client & HTTP consistency - Discussion Log

> **Audit trail only.** Decisions are in `02-CONTEXT.md`.

**Date:** 2026-04-05  
**Phase:** 2 — API client & HTTP consistency  
**Areas discussed:** Cookie read unification; `register` vs `ApiClient.request`; scope of facade removal

---

## Session shape

Fase técnica com **success criteria** já prescritivos no ROADMAP e dívida explícita em `CONCERNS.md`. A discussão consolidou escolhas de implementação para o planner sem expandir o âmbito (sem BFF, sem remoção total do facade nesta fase).

## Cookie reads (API-01)

| Approach | Notes | Selected |
|----------|-------|----------|
| Export shared readers from `client.ts`; facade delegates | Alinha encoding com `getCookie` | ✓ |
| Duplicar `getCookie` em `api-client.ts` | Risco de drift | |
| Eliminar facade na mesma fase | Scope creep | |

## Register / HTTP (API-02)

| Approach | Notes | Selected |
|----------|-------|----------|
| Document why `fetch` + `parseApiError` (no bearer, no refresh) | Mínimo | ✓ |
| Add `getBaseUrl()` + shared unauthenticated POST helper | Preferido | ✓ (preferência executor) |
| Force `ApiClient.request` for register | Risco de Authorization indevido | ✗ |

## Deferred

- Migração massiva fora de `api-client.ts`; auth HttpOnly.

## Claude's Discretion

- Nomes de funções exportadas; local exacto do helper de POST sem auth.
