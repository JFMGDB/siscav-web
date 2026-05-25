# Phase 1: Planning & contributor documentation - Context

**Gathered:** 2026-04-04  
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega: (1) confirmação de que os artefactos GSD (PROJECT, REQUIREMENTS, ROADMAP, STATE) descrevem o produto brownfield, exclusão de treino de IA e foco em formalização + higiene; (2) documentação suficiente para um novo contribuidor configurar o apontamento ao backend via `NEXT_PUBLIC_API_URL`. Não inclui alterações de código de negócio nem features novas — apenas documentação e, se necessário, ficheiros de exemplo de ambiente.

</domain>

<decisions>
## Implementation Decisions

### Artefactos GSD e alinhamento (PLAN-01)

- **D-01:** Manter `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` e `.planning/STATE.md` como fonte de verdade do escopo; qualquer desvio de produto atualiza-se primeiro no PROJECT e depois propaga-se a REQUIREMENTS/ROADMAP na transição de fase.
- **D-02:** Critério de “alinhado” para PLAN-01: um revisor consegue em ≤2 minutos confirmar que os 11 requisitos v1 estão mapeados nas fases sem órfãos (tabela de traceability em REQUIREMENTS) e que o README ou docs citados não contradizem o “What This Is” do PROJECT.

### Variável de ambiente e onboarding (PLAN-02)

- **D-03:** Documentar `NEXT_PUBLIC_API_URL` em **dois sítios**: ficheiro **`.env.example`** na raiz (valores placeholder, sem segredos) **e** secção curta no **`README.md`** (pré-requisitos ou “Configuração”) que explique que o frontend aponta para `siscav-api` e que a variável define a base URL. Isto satisfaz o critério do ROADMAP (“`.env.example` e/ou README”) com máxima descoberta.
- **D-04:** Conteúdo mínimo de `.env.example`: linha comentada ou com placeholder para `NEXT_PUBLIC_API_URL=` (ex. `http://localhost:8000`) e comentário de uma linha a referir que o backend é o repositório `siscav-api` / API local típica na porta 8000 — alinhado a `src/constants/index.ts`.
- **D-05:** Idioma da documentação de ambiente: **português**, consistente com o README existente; termos técnicos (`NEXT_PUBLIC_*`, URL) mantêm-se em inglês conforme convenção Next.js.

### Visibilidade do planeamento para contribuidores

- **D-06:** Incluir no README uma linha ou bullets curtos sob “Estrutura do Projeto” ou nova subsecção mínima (“Planeamento”) a indicar que a pasta `.planning/` contém contexto GSD (roadmap, requisitos) para quem mantém o projeto — sem obrigar novos contribuidores a usar GSD para uma alteração pontual.

### Claude's Discretion

- Redação exacta dos parágrafos no README e comentários em `.env.example` (tom e ordem das frases).
- Se o repositório já tiver `.gitignore` a ignorar `.env*`, não é necessário alterar — apenas garantir que `.env.example` **não** está ignorado.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e requisitos

- `.planning/PROJECT.md` — Visão do produto, Validated/Active/Out of scope (incl. exclusão de interface de treino de IA).
- `.planning/REQUIREMENTS.md` — PLAN-01, PLAN-02 e traceability v1.
- `.planning/ROADMAP.md` — Fase 1: goal, requisitos e success criteria (fonte dos critérios de aceitação desta fase).
- `.planning/STATE.md` — Foco actual e progresso.

### Implementação da variável pública

- `src/constants/index.ts` — `API_CONFIG.BASE_URL` e uso de `NEXT_PUBLIC_API_URL`.

### Mapa do codebase (contexto brownfield)

- `.planning/codebase/INTEGRATIONS.md` — Integração com `siscav-api` e env vars.
- `.planning/codebase/CONVENTIONS.md` — Estilo e convenções do repo.

Não há ADRs externos — requisitos adicionais estão nos documentos acima.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- N/A para código de aplicação nesta fase; alterações limitam-se a documentação e `.env.example`.

### Established Patterns

- README já em português com estrutura de secções (Visão, Funcionalidades, Instalação, Scripts, CI).
- Constantes de API centralizadas em `src/constants/index.ts`.

### Integration Points

- Contribuidores seguem README + `.env.example` para alinhar `npm run dev` com uma instância de `siscav-api` em desenvolvimento.

</code_context>

<specifics>
## Specific Ideas

- Mencionar explicitamente no README ou em `.env.example` que o default de desenvolvimento costuma ser `http://localhost:8000` quando a variável não está definida (comportamento actual do código).

</specifics>

<deferred>
## Deferred Ideas

- **CONTRIBUTING.md** extenso ou guias de arquitetura adicionais — fora do mínimo da fase 1; pode ser fase futura se a equipa crescer.
- Renomear branch `feature/ai-training-interface` — operação de git/workflow, não bloqueia PLAN-01/02.

</deferred>

---

*Phase: 01-planning-contributor-documentation*  
*Context gathered: 2026-04-04*
