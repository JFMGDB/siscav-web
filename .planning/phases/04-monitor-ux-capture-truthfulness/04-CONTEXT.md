# Phase 4: Monitor UX & capture truthfulness - Context

**Gathered:** 2026-04-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase corrige **truthfulness** e **observabilidade** no monitor: (1) falhas de rede/API na obtenção da última captura devem ser **visívelmente distintas** de “ainda não há dados” ou de carregamento inicial; (2) **confiança** (`confidence`) não pode ser um valor fixo inventado no cliente — só aparece na UI se existir dado real vindo da cadeia API/tipos.

**Inclui:** `src/lib/api/monitor.ts`, `use-monitor-capture.ts`, componentes do monitor que consomem captura (nomeadamente `PlateRecognitionDisplay`), tipos `Capture` / `AccessLog` se necessário para campos opcionais.

**Exclui:** Pausar polling com `document.visibilityState` (**PERF-01**, Phase 6). Não expandir escopo para streaming de vídeo real, novos endpoints de monitor, nem alterar frequência de polling além do necessário para testar estados de erro (manter intervalo actual salvo o planner decidir micro-ajuste documentado).

</domain>

<decisions>
## Implementation Decisions

### Erro vs. vazio vs. carregamento (MON-01, roadmap §1 e §3)

- **D-01:** `getLastCapture` **não** deve engolir erros com `try/catch` que devolve `null` indistinguível de “lista vazia”. Preferência: **deixar propagar** excepções para o `queryFn` do TanStack Query (ou devolver `null` só quando `getLogs` responde OK e `items.length === 0`). O hook `useMonitorCapture` já expõe `error` e estados de loading — o consumidor na UI deve usá-los.
- **D-02:** `PlateRecognitionDisplay` (e qualquer outro consumidor directo de `useMonitorCapture` que assuma só `capture`) deve apresentar **pelo menos três estados distintos** na percepção do operador: (a) carregamento inicial / revalidação com mensagem ou indicador adequado; (b) sucesso sem captura (vazio legítimo); (c) falha (rede, 4xx/5xx, ou erro de parse) com mensagem ou `Alert` **não** idêntica ao vazio. Textos em **português**, tom alinhado ao resto do painel.
- **D-03:** Se `getLogs` falhar dentro de `getLastCapture`, o operador deve conseguir dizer que viu **erro**, não “lista vazia” (roadmap success criterion 3).

### Confiança (MON-02, roadmap §2)

- **D-04:** Remover atribuição fixa `confidence: 0.95` em `monitor.ts`. O tipo `Capture` deve representar confiança como **opcional** (`confidence?: number`) enquanto `AccessLog` não expuser campo correspondente da API.
- **D-05:** Na UI (`PlateRecognitionDisplay`), o bloco “Confiança” (label + percentagem) só é renderizado quando `capture.confidence` está **definido** (número vindo da montagem da captura a partir da API). Se a API passar a enviar confiança no log, mapear nesse momento; até lá, **omitir** a secção — não mostrar “0%”, placeholder nem default.
- **D-06:** Não inventar fallbacks (ex. `?? 0`, `|| 0.95`) no cliente para confiança.

### Claude's Discretion

- Copy exacta das strings de erro/vazio/carregamento e uso de `Alert` vs. `Typography` vs. `Card` vazio.
- Se convier, resultado discriminado interno antes do tipo `Capture` — desde que a UI e o Query mantenham contratos claros.
- Teste mínimo (opcional nesta fase): smoke ou teste de hook com Query mock — só se couber sem inflar escopo.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e requisitos

- `.planning/ROADMAP.md` — Phase 4 (goal, MON-01, MON-02, success criteria, UI hint).
- `.planning/REQUIREMENTS.md` — MON-01, MON-02 e traceability.
- `.planning/PROJECT.md` — Stack, brownfield.

### Dívida documentada

- `.planning/codebase/CONCERNS.md` — Entradas sobre `getLastCapture` / `confidence` / polling (polling só referência; PERF-01 é Phase 6).

### Código

- `src/lib/api/monitor.ts` — `getLastCapture`, `registerUnknownPlate`.
- `src/lib/api/logs.ts` — `getLogs` (contrato de erro).
- `src/hooks/use-monitor-capture.ts` — React Query, `refetchInterval`.
- `src/components/features/monitor/PlateRecognitionDisplay.tsx` — Estados actuais (só `!capture`).
- `src/types/monitor.ts` — `Capture`.
- `src/types/logs.ts` — `AccessLog` (sem `confidence` hoje).
- `src/app/(auth)/monitor/page.tsx` — Composição do monitor.

### Fases anteriores

- `.planning/phases/03-type-safety-ui-data/03-CONTEXT.md` — Tipagem recente; não regredir TYP-*.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- TanStack Query já fornece `isLoading`, `isFetching`, `isError`, `error`, `failureReason` — usar em vez de reinventar estado global.
- `Card`, `Typography`, MUI `Alert` / `CircularProgress` para estados visuais.

### Established Patterns

- Monitor page: `CameraFeed` (placeholder), `PlateRecognitionDisplay`, `ManualRegistrationForm`.
- `getLastCapture` compõe `Capture` a partir do primeiro `AccessLog`.

### Integration Points

- Alterar semântica de erro em `getLastCapture` implica que `useMonitorCapture` e `PlateRecognitionDisplay` tratem `query.error`.
- `Capture.confidence` opcional propaga-se a qualquer outro consumidor futuro de `Capture`.

</code_context>

<specifics>
## Specific Ideas

Sessão **requirements-bound** (sem menu interactivo de áreas cinzentas): decisões derivadas de MON-01/MON-02, ROADMAP success criteria e leitura de `monitor.ts` + `PlateRecognitionDisplay.tsx`. Revisa este CONTEXT se quiseres copy ou variantes de UI diferentes antes de `/gsd-plan-phase 4`.

</specifics>

<deferred>
## Deferred Ideas

- **PERF-01:** Pausar/reduzir polling com separador em segundo plano — Phase 6.
- Retry automático exponencial, toast global de erro de monitor — backlog se não couber na cópia mínima desta fase.
- Campo `confidence` real no backend — quando existir, estender `AccessLog` + mapeamento em `getLastCapture` (pode ser sub-tarefa ou fase seguinte se exigir coordenação API).

</deferred>

---

*Phase: 04-monitor-ux-capture-truthfulness*  
*Context gathered: 2026-04-05*
