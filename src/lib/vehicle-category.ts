import type { VehicleCategory } from "@/types";

const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  ambulance: "Ambulância",
  car: "Automóvel",
  motorcycle: "Motocicleta",
  truck: "Caminhão",
  bus: "Ônibus",
  van: "Van",
  unknown: "Outro / desconhecido",
};

export function getVehicleCategoryLabel(category: VehicleCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
