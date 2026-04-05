# Roadmap: SISCAV-Web

## Overview

Este marco **brownfield** formaliza o planejamento GSD e reduz dívida técnica focada em cliente HTTP/tokens, tipagem na UI e em DTOs, clareza do monitor (erros vs. vazio, confiança real), fiabilidade do bootstrap de auth e polling responsivo ao separador. A ordem começa por artefactos de planejamento e documentação para contribuidores, segue pela base HTTP, depois tipos e experiência do monitor, fecha com fiabilidade de sessão e desempenho do polling, e acrescenta **pré-visualização de câmara** (USB / URL na rede) no browser, sem stream de vídeo pela API no MVP.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Planning & contributor documentation** — PROJECT/REQUIREMENTS/ROADMAP/STATE alinhados; variável de API documentada para novos contribuidores
- [x] **Phase 2: API client & HTTP consistency** — Tokens/cookies coerentes entre clientes; registo com mesmo contrato de erros que o resto da API
- [x] **Phase 3: Type safety & UI data** — DataTable, LogsTable e devices com tipos explícitos em vez de `any`/`unknown` soltos
- [x] **Phase 4: Monitor UX & capture truthfulness** — Falhas distinguíveis de “sem dados”; `confidence` só se vier da API ou ausente na UI — **Complete 2026-04-04**
- [x] **Phase 5: Auth hook reliability** — Bootstrap de auth sem suprimir `exhaustive-deps` sem estratégia estável documentada — **Complete 2026-04-05**
- [x] **Phase 6: Monitor polling & visibility** — Polling não mantém carga desnecessária com o separador em segundo plano — **Complete 2026-04-05**
- [x] **Phase 7: Pré-visualização de câmara (USB e Wi‑Fi)** — Preview em tempo real no browser (`getUserMedia`, URL MJPEG/HLS); sem stream via API SISCAV no MVP — **Complete 2026-04-05**

## Phase Details

### Phase 1: Planning & contributor documentation
**Goal**: O repositório reflete o produto e o escopo acordado, e quem entra no projeto sabe como apontar o frontend à API.
**Depends on**: Nothing (first phase)
**Requirements**: PLAN-01, PLAN-02
**Success Criteria** (what must be TRUE):
  1. `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` e `STATE.md` existem e descrevem o painel brownfield, exclusão de treino de IA e foco formalização + higiene.
  2. Um revisor consegue confirmar em menos de dois minutos que o escopo v1 nas REQUIREMENTS corresponde ao que o ROADMAP cobre (12 requisitos v1, sem órfãos).
  3. `NEXT_PUBLIC_API_URL` está documentada para novos contribuidores (`.env.example` e/ou README), com texto suficiente para configurar ambiente local.
**Plans**: 2 plans

Plans:

- [x] `01-PLAN-01.md` — Verificação PLAN-01, traceability v1 (11/0) e marcação do requisito
- [x] `01-PLAN-02.md` — `NEXT_PUBLIC_API_URL`, `.env.example`, README (Configuração + Planeamento), excepção `!.env.example` no `.gitignore`

### Phase 2: API client & HTTP consistency
**Goal**: Chamadas e persistência de sessão comportam-se de forma previsível e unificada em todo o cliente HTTP.
**Depends on**: Phase 1
**Requirements**: API-01, API-02
**Success Criteria** (what must be TRUE):
  1. Leitura e gravação de tokens/cookies são consistentes entre `src/lib/api/client.ts` e `src/lib/api-client.ts` (ou o duplicado foi eliminado com facade segura documentada no código).
  2. O fluxo `register` em `src/lib/api/auth.ts` usa o mesmo caminho de tratamento de erro/HTTP que o restante do cliente, ou a excepção documentada está visível no código para quem mantém o projeto.
  3. Um operador de código consegue seguir um único “caminho feliz” para autenticação HTTP sem encontrar regras contraditórias entre os dois ficheiros de cliente.
**Plans**: 2 plans

Plans:

- [x] `02-01-PLAN.md` — API-01: cookie read helpers exported from `client.ts`; facade `getAccessToken` / `getRefreshToken` delegate (D-01–D-03)
- [x] `02-02-PLAN.md` — API-02: `ApiClient.getBaseUrl()`; `register` sem bearer, `parseApiError`, comentário de manutenção (D-04–D-06); depende de 02-01

### Phase 3: Type safety & UI data
**Goal**: Tabelas e dados de API usados na UI têm tipos alinhados ao domínio, reduzindo `any` e `as any` desnecessários.
**Depends on**: Phase 2
**Requirements**: TYP-01, TYP-02, TYP-03
**Success Criteria** (what must be TRUE):
  1. `DataTable` não depende de `any` para colunas/linhas onde é possível expressar generics ou tipos de domínio.
  2. `LogsTable` trata o `onChange` do filtro sem `as any`, mantendo typecheck limpo nesse ponto.
  3. `src/lib/api/devices.ts` expõe DTOs ou tipos concretos alinhados a `src/types/` em vez de `unknown` genérico para consumidores.
**Plans**: 3 plans
**UI hint**: yes

Plans:

- [x] `03-01-PLAN.md` — TYP-01: `DataTable` column/cell typing; `WhitelistTable` + `LogsTable` column defs (Select cast deferred to 03-02)
- [x] `03-02-PLAN.md` — TYP-02: `LogsTable` MUI `Select` typed `onChange`; depends on 03-01
- [x] `03-03-PLAN.md` — TYP-03: device DTOs in `src/types/`, `devices.ts` + `api-client` signatures

