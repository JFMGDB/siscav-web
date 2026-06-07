/**
 * Tipos relacionados ao monitoramento em tempo real
 */

import { AccessStatus } from "./common";

export interface Capture {
  id: string;
  plate: string;
  status: AccessStatus;
  ocrSuccess?: boolean;
  timestamp: string;
  imageUrl: string;
}
