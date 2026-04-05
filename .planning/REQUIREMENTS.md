# Requirements: SISCAV-Web

**Defined:** 2026-04-04  
**Core Value:** Operadores conseguem controlar e auditar o acesso de veículos de forma confiável, sem depender de interface de treino de IA.

## v1 Requirements

Escopo do marco atual: **formalização do planejamento** + **higiene e correções** derivadas de `.planning/codebase/CONCERNS.md`, sem feature de produto grande nova.

### Planning & documentation

- [x] **PLAN-01**: `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` e `STATE.md` existem e refletem o produto e o escopo acordado (brownfield + exclusão de treino de IA)
- [x] **PLAN-02**: Repositório documenta `NEXT_PUBLIC_API_URL` para novos contribuidores (ex. `.env.example` ou secção equivalente no README)

### API client & HTTP consistency

- [x] **API-01**: Leitura/gravação de tokens e cookies é **consistente** entre `src/lib/api/client.ts` e `src/lib/api-client.ts` (ou facade reduzido/eliminado de forma segura)
- [x] **API-02**: `register` em `src/lib/api/auth.ts` usa o mesmo caminho de erro/HTTP que o restante do cliente (via `ApiClient` ou exceção documentada no código)

### Type safety & UI data

- [x] **TYP-01**: `src/components/ui/DataTable.tsx` deixa de depender de `any` para colunas/linhas onde tipos podem ser expressos com generics ou tipos de domínio
- [x] **TYP-02**: `src/components/features/logs/LogsTable.tsx` trata o `onChange` do filtro sem `as any`
- [x] **TYP-03**: `src/lib/api/devices.ts` expõe tipos concretos (DTOs) alinhados a `src/types/` em vez de `unknown` genérico

### Monitor & observability (UX)

- [x] **MON-01**: Falhas em `getLastCapture` / cadeia de logs em `src/lib/api/monitor.ts` são **distinguíveis** de “sem dados” na UI (mensagem ou estado de erro)
- [x] **MON-02**: Campo `confidence` em capturas não é **inventado** (0,95 fixo); vem da API ou é removido/ocultado até o backend fornecer

### Auth hook reliability

- [ ] **AUTH-01**: Bootstrap de auth em `src/hooks/use-auth.tsx` não depende de suprimir `exhaustive-deps` sem uma estratégia estável (efeitos/callbacks documentados)

### Performance

- [ ] **PERF-01**: Polling do monitor (`src/hooks/use-monitor-capture.ts` / `UI_CONFIG.POLLING`) não mantém carga desnecessária com o separador em segundo plano (ex. pausar com `document.visibilityState`)

## v2 Requirements

Melhorias maiores, fora do compromisso mínimo do marco atual:

### Security architecture

- **SEC-V2-01**: Avaliar auth com cookies **HttpOnly** / BFF ou equivalente para reduzir exposição a XSS
- **SEC-V2-02**: Proteção de rotas no servidor (ex. `middleware.ts`) além do guard só em cliente em `src/app/(auth)/layout.tsx`
- **SEC-V2-03**: CSP e endurecimento de front contra XSS em conjunto com o host de deploy

### Testing & quality

- **TEST-V2-01**: Cobertura de testes para `ApiClient` (refresh, 401), fluxos de auth e páginas críticas
- **TEST-V2-02**: Limiares de cobertura no CI (opcional)

### Hardware / Bluetooth

- **DEV-V2-01**: Restringir `acceptAllDevices` / filtros Bluetooth em `BluetoothDeviceManager.tsx` quando houver UUIDs de serviço conhecidos

## Out of Scope

| Feature | Reason |
|---------|--------|
| Interface de treino de IA | Explicitamente fora do foco; não faz parte do painel administrativo SISCAV |
| Novo módulo de produto grande (ex. faturação, multi-tenant) | Marco atual = formalização + higiene |
| Substituição do backend ou contratos major API | Fora do frontend; coordenação com `siscav-api` em outro repositório |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAN-01 | Phase 1 | Done |
| PLAN-02 | Phase 1 | Done |
| API-01 | Phase 2 | Done |
| API-02 | Phase 2 | Done |
| TYP-01 | Phase 3 | Done |
| TYP-02 | Phase 3 | Done |
| TYP-03 | Phase 3 | Done |
| MON-01 | Phase 4 | Pending |
| MON-02 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| PERF-01 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-04-04*  
*Last updated: 2026-04-04 after phase 4 execution*
