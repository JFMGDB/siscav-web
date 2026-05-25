---
phase: 04
slug: 04-monitor-ux-capture-truthfulness
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-05
---

# Phase 04 — UI Design Contract

> Contrato visual e de interacção para **Monitor — última captura** (`PlateRecognitionDisplay` + hook `useMonitorCapture`). Alinhado a `04-CONTEXT.md` (MON-01, MON-02). **Fora de âmbito:** `CameraFeed` placeholder, `ManualRegistrationForm`, polling por visibilidade (Phase 6).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (no shadcn) |
| Preset | not applicable |
| Component library | **MUI 7** (`@mui/material`), styling via `sx` + tema |
| Icon library | `@mui/icons-material` (só se necessário para erro/retry; opcional) |
| Font | Herdado do tema Next.js / MUI (Roboto por defeito MUI) |

---

## Spacing Scale

Valores declarativos (múltiplos de **4px**; mapear para `theme.spacing` ou `sx` numérico MUI onde 1 unidade = 8px — usar **2, 3, 4** para 16px, 24px, 32px):

| Token | Valor | Usage |
|-------|-------|-------|
| xs | 4px | gap ícone–texto em linhas compactas |
| sm | 8px | `gap` entre linhas de metadata |
| md | 16px | padding interno secções dentro do `Card` |
| lg | 24px | `mb` entre blocos principais no card |
| xl | 32px | `minHeight` mínimo área de estado vazio (junto com conteúdo) |

**Excepções:** Reutilizar `Card` existente (`p: 3` = 24px) — não reduzir padding global do `Card` nesta fase.

---

## Typography

**Regra:** No máximo **dois pesos** no âmbito desta fase — **400** (regular) e **600** (semibold). Não usar 500 nem intervalos intermédios.

| Role | MUI variant | Weight | Notas |
|------|-------------|--------|-------|
| Títulos de estado (loading / erro / vazio) e título do card | `h6` | **600** | `text.primary` ou cor do `Alert` / tema erro conforme estado |
| Corpo explicativo e labels metadata | `body2` / `caption` | **400** | `caption` para labels; `body2` + `text.secondary` para corpo |
| Valores destacados (placa, timestamp, percentagem confiança) | `body2` / `h2` (placa) | **600** | `fontFamily: monospace` para placa e timestamp; placa `h2` com `sx={{ fontWeight: 600 }}` se o tema usar outro peso por defeito |

---

## Color

**Balanço 60/30/10 (orientação):** ~60% neutros (fundo da página, `Paper`); ~30% superfícies secundárias / texto; ~10% acentos (`primary` no progress, `error` só em falha). Não expandir `primary` para mensagens de erro.

| Role | Fonte | Usage |
|------|--------|--------|
| Superfície | `Paper` / `Card` | Fundo padrão do tema |
| Texto secundário | `theme.palette.text.secondary` | Subtítulos de estado |
| Erro | `theme.palette.error.main` + `Alert` `severity="error"` | Estado **falha API/rede** (MON-01) |
| Acento primário | `primary.main` | `CircularProgress` no estado de **carregamento** (consistente com ecrã actual) |
| Divisor metadata | `divider` | Linha entre blocos no card de sucesso |

**Proibido:** Usar cor de sucesso/primary para comunicar erro. **Confiança omitida:** não usar cinza a simular “0%”; omitir bloco inteiro (MON-02).

---

## Estados e hierarquia (superfície principal)

**Componente:** `PlateRecognitionDisplay` dentro do mesmo `Card` que hoje envolve a última leitura com sucesso.

Ordem de decisão na árvore de renderização:

1. **`isError` (Query)** — Mostrar **`Alert` `severity="error"`** no topo do conteúdo do `Card` (ou `Card` com título fixo “Última Leitura” e corpo = erro). Incluir **corpo** `Typography` `body2` com copy de suporte. **Acção:** botão **“Tentar novamente”** (`variant="outlined"`, `size="small"`) ligado a `refetch` do hook. Não mostrar `CircularProgress` de “aguardando” neste estado.
2. **`isLoading` (primeira carga)** — `CircularProgress` centrado + título **“A carregar última leitura…”** + linha secundária opcional **“A obter dados do servidor…”**. Visualmente **distinto** do vazio (sem `Alert`, sem copy de erro).
3. **Sucesso + `capture === null`** — Sem spinner. Título sugerido **“Sem leituras recentes”** + corpo **“Ainda não há registos de acesso para mostrar.”** (ou equivalente curto). **Não** reutilizar a copy exacta **“Aguardando veículo…”** (reservada para confusão com stream em tempo real; o CONTEXT exige distinção operador).
4. **Sucesso + `capture` definido** — Layout actual (placa, `StatusChip`, metadata). **Confiança:** renderizar o bloco “Confiança” **apenas** se `capture.confidence !== undefined && capture.confidence !== null`**; caso contrário **não** mostrar label nem percentagem (MON-02). Timestamp mantém-se.

**Revalidação em segundo plano:** Se `isFetching && !isLoading && capture` (dados antigos visíveis), pode mostrar indicador discreto opcional (`LinearProgress` fino no topo do `Card` ou ícone) — **Claude's discretion**; mínimo aceitável é não degradar estados 1–3.

---

## Copywriting Contract

| Element | Copy (PT) |
|---------|-----------|
| Erro — título (Alert ou h6) | **“Falha ao carregar a última leitura”** |
| Erro — corpo | **“Não foi possível obter os dados. Verifique a ligação à API ou tente novamente.”** |
| Erro — CTA | **“Tentar novamente”** |
| Carregamento — título | **“A carregar última leitura…”** |
| Carregamento — subtítulo | **“A obter dados do servidor…”** |
| Vazio legítimo — título | **“Sem leituras recentes”** |
| Vazio legítimo — corpo | **“Ainda não há registos de acesso para mostrar.”** |
| Sucesso — título card | **“Última Leitura”** (manter) |
| Sucesso — subtítulo card | **“Reconhecimento automático de placa em tempo real”** (manter) |
| Label confiança (só se dado presente) | **“Confiança”** |
| Label timestamp | **“Timestamp”** (manter) |

**Proibido:** Mostrar percentagem de confiança inventada ou placeholder (“—”, “N/D”) quando não há valor da API.

---

## Interacções

| Acção | Comportamento |
|-------|----------------|
| Tentar novamente | `refetch()` do `useMonitorCapture`; botão `disabled` opcional durante `isFetching` |
| Clique no card (sucesso) | Sem alteração — não introduzir navegação nova nesta fase |

**Acessibilidade (mínimo):** `Alert` com `role="alert"` (MUI por defeito); botão retry com texto visível.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn | — | not applicable |
| MUI | `Alert`, `Button`, `Typography`, `Box`, `CircularProgress`, `Card` | Pacote já no `package.json`; sem novo registry |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS (60/30/10 + roles semânticos)
- [x] Dimension 4 Typography: PASS (pesos 400 e 600 apenas)
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-05 (re-verified after typography revision)

---

## UI-SPEC COMPLETE
