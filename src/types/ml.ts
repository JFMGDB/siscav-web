/**
 * Respostas do endpoint OCR no servidor (POST /api/v1/ml/recognize-plate).
 */

export type PlateCandidate = {
  plate_raw: string;
  normalized_plate: string;
  plate_color_hint: string;
};

export type RecognizePlateResponse = {
  candidates: PlateCandidate[];
};
