import type { ApiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/constants";
import type { RecognizePlateResponse } from "@/types";

/**
 * OCR de placa no servidor (JWT obrigatório). Campo multipart: `file`.
 * Erros: 401/403 auth, 400 tipo/tamanho, 413 ficheiro grande, 503 ML não instalado.
 */
export async function recognizePlate(
  client: ApiClient,
  imageBlob: Blob,
  fileName = "frame.jpg",
): Promise<RecognizePlateResponse> {
  if (!imageBlob || imageBlob.size === 0) {
    throw new Error(
      "Imagem vazia: a captura do frame não produziu dados (vídeo pronto? stream com CORS?).",
    );
  }

  return client.requestMultipartJson<RecognizePlateResponse>(
    API_CONFIG.ENDPOINTS.ML.RECOGNIZE_PLATE,
    () => {
      const form = new FormData();
      form.append("file", imageBlob, fileName);
      return form;
    },
  );
}
