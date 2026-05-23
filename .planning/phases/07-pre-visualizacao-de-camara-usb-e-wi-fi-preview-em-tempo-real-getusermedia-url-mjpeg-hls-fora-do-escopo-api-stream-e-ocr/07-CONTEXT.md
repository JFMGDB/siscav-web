# Phase 7: Pré-visualização de câmara (USB e Wi‑Fi) - Context

**Gathered:** 2026-04-05  
**Status:** Ready for planning  
**Mode:** Autonomous / PRD-driven (smart-discuss tables skipped — decisions taken from `07-PRD.md` and codebase patterns)

<domain>
## Phase Boundary

Entregar no painel Next.js uma página autenticada onde o operador pré-visualiza vídeo em tempo real: **USB** via `getUserMedia` + `<video>`, ou **rede** via URL (MJPEG em `<img>`, HLS em `<video>` com `hls.js` quando necessário). O stream **não** passa pela API SISCAV. Fora de âmbito: OCR, envio de frames para `access_logs`, proxy de vídeo no backend, gravação longa.

</domain>

<decisions>
## Implementation Decisions

### Navegação e localização
- Nova rota autenticada `/camera` com entrada no `Sidebar` (ícone distinto do Monitor).
- Textos da UI em português, alinhado ao resto do painel.

### USB
- Pedido de permissão **explícito** (botão “Ligar câmara”), não auto-start ao montar.
- Após permissão, `enumerateDevices()` para `<select>` de `videoinput`; `getUserMedia` com `deviceId` ao mudar seleção.
- `<video>` com `autoPlay`, `playsInline`, `muted`; cleanup de tracks e `srcObject` ao desmontar, trocar dispositivo ou parar.
- Compatível com React Strict Mode: refs para o `MediaStream` atual e cleanup idempotente.

### Rede (URL)
- Validar URL: apenas `http:` / `https:`; rejeitar `javascript:`, `data:` perigosos para atributo `src`.
- **Conteúdo misto:** se a página é HTTPS e a URL é HTTP, mostrar erro explicativo antes de atribuir `src`.
- MJPEG / JPEG contínuo: `<img>` (com `onError`).
- HLS: deteção por `.m3u8` no pathname da URL; Chrome/Firefox via `hls.js` (dynamic import); Safari tenta nativo em `<video>`.
- Não registar URLs com credenciais em `console` em fluxos normais; função utilitária para display seguro opcional.

### Estados de UI
- USB: idle, a pedir / activo, erro (permissão negada, sem dispositivos, API indisponível).
- Rede: campo URL, ligar/desligar, carregamento, erro (validação, mixed content, falha de rede/imagem).

### Documentação
- Secção curta no README: HTTPS/localhost para USB; mixed content; limitações Safari iOS / CORS.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Layout autenticado `(auth)/layout.tsx` + `Sidebar` com `ROUTES` em `src/constants/index.ts`.
- Padrão de página: `Container`, `Typography`, MUI; `Card` em `@/components/ui/Card`.
- Monitor usa `CameraFeed` placeholder — a nova página é dedicada à pré-visualização real, sem alterar o fluxo do monitor nesta fase.

### Established Patterns
- Client Components com `'use client'` em páginas que precisam de hooks/browser APIs.
- MUI Grid v2 (`size={{ xs: 12 }}`), tema existente.

### Integration Points
- `ROUTES.AUTH` + novo item em `menuItems` do `Sidebar`.

</code_context>

<specifics>
## Specific Ideas

- PRD canónico: `07-PRD.md` (arquitectura browser↔câmara, checklist MDN).

</specifics>

<deferred>
## Deferred Ideas

- Captura de frame → `POST /api/v1/access_logs/` (multipart).
- Proxy de stream no backend para contornar CORS/mixed content.
- Snapshot polling genérico (JPEG estático) como modo explícito.

</deferred>
