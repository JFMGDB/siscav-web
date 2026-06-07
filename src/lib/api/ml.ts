import type { ApiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/constants";
import type {
  RecognizePlateResponse,
  VehicleClassificationResult,
} from "@/types";

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
    true,
    API_CONFIG.OCR_REQUEST_TIMEOUT_MS,
  );
}

/**
 * Classificação veicular no servidor (JWT obrigatório).
 * Campos multipart: `file`, `plate_hint` (opcional).
 */
export async function classifyVehicle(
  client: ApiClient,
  imageBlob: Blob,
  fileName = "frame.jpg",
  plateHint?: string,
): Promise<VehicleClassificationResult> {
  if (!imageBlob || imageBlob.size === 0) {
    throw new Error("Imagem vazia: selecione um arquivo de imagem válido.");
  }

  return client.requestMultipartJson<VehicleClassificationResult>(
    API_CONFIG.ENDPOINTS.ML.CLASSIFY_VEHICLE,
    () => {
      const form = new FormData();
      form.append("file", imageBlob, fileName);
      if (plateHint?.trim()) {
        form.append("plate_hint", plateHint.trim());
      }
      return form;
    },
  );
}