### Phase 4: Monitor UX & capture truthfulness
**Goal**: Operadores percebem claramente falhas de rede/API vs. ausência de dados, e não veem confiança inventada nas capturas.
**Depends on**: Phase 3
**Requirements**: MON-01, MON-02
**Success Criteria** (what must be TRUE):
  1. Quando `getLastCapture` ou a cadeia de logs em `monitor.ts` falha, a UI do monitor mostra estado ou mensagem de erro distinguível de “ainda não há captura/dados”.
  2. O campo `confidence` nas capturas apresentado ao utilizador só aparece se vier da API; caso contrário não é mostrado um valor fixo inventado (ex. 0,95).
  3. Em cenário de API indisponível, um operador consegue explicar em palavras o que viu no ecrã sem confundir com “lista vazia normal”.
**Plans**: 2 plans
**UI hint**: yes

Plans:

- [x] `04-01-PLAN.md` — MON-01/MON-02 data: `getLastCapture` propaga erros; `Capture.confidence` opcional; sem `0.95`
- [x] `04-02-PLAN.md` — MON-01/MON-02 UI: hook `isError`/`isFetching`; `PlateRecognitionDisplay` conforme `04-UI-SPEC.md`; depende de 04-01

### Phase 5: Auth hook reliability
**Goal**: O arranque da sessão em `use-auth` é estável e as excepções ao lint de dependências estão justificadas.
**Depends on**: Phase 4
**Requirements**: AUTH-01
**Success Criteria** (what must be TRUE):
  1. O bootstrap de auth em `use-auth.tsx` não depende de suprimir `exhaustive-deps` sem comentário ou padrão que explique a estratégia (efeitos/callbacks documentados).
  2. Um revisor consegue entender por que as dependências do efeito são as que são, sem “eslint-disable” genérico sem contexto.
  3. Fluxos normais de login, refresh e navegação entre rotas autenticadas continuam verificáveis manualmente após a alteração.
**Plans**: 2 plans

Plans:

- [x] `05-01-PLAN.md` — AUTH-01: async bootstrap, await refresh, exhaustive-deps satisfied or documented in `use-auth.tsx`
- [x] `05-02-PLAN.md` — AUTH-01: `AuthLayout` review, `05-VALIDATION.md`, build + test; depende de 05-01

### Phase 6: Monitor polling & visibility
**Goal**: O monitor deixa de gastar rede/CPU desnecessariamente quando o separador não está visível.
**Depends on**: Phase 5
**Requirements**: PERF-01
**Success Criteria** (what must be TRUE):
  1. Com o separador do monitor em segundo plano (`document.visibilityState` hidden), o polling configurado em `use-monitor-capture.ts` / `UI_CONFIG.POLLING` pausa ou reduz actividade conforme a implementação acordada, evitindo carga contínua idêntica ao primeiro plano.
  2. Ao voltar o separador a visível, o monitor retoma atualizações dentro do comportamento esperado (sem exigir reload manual para recuperar dados).
  3. Um operador ou desenvolvedor consegue confirmar via DevTools de rede que os pedidos periódicos diminuem ou cessam enquanto o separador está em background.
**Plans**: 2 plans
**UI hint**: yes

Plans:

- [x] `06-01-PLAN.md` — PERF-01: visibility-aware `refetchInterval` + resume refetch + `refetchOnWindowFocus` in `use-monitor-capture.ts`
- [x] `06-02-PLAN.md` — PERF-01: `06-VALIDATION.md`, `06-VERIFICATION.md`, build + test; depende de 06-01

### Phase 7: Pré-visualização de câmara (USB e Wi‑Fi)
**Goal**: O operador liga uma câmara **USB** (`getUserMedia` + `<video>`) ou uma fonte **rede** (URL MJPEG / HLS / snapshot) e vê **preview contínuo** no painel Next.js; tráfego de vídeo é **browser ↔ câmara/URL**, não pela API SISCAV no MVP descrito em `07-PRD.md`.
**Depends on**: Phase 6
**Requirements**: CAM-01
**Success Criteria** (what must be TRUE):
  1. Fluxo USB: escolha de câmara, permissão, stream em `<video>` com cleanup ao desmontar/trocar fonte; HTTPS ou localhost em dev.
  2. Fluxo rede: campo URL, validação básica (sem `javascript:`), preview via `<img>` (MJPEG) ou `<video>` (+ `hls.js` se necessário); mensagens para mixed content / erro de rede.
  3. Estados de UI: a aguardar permissão, a carregar, erro, activo; documentar limitações (Safari iOS, CORS) no README ou doc da fase.
**Plans**: 2 plans
**UI hint**: yes

Plans:

- [x] `07-01-PLAN.md` — CAM-01: `/camera`, USB + rede, `validate-camera-url`, `hls.js`, Sidebar
- [x] `07-02-PLAN.md` — CAM-01: README, `07-VALIDATION.md`, `07-VERIFICATION.md`, ROADMAP/REQUIREMENTS; depende de 07-01

**Canonical implementation guide:** `07-PRD.md` nesta pasta de fase.

## Progress

**Execution Order:**

Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Planning & contributor documentation | 2/2 | Complete | 2026-04-05 |
| 2. API client & HTTP consistency | 2/2 | Complete | 2026-04-05 |
| 3. Type safety & UI data | 3/3 | Complete | 2026-04-05 |
| 4. Monitor UX & capture truthfulness | 2/2 | Complete | 2026-04-04 |
| 5. Auth hook reliability | 2/2 | Complete | 2026-04-05 |
| 6. Monitor polling & visibility | 2/2 | Complete | 2026-04-05 |
| 7. Pré-visualização de câmara (USB e Wi‑Fi) | 2/2 | Complete | 2026-04-05 |
