# Phase 7 — Validação manual

## USB

1. Em **Chrome** em `https://localhost:3000` ou `http://localhost:3000`, autenticar e abrir **Pré-visualização**.
2. Separador **USB / Este dispositivo** → **Ligar câmara** → aceitar permissão.
3. Confirmar vídeo no painel; trocar **Câmara** no select se existir mais do que uma.
4. **Parar** → confirmar que o preview termina.

## Rede (MJPEG / imagem)

1. Separador **Câmara na rede (URL)** → URL válida `http://` com o site servido em **http** (evitar mixed content em HTTPS).
2. **Ligar** → confirmar imagem/stream ou mensagem de erro compreensível se a câmara não for acessível.

## Mixed content

1. Com o site em **HTTPS**, introduzir URL **http://** → deve aparecer aviso de conteúdo misto **antes** de carregar.

## HLS (opcional)

1. URL com `.m3u8` acessível → vídeo com controlos; em Chrome esperar uso de `hls.js`.
