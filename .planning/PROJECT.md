# SISCAV-Web

## What This Is

Frontend administrativo do **Sistema de Controle de Entrada Automática de Veículos (SISCAV)**: painel web em **Next.js** (App Router) que se integra ao backend **`siscav-api`** via REST. Administradores autenticam-se, gerenciam a whitelist de placas, consultam logs de acesso (com imagens), acompanham o monitor/captura e acionam o portão; há também fluxos de dispositivos (ex. Bluetooth) em configurações.

## Core Value

Operadores conseguem **controlar e auditar o acesso de veículos** de forma confiável: whitelist correta, visibilidade dos eventos e acionamento do portão quando necessário, sem depender de uma interface de treino de modelo ou de features fora do escopo operacional.

## Requirements

### Validated

- ✓ Login e sessão com JWT (cookies + refresh) — existente (`src/hooks/use-auth.tsx`, `src/lib/api/client.ts`); **Phase 5:** bootstrap aguarda `refreshTokens` quando só há refresh cookie; `useEffect` mount-only documentado sem `eslint-disable` de `exhaustive-deps`
- ✓ CRUD da whitelist de veículos autorizados — existente (`src/app/(auth)/whitelist/`, `src/lib/api/whitelist.ts`)
- ✓ Visualização de logs de acesso e imagens associadas — existente (`src/app/(auth)/logs/`, `src/lib/api/logs.ts`)
- ✓ Monitor / captura com polling — existente (`src/app/(auth)/monitor/`, `src/hooks/use-monitor-capture.ts`); **Phase 4:** erros de API distinguíveis de lista vazia; confiança só quando existir valor da API (`PlateRecognitionDisplay`, `getLastCapture`); **Phase 6:** polling da última captura pausa com separador/documento em background (`visibilityState`), retoma ao visível
- ✓ Acionamento remoto do portão — existente (`src/lib/api/gate.ts`, feature gate)
- ✓ Dashboard e navegação autenticada (sidebar, rotas `(auth)`) — existente (`src/app/(auth)/`, `src/components/ui/Sidebar.tsx`)
- ✓ Configurações e fluxos de dispositivos (Bluetooth, vídeo) — existente (`src/components/features/settings/`)
- ✓ Integração configurável com API via `NEXT_PUBLIC_API_URL` — existente (`src/constants/index.ts`)

### Active

- [ ] Formalizar planejamento GSD (este repositório): `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` e `STATE.md` alinhados ao produto atual
- [ ] Reduzir dívida técnica e fragilidades documentadas em `.planning/codebase/CONCERNS.md` (cliente HTTP unificado, tipagem, erros do monitor, polling, consistência de cookies, etc.)
- [ ] Manter CI verde e documentação de desenvolvimento útil (ex. variáveis de ambiente) à medida que o código evoluir

### Out of Scope

- **Interface ou fluxo dedicado a treino de IA** — não é foco deste marco; não planejar nem investir aqui (remover vestígios se aparecerem fora do escopo do produto)
- **Substituição completa do modelo de auth por HttpOnly/BFF** — reconhecido como melhoria maior; fica para decisão futura (pode entrar como marco separado)
- **App mobile nativo** — fora do escopo do repositório web

## Context

- **Brownfield:** Código em produção com stack Next.js 16, React 19, MUI, TanStack Query; backend separado (`siscav-api`).
- **Mapa do codebase:** `.planning/codebase/` (STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS) — atualizado em 2026-04-04.
- **Pesquisa de domínio paralela (GSD research):** não executada nesta inicialização; o mapa existente cobre o estado atual do repositório. Pesquisa ad-hoc pode ser ligada por fase via `/gsd-settings` ou `/gsd-plan-phase`.

## Constraints

- **Stack:** Manter alinhamento com `package.json` / CI (Node 20, Next.js, TypeScript strict) salvo decisão explícita de migração
- **Backend:** Contratos e auth dependem de `siscav-api`; o frontend não persiste domínio além de estado de UI e tokens no cliente
- **Compatibilidade:** Navegadores suportados pelos fluxos atuais (incl. APIs como Web Bluetooth onde usadas)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Escopo GSD = formalização + higiene (focos 1 e 2) | Prioridade do utilizador; sem feature grande nova neste marco | — Pending |
| Excluir interface de treino de IA | Não é necessidade do produto administrativo atual | — Pending |
| Pesquisa GSD inicial omitida | Mapa de codebase e CONCERNS já informam planejamento | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-05 after phase 6 (monitor polling & visibility)*
