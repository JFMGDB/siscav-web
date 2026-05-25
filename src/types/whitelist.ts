/**
 * Tipos relacionados à lista de veículos autorizados (Whitelist)
 */

export interface AuthorizedPlate {
  id: string;
  plate: string;
  normalized_plate: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedPlateCreate {
  plate: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

