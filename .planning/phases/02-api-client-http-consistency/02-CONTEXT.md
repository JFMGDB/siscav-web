# Phase 2: API client & HTTP consistency - Context

**Gathered:** 2026-04-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega um **caminho único e previsível** para leitura/escrita de tokens em browser e para tratamento de erros HTTP no registo, sem alterar o contrato público da API nem o modelo de auth (JWT em cookies). Escopo fixo pelos requisitos **API-01** e **API-02** e pelos success criteria da fase 2 no ROADMAP. Não inclui HttpOnly/BFF, `middleware` de auth, nem remoção total do facade `api-client.ts` salvo se couber dentro das mesmas alterações sem expandir fases.

</domain>

<decisions>
## Implementation Decisions

### Leitura de cookies no browser (API-01)

- **D-01:** A origem de verdade para ler `access_token` e `refresh_token` do `document.cookie` no cliente é a mesma função (ou par de funções exportadas) usada pelo singleton `getClientApiClient()` — com **URL-encoding/decoding** alinhado a `getCookie` em `src/lib/api/client.ts` (hoje privada). Não manter o parse manual por `split(';')` + `startsWith` em `src/lib/api/api-client.ts` para estes tokens.
- **D-02:** Implementação preferida: **exportar** de `client.ts` helpers mínimos (ex. `readBrowserAccessToken()` / `readBrowserRefreshToken()` ou `readAuthCookie(name: string)` usando `AUTH_CONFIG.ACCESS_TOKEN_KEY` / `REFRESH_TOKEN_KEY`) e fazer `apiClient.getAccessToken` / `getRefreshToken` delegarem exclusivamente neles. O singleton `getClientSingleton` continua a usar a mesma lógica interna (refactor para chamar os mesmos helpers, evitando duplicação).
- **D-03:** `setAccessToken` / `setRefreshToken` no facade permanecem **no-op** documentados (cookies definidos via `login` / `setTokens` no `ApiClient`); não reintroduzir escrita duplicada sem necessidade.

### Registo (`register`) e erros HTTP (API-02)

- **D-04:** O registo **não** deve usar `ApiClient.request()` tal como está se isso anexar `Authorization` de uma sessão existente; o comportamento desejado é pedido **sem bearer**, com corpo JSON e erros via `parseApiError` (já importado de `./client`).
- **D-05:** **Mínimo aceite:** comentário de manutenção visível em `src/lib/api/auth.ts` (bloco curto acima de `register`) a explicar: sem token; sem ciclo de refresh em 401; uso de `parseApiError` alinhado ao resto do cliente; `BASE_URL` alinhado a `API_CONFIG` (igual ao `baseUrl` do cliente).
- **D-06:** **Preferido pelo planner/executor:** extrair um helper interno partilhado (ex. `postJsonNoAuth` em `auth.ts` ou método estático/`rawFetch` no `ApiClient`) que use explicitamente o `baseUrl` do `ApiClient` — para isso, expor **`getBaseUrl()`** (ou getter público read-only) em `ApiClient` para evitar drift entre `API_CONFIG.BASE_URL` e instância. Se o executor julgar o getter excessivo, manter `API_CONFIG.BASE_URL` **desde que** o comentário em D-05 mencione equivalência com o cliente.

### Testes e regressão

- **D-07:** Após alterações, correr `npm run build` e `npm test`. Corrigir testes que dependam de comportamento antigo apenas se o comportamento antigo for bug (ex. cookies codificados); caso contrário actualizar expectativas com justificativa no commit.

### Claude's Discretion

- Nomes exactos dos helpers exportados em `client.ts`.
- Se `register` passa a método em `ApiClient` ou ficheiro auxiliar, desde que D-04–D-06 sejam respeitados.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e requisitos

- `.planning/ROADMAP.md` — Secção Phase 2 (goal, API-01, API-02, success criteria).
- `.planning/REQUIREMENTS.md` — API-01, API-02 e traceability.
- `.planning/PROJECT.md` — Stack e limites (auth no cliente, siscav-api).

### Dívida e arquitectura existentes

- `.planning/codebase/CONCERNS.md` — Secções “Dual API client surface”, “Cookie read path divergence”, “Inconsistent HTTP entry for auth”.
- `.planning/codebase/ARCHITECTURE.md` — Camada API, facade `api-client.ts`, `ApiClient`.

### Código (fonte de verdade)

- `src/lib/api/client.ts` — `getCookie`, singleton, `parseApiError`, `ApiClient.request` / refresh.
- `src/lib/api-client.ts` — Facade; `getAccessToken` / `getRefreshToken` a alinhar.
- `src/lib/api/auth.ts` — `register`, `login`.
- `src/hooks/use-auth.tsx` — Consumidor de `apiClient.getAccessToken` / `getRefreshToken`.
- `src/constants/index.ts` — `API_CONFIG`, `AUTH_CONFIG`.

### Fase anterior (contexto carry-over)

- `.planning/phases/01-planning-contributor-documentation/01-CONTEXT.md` — Decisões D-01–D-06 (documentação); não contradizer.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `parseApiError` e `ApiClient` já centralizam retry/refresh em `request()`; registo deve permanecer fora desse caminho por razão de sem bearer (D-04).
- `AUTH_CONFIG.ACCESS_TOKEN_KEY` / `REFRESH_TOKEN_KEY` — nomes canónicos das chaves de cookie.

### Established Patterns

- Cookies definidos com `encodeURIComponent` / `decodeURIComponent` e `SameSite=Lax` em `client.ts`.
- Facade delega operações de domínio a `getClientApiClient()` excepto leitura legacy de tokens em `apiClient`.

### Integration Points

- `use-auth` depende de `getAccessToken` / `getRefreshToken` do facade; qualquer mudança deve preservar assinaturas públicas ou actualizar todos os call sites na mesma fase.

</code_context>

<specifics>
## Specific Ideas

- Comentário em `auth.ts` deve ser português ou inglês conforme o ficheiro (hoje misto/inglês em tipos); preferir consistência com o bloco existente em `client.ts` (inglês).

</specifics>

<deferred>
## Deferred Ideas

- **Remoção completa** de `src/lib/api-client.ts` e migração de todos os call sites para `getClientApiClient()` — útil no longo prazo; **fora** do mínimo da fase 2 se exigir refactors largos em features.
- **HttpOnly cookies / BFF** — v2 em PROJECT/REQUIREMENTS.

</deferred>

---

*Phase: 02-api-client-http-consistency*  
*Context gathered: 2026-04-05*
