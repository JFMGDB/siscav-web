# Phase 1: Planning & contributor documentation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `01-CONTEXT.md`.

**Date:** 2026-04-04  
**Phase:** 1 — Planning & contributor documentation  
**Areas discussed:** GSD artefact alignment; env documentation location & language; README pointer to `.planning/`

---

## Session shape

Fase puramente documental: os **success criteria** em `.planning/ROADMAP.md` já definem o que deve ser verdadeiro (artefactos GSD + `NEXT_PUBLIC_API_URL` documentada). Não houve escolhas de UI/UX de produto. As decisões foram consolidadas por alinhamento ao ROADMAP e ao `PROJECT.md` (idioma PT, brownfield, exclusão de treino de IA).

## Env documentation (PLAN-02)

| Option | Description | Selected |
|--------|-------------|----------|
| README only | Secção no README | |
| `.env.example` only | Ficheiro na raiz | |
| Both | `.env.example` + apontador/README | ✓ |

**User's choice:** Implícito via critérios de fase e consistência com o repo — **ambos** (máxima descoberta).  
**Notes:** Valores placeholder; sem segredos; PT no texto explicativo.

## GSD visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Silent `.planning/` | Sem menção no README | |
| Brief mention | Linha ou bullets sobre `.planning/` para maintainers | ✓ |

**User's choice:** Documentado em CONTEXT como **D-06** — menção breve no README.

## Claude's Discretion

- Redação final das frases no README e comentários em `.env.example`.

## Deferred Ideas

- CONTRIBUTING.md longo; rename de branch legada — ver secção `<deferred>` em CONTEXT.
