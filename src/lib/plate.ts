/** Normalize plate for whitelist comparison (matches API normalize_plate). */
export function normalizePlate(plate: string): string {
  return plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
