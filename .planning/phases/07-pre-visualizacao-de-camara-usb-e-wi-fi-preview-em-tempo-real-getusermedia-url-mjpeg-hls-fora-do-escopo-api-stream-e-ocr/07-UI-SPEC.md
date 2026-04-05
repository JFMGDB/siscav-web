# Phase 7 — UI-SPEC: Pré-visualização de câmara

## Screen: `/camera` (autenticado)

### Layout
- Cabeçalho: título **“Pré-visualização de câmara”** + subtítulo curto (USB ou URL na rede; sem passar pela API).
- Área principal: **Tabs** MUI — **“USB / Este dispositivo”** | **“Câmara na rede (URL)”**.
- Área de preview: cartão escuro (ratio ~16:9, min-height ~360px) com cantos arredondados coerentes com `Card` existente.

### Tab USB
- Botão primário **“Ligar câmara”** (ou **“Parar”** quando activo).
- `Select` de dispositivos (desactivado até haver lista); label “Câmara”.
- `<video>` a preencher o cartão (object-fit contain).
- Mensagens: texto secundário antes de ligar; `Alert` em erro (permissão negada, sem câmaras).

### Tab Rede
- `TextField` URL (full width), botões **“Ligar”** / **“Desligar”**.
- `Alert` inline para URL inválida, mixed content ou falha ao carregar.
- Preview: `<img>` para fluxo MJPEG/JPEG ou `<video>` para HLS; estado “A carregar…” opcional até primeiro `onLoad` / evento de mídia.

### Acessibilidade
- Botões e tabs com labels claros; vídeo/imagem com `alt` / `title` descritivos.

### Não incluir nesta fase
- OCR, gravação, thumbnails de histórico.
