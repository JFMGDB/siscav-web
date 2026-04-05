# Phase 3: Type safety & UI data - Context

**Gathered:** 2026-04-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase melhora **tipagem estática** em três pontos já identificados na dívida técnica: `DataTable` (colunas/células), filtro de status em `LogsTable`, e respostas de `devices.ts`. **Não** altera comportamento de produto, fluxos de negócio nem contratos com o backend além do necessário para tipos alinhados ao JSON real. **Não** inclui migração para outra biblioteca de tabelas, nem refactor largo de settings/Bluetooth para além do que TYP-03 exige nos tipos expostos pela API client.

</domain>

<decisions>
## Implementation Decisions

### DataTable e colunas (TYP-01)

- **D-01:** Eliminar `any` em `Column.format` e no acesso ao valor da célula. Preferência: `Column<T>` com `id: keyof T` (não `string` solto) para que `row[column.id]` seja tipado sem `as any`. A assinatura de `format` deve usar o tipo do campo correspondente (ex. `(value: T[K], row: T) => React.ReactNode` com `K extends keyof T` via coluna genérica, ou equivalente que preserve inferência nas chamadas em `LogsTable` e noutros consumidores).
- **D-02:** O constrangimento `T extends { id: string | number }` mantém-se para a chave de linha; todos os consumidores actuais de `DataTable` devem continuar a compilar após o ajuste (corrigir definições de colunas se `id` deixar de aceitar chaves inexistentes em `T`).

### LogsTable e MUI Select (TYP-02)

- **D-03:** Remover `as any` no `onChange` do `Select` de filtro de status. Usar o padrão tipado do MUI v7: `SelectChangeEvent` com parâmetro de tipo `'ALL' | 'Authorized' | 'Denied'`, ou composição equivalente (`event.target.value` estreitado com função auxiliar / `satisfies`) de modo que o typecheck cubra `MenuItem` values e o estado `statusFilter`.

### API devices (TYP-03)

- **D-04:** `scanDevices`, `connectDevice` e `disconnectDevice` deixam de expor `unknown[]` / `unknown` na assinatura pública em `src/lib/api/devices.ts` e, em cascata, no facade `api-client.ts` onde aplicável. Tipos concretos devem viver em `src/types/` (reutilizar ou estender `BluetoothDevice` / `ConnectionStatus` em `src/types/bluetooth.ts` quando o formato JSON corresponder; caso o payload da API difira do tipo UI Bluetooth, introduzir DTOs dedicados, ex. `DeviceScanResult`, `DeviceConnectResponse`, com campos mínimos alinhados ao que o backend devolve — documentar no código se houver divergência nome-a-nome com o tipo Web Bluetooth).
- **D-05:** `sendVideoFrame` e `getConnectionStatus` já usam tipos ou `void`; mantê-los consistentes após o passe (sem alargar escopo para novos endpoints).

### Claude's Discretion

- Forma exacta do genérico em `Column` (tuplo de chaves vs. `keyof T` único por coluna).
- Nomes finais dos DTOs em `src/types/` se o executor preferir um único ficheiro `devices.ts` de tipos em vez de colocar tudo em `bluetooth.ts`.
- Se algum consumidor externo a `DataTable` não puder expressar `keyof T`, permitir sobrecarga ou coluna “computed” documentada como excepção mínima — preferir corrigir o consumidor primeiro.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e requisitos

- `.planning/ROADMAP.md` — Secção Phase 3 (goal, TYP-01–TYP-03, success criteria, UI hint).
- `.planning/REQUIREMENTS.md` — TYP-01, TYP-02, TYP-03 e tabela de traceability.
- `.planning/PROJECT.md` — Stack TypeScript strict, brownfield.

### Dívida e arquitectura

- `.planning/codebase/CONCERNS.md` — Entradas sobre `DataTable`, `LogsTable`, `devices.ts`.
- `.planning/codebase/CONVENTIONS.md` — Padrões de componentes e API client (se existir secção relevante).

### Código (fonte de verdade)

- `src/components/ui/DataTable.tsx` — `Column`, `DataTableProps`, uso de `any`.
- `src/components/features/logs/LogsTable.tsx` — `Select` / `as any`, colunas `AccessLog`.
- `src/lib/api/devices.ts` — `unknown` / `unknown[]`.
- `src/lib/api-client.ts` — assinaturas `scanDevices`, `connectDevice`, `disconnectDevice`.
- `src/types/logs.ts` — `AccessLog`, `AccessLogFilters`.
- `src/types/bluetooth.ts` — `BluetoothDevice`, `ConnectionStatus`.
- `src/types/index.ts` — re-exportes.

### Fases anteriores

- `.planning/phases/02-api-client-http-consistency/02-CONTEXT.md` — Cliente HTTP e cookies já alinhados; não contradizer.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `DataTable` já é genérico `DataTable<T>` com `Column<T>`; falta estreitar `id` e `format` em vez de introduzir nova tabela.
- `AccessLog` e `Column<AccessLog>[]` em `LogsTable` — chaves de coluna coincidem com campos do tipo; adequado a `keyof AccessLog`.
- `BluetoothDevice` e `ConnectionStatus` em `src/types/bluetooth.ts` — candidatos directos para respostas de scan/connect se o JSON da API for compatível.

### Established Patterns

- MUI 7 + TypeScript; componentes client em `'use client'` onde necessário.
- Facade `apiClient` delega a módulos em `src/lib/api/`.

### Integration Points

- `LogsTable` → `DataTable` + `useLogs`.
- `BluetoothDeviceManager` → `apiClient.connectDevice` / `disconnectDevice` (Web Bluetooth + backend); `scanDevices` da REST API não está referenciado na UI actual, mas o tipo deve ficar correcto para consumidores futuros e para o facade.

</code_context>

<specifics>
## Specific Ideas

Sessão única sem pergunta interactiva ao utilizador: decisões ancoradas nos success criteria da Phase 3 e em `.planning/codebase/CONCERNS.md`. Se quiseres variar alguma escolha (ex. não usar `keyof T` nas colunas), edita este CONTEXT antes de `/gsd-plan-phase 3`.

</specifics>

<deferred>
## Deferred Ideas

- Migração para TanStack Table ou virtualização — fora do âmbito; só tipagem do componente actual.
- Alterar `acceptAllDevices` / filtros Bluetooth (DEV-V2-01) — fase v2 / backlog.
- Novos campos de API ou alteração de contrato com `siscav-api` — coordenação fora desta fase salvo o mínimo para tipar JSON existente.

</deferred>

---

*Phase: 03-type-safety-ui-data*  
*Context gathered: 2026-04-05*
