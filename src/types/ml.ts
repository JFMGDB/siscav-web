/**
 * ML classification types (POST /api/v1/ml/classify-vehicle).
 */

export type VehicleCategory =
  | "ambulance"
  | "car"
  | "motorcycle"
  | "truck"
  | "bus"
  | "van"
  | "unknown";

export type ClassificationConfidence = {
  category: VehicleCategory;
  score: number;
};

export type VehicleClassificationResult = {
  predicted_category: VehicleCategory;
  confidence: number;
  all_scores?: ClassificationConfidence[];
  model_version: string;
  classifier_backend: string;
};

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
