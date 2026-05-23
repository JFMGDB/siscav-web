---
status: passed
phase: 04-monitor-ux-capture-truthfulness
updated: 2026-04-04
---

# Phase 4 verification

## Goal (from roadmap)

Operadores percebem claramente falhas de rede/API vs. ausência de dados, e não veem confiança inventada nas capturas.

## Requirement IDs

| ID | Evidence |
|----|----------|
| MON-01 | `getLastCapture` sem catch que devolve `null`; `PlateRecognitionDisplay` — `Alert` + “Tentar novamente” + `refetch`; ordem `isError` antes de loading/vazio |
| MON-02 | `Capture.confidence` opcional; sem `0.95` em `monitor.ts`; bloco “Confiança” só com `typeof confidence === 'number'` |

## Automated checks run

- `npm run build`: pass
- `npm test`: pass (18 tests)

## Human verification

Recomendado: com API parada ou URL inválida, confirmar mensagem de erro vs. ecrã “Sem leituras recentes” com API OK e lista vazia.

## Verdict

**passed** — planos `04-01-PLAN.md` e `04-02-PLAN.md` executados; critérios MON-01/MON-02 satisfeitos no código.
