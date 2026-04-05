# Phase 5: Auth hook reliability - Context

**Gathered:** 2026-04-04  
**Status:** Ready for planning

<domain>
## Phase Boundary

Tornar o **arranque da sessão** em `AuthProvider` (`src/hooks/use-auth.tsx`) **previsível e auditável**: tratar o bootstrap inicial (tokens em cookies + utilizador em `localStorage`, caminho de refresh sem access token) sem depender de **`eslint-disable` genérico** para `react-hooks/exhaustive-deps` sem explicação. Um revisor deve perceber **por que** o efeito corre como corre e quais dependências são intencionais ou intencionalmente omitidas.

**Inclui:** `src/hooks/use-auth.tsx` e, **se necessário** para coerência de `isLoading` / redirecionamento, ajustes mínimos a `src/app/(auth)/layout.tsx` que consumam o mesmo contrato de estado de auth.

**Exclui:** Mudar modelo de segurança (HttpOnly/BFF — SEC-V2), `middleware` de rotas no servidor, migração completa para `getClientApiClient` em todo o auth, ou novos fluxos de produto (ex. MFA). Polling do monitor (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Bootstrap `useEffect` e `exhaustive-deps` (AUTH-01)

- **D-01:** **Prioridade:** Reestruturar o bootstrap para **não precisar** de `eslint-disable-next-line react-hooks/exhaustive-deps` sem narrativa — por exemplo: efeito(s) com dependências explícitas estáveis, ou extrair inicialização para função `async` com estados de fase (`bootstrapping` / `ready`) que o lint aceite. **Fallback aceitável:** se, após análise, um único efeito “só no mount” for a escolha técnica correta, usar **supressão mínima** (uma linha, regra nomeada) **imediatamente precedida** de um comentário em bloco que explique: o que o efeito faz, por que não incluir `router` / `apiClient` nas deps (ex. referências instáveis ou evitar loops), e que alterações futuras ao efeito devem rever essa decisão.
- **D-02:** Não deixar `eslint-disable` “solto” sem o bloco acima; cumprir roadmap — revisor entende deps ou omissão **de propósito**.

### Corrida refresh / `isLoading` (alinhado a CONCERNS.md)

- **D-03:** Tratar em **ambito desta fase** o caso `refreshToken && !accessToken`: o utilizador não deve ver `isLoading === false` com `user === null` por um lapso evitável **enquanto** o refresh ainda está em curso, de forma que `(auth)/layout.tsx` redirecione para login antes do refresh completar. **Preferência:** modelo explícito (ex. aguardar a promessa de refresh antes de marcar bootstrap como concluído, ou estado intermédio documentado) em vez de apenas documentar o bug.
- **D-04:** Se alterar semântica de `isLoading`, garantir que `AuthLayout` continua coerente (spinner, redirect, sem flash incorrecto); ajustes mínimos ao layout são permitidos por **D-01** em domain.

### Onde documentar

- **D-05:** **Obrigatório:** comentário(ários) no próprio `use-auth.tsx` junto ao efeito / função de bootstrap, legível por quem faz code review. **Opcional:** uma frase neste CONTEXT ou no PLAN a apontar para `.planning/codebase/CONCERNS.md` secção “Auth bootstrap race” se a implementação a invalidar parcialmente.
- **D-06:** Não exigir ficheiro ADR separado nesta fase.

### Verificação

- **D-07:** **Critério principal:** roadmap success #3 — login, refresh e navegação entre rotas autenticadas **verificáveis manualmente** após alteração; checklist curta no plano/verificação é suficiente.
- **D-08:** **Claude's discretion:** teste Jest automatizado para `AuthProvider` só se for **barato** (sem mock excessivo de Next router) e não atrasar a fase; não é must-have para fechar AUTH-01.

### Claude's Discretion

- Forma exacta do estado de bootstrap (`useReducer` vs múltiplos `useState` vs `useRef` para “ran once”).
- Texto exacto dos comentários (PT ou EN — seguir tom do ficheiro actual).
- Se um único efeito ou dois efeitos separados (cookies vs refresh).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements e roadmap

- `.planning/REQUIREMENTS.md` — **AUTH-01**
- `.planning/ROADMAP.md` — Phase 5 goal e success criteria (três bullets)
- `.planning/codebase/CONCERNS.md` — “Lint rule suppression” (`use-auth.tsx`), “Auth bootstrap race” (`use-auth.tsx`, `(auth)/layout.tsx`)

### Código

- `src/hooks/use-auth.tsx` — `AuthProvider`, bootstrap `useEffect`, `login` / `logout` / `register`
- `src/app/(auth)/layout.tsx` — consumo de `user`, `isLoading`, redirect
- `src/lib/api-client.ts` — `getAccessToken`, `getRefreshToken`, `refreshTokens`, `clearTokens` (facade usada pelo hook)

No external ADR beyond repository paths above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `apiClient` facade já centraliza tokens e refresh; o hook não deve duplicar parsing de cookies.
- `AUTH_CONFIG.USER_KEY` e `ROUTES` em `src/constants` já definem chaves e navegação.

### Established Patterns

- App Router cliente: `useRouter()` de `next/navigation` em provider e layout.
- Layout autenticado assume `isLoading` então redirect se `!user`.

### Integration Points

- Qualquer mudança em `isLoading` ou momento de `setUser` após refresh afecta directamente `src/app/(auth)/layout.tsx` e possível flash de conteúdo protegido.

</code_context>

<specifics>
## Specific Ideas

Contexto recolhido com **selecção interactiva omitida**; decisões acima reflectem prioridades **recomendadas** para AUTH-01 + CONCERNS (efeito + corrida de refresh). Ajustar após revisão do utilizador se necessário.

</specifics>

<deferred>
## Deferred Ideas

- HttpOnly cookies / BFF, CSP, middleware de servidor — fora do âmbito (REQUIREMENTS v2 / roadmap).
- Testes extensivos de `ApiClient` 401/refresh — backlog TEST-V2; esta fase só discreção D-08.

### Reviewed Todos (not folded)

- Nenhum todo em match para phase 5.

</deferred>

---
*Phase: 05-auth-hook-reliability*  
*Context gathered: 2026-04-04*
