---
phase: 03-type-safety-ui-data
status: complete
updated: 2026-04-05
---

# Phase 3 — Technical research (concise)

## Scope

Tipagem em `DataTable`, MUI `Select` em `LogsTable`, e respostas REST em `devices.ts`. Sem mudança visual nem nova biblioteca de tabelas.

## Findings

### DataTable + `keyof T`

- Colunas com `id` alinhado a `keyof T` removem `(row as any)[column.id]` e `any` em `format`.
- **WhitelistTable** usa coluna sintética `actions` — não é chave de `AuthorizedPlate`. Padrões aceitáveis: (1) união discriminada `KeyedColumn<T> | ActionColumn<T>` com `format(row)` só na acção; (2) `id: keyof T | 'actions'` com ramo especial no render que não lê `row['actions']`; (3) coluna com `id: keyof T` falso tipo `never` — menos claro. Preferência do CONTEXT: corrigir consumidor + excepção mínima documentada → **união ou literal `'actions'`** com tipo seguro.

### MUI 7 Select

- `import type { SelectChangeEvent } from '@mui/material/Select'` (ou `@mui/material`) e `SelectChangeEvent<StatusFilter>` onde `type StatusFilter = 'ALL' | 'Authorized' | 'Denied'` alinha `event.target.value` ao estado sem `as any`.

### devices API

- `getConnectionStatus` já retorna `ConnectionStatus`. Para scan/connect/disconnect: tipar com DTOs em `src/types/`; se o JSON do backend coincidir com `BluetoothDevice`, reutilizar; senão `DeviceScanEntry` / `DeviceMutationResult` com campos mínimos. `scanDevices` não tem chamador na UI actual — tipos servem facade e uso futuro.

## Validation Architecture

| Layer | Approach |
|-------|------------|
| Typecheck | `npm run build` after each plan wave |
| Regression | `npm test` before closing phase |
| Manual | Não requerido para alterações só de tipos (sem mudança de UX) |

Executor runs full suite from repository root per `03-VALIDATION.md`.

## RESEARCH COMPLETE
