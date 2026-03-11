/**
 * Tipos relacionados ao monitoramento em tempo real
 */

import { AccessStatus } from './common';

export interface Capture {
  id: string;
  plate: string;
  status: AccessStatus;
  confidence: number;
  timestamp: string;
  imageUrl: string;
}










