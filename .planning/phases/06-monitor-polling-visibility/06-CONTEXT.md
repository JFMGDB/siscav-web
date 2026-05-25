# Phase 6: Monitor polling & visibility - Context

**Gathered:** 2026-04-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Reduzir **carga de rede/CPU** do polling da **última captura** quando o **separador/documento não está visível** (`document.visibilityState === 'hidden'`), mantendo o intervalo actual (**`UI_CONFIG.POLLING.CAPTURE_INTERVAL`**, hoje 3000 ms) quando o utilizador está a ver a app no primeiro plano. Ao voltar a visível, o monitor deve **retomar** atualizações sem exigir reload manual, e o comportamento deve ser **observável** em DevTools (pedidos periódicos cessam ou diminuem claramente em background).

**Inclui:** `src/hooks/use-monitor-capture.ts`, constantes em `src/constants/index.ts` **se** for necessário expor um valor (ex. intervalo “lento” — só se a estratégia escolhida o exigir; a opção por defeito abaixo **não** exige intervalo em background).

**Exclui:** Streaming de vídeo real, novos endpoints, alterar copy/estados de erro do cartão de captura (Phase 4), polling de **outras** features fora do query `lastCapture` salvo menção explícita no plano como follow-up opcional.

</domain>

<decisions>
## Implementation Decisions

### Comportamento em background (PERF-01, roadmap §1 e §3)

- **D-01:** Com `document.visibilityState === 'hidden'`, o polling periódico da última captura deve **parar por completo** — em TanStack Query v5: `refetchInterval` efectivamente **desactivado** (`false` / `0` conforme API suportada) enquanto hidden, **não** manter 3000 ms idêntico ao primeiro plano.
- **D-02:** Com documento **visível**, restaurar `refetchInterval: UI_CONFIG.POLLING.CAPTURE_INTERVAL` (valor actual 3000 ms salvo ajuste documentado).

### Retoma ao foco (roadmap §2)

- **D-03:** Ao transitar de `hidden` → `visible`, **refetch explícito** da query `lastCapture` **uma vez** (ex. `refetch()` do `useQuery` ou `queryClient.invalidateQueries` no handler de `visibilitychange`) para dados frescos sem esperar o próximo tick de 3 s — além disso, manter **`refetchOnWindowFocus: true`** (default do QueryClient se já global; se o hook sobrescrever opções, definir `true` explicitamente no `useQuery` deste hook) para alinhar com mudança de janela.

### Onde implementar

- **D-04:** Lógica de visibilidade **dentro de** `src/hooks/use-monitor-capture.ts` (listener `visibilitychange` + estado derivado ou `useSyncExternalStore` para subscrever `document.visibilityState`). **Não** exigir alterações a `PlateRecognitionDisplay` ou `monitor/page.tsx` salvo o planner detetar necessidade real (preferência: **zero** mudanças de UI).

### Âmbito das queries

- **D-05:** Aplicar política **apenas** ao `useQuery` com chave `['monitor', 'lastCapture']` — não alterar outros `useQuery` da app nesta fase.

### SSR / cliente

- **D-06:** Código `'use client'`; ao ler `document`, proteger para ambiente browser (evitar acesso durante SSR do módulo).

### Claude's Discretion

- Implementação exacta: `useEffect` + `addEventListener` vs `useSyncExternalStore` para `visibilityState`.
- Pequeno debounce ao tornar visível (só se necessário para evitar double-fetch com focus) — preferência **sem** debounce inicial.
- Teste Jest: opcional (mock `document.hidden`); **não** bloquear PERF-01 se o plano priorizar verificação manual + build.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements e roadmap

- `.planning/REQUIREMENTS.md` — **PERF-01**
- `.planning/ROADMAP.md` — Phase 6 goal e três success criteria
- `.planning/phases/04-monitor-ux-capture-truthfulness/04-CONTEXT.md` — exclusão explícita de visibility na Phase 4 (agora revogada só para Phase 6)
- `.planning/codebase/CONCERNS.md` — “Fixed-interval polling” / monitor

### Código

- `src/hooks/use-monitor-capture.ts` — `useQuery`, `refetchInterval`
- `src/constants/index.ts` — `UI_CONFIG.POLLING.CAPTURE_INTERVAL`
- `src/components/features/monitor/PlateRecognitionDisplay.tsx` — consumidor (ler só se o plano tocar na superfície do hook)

### API do produto

- [MDN — Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) — `document.visibilityState`, evento `visibilitychange`

No repositório: sem ADR adicional exigido para esta fase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- TanStack Query `useQuery` já centraliza polling; `refetchInterval` pode ser número ou função dinâmica na v5 — validar na versão pinada do projeto.
- Intervalo único de verdade: `UI_CONFIG.POLLING.CAPTURE_INTERVAL`.

### Established Patterns

- Monitor page é client; hook já `use client`.

### Integration Points

- Qualquer mudança em `refetch`/`isFetching` afecta `PlateRecognitionDisplay` (indicadores discretos); estados de erro/vazio da Phase 4 devem manter-se.

</code_context>

<specifics>
## Specific Ideas

Contexto recolhido com **selecção interactiva omitida**; decisões **D-01–D-06** reflectem prioridades recomendadas para PERF-01 (pausa total em background + refetch ao voltar visível + lógica no hook).

</specifics>

<deferred>
## Deferred Ideas

- Polling de outras páginas ou queries globais — fases futuras ou backlog.
- WebSocket / push para captura — fora do marco.

### Reviewed Todos (not folded)

- Nenhum todo em match para phase 6.

</deferred>

---
*Phase: 06-monitor-polling-visibility*  
*Context gathered: 2026-04-05*
