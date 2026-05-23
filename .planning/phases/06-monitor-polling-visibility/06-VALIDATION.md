---
status: passed
phase: 06-monitor-polling-visibility
updated: 2026-04-05
---

# Phase 6 — Validation record

## Goal (from roadmap)

O monitor deixa de gastar rede/CPU desnecessariamente quando o separador não está visível.

## Requirement

| ID | Evidence |
|----|----------|
| PERF-01 | `use-monitor-capture.ts` — `refetchInterval` false quando `visibilityState === 'hidden'`; intervalo 3000 ms quando `visible`; `refetchOnWindowFocus: true`; refetch ao voltar de hidden |

## Automated checks run

- `npm run build`: **pass**
- `npm test`: **pass** (18 tests)
- `npx eslint src/hooks/use-monitor-capture.ts`: **pass**

## Human verification

1. Abrir a rota **Monitor** com sessão válida e DevTools → **Network**.
2. Com o separador **visível**, confirmar pedidos periódicos ao endpoint de logs / última captura (~3 s).
3. Mudar para outro separador ou minimizar a janela até `document.visibilityState` ser **hidden**; confirmar que **não** há o mesmo ritmo de pedidos de 3 s (cessar ou ficar sem novos pedidos periódicos).
4. Voltar ao separador da app; confirmar que os pedidos **retomam** sem **reload** manual da página.

## Verdict

**passed** — planos `06-01-PLAN.md` e `06-02-PLAN.md` satisfeitos no código e na documentação.
