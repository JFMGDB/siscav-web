/**
 * Access status configuration and helpers (OCP: open for extension via Record, closed for modification).
 * Pure TypeScript; no React. UI uses StatusChip which consumes this config.
 */

import type { AccessStatus } from '@/types';

export type StatusColor = 'success' | 'error' | 'warning' | 'default';

export type StatusIconKey = 'CheckCircle' | 'Cancel' | 'HelpOutline';

export interface AccessStatusConfig {
  color: StatusColor;
  text: string;
  icon: StatusIconKey;
}

const ACCESS_STATUS_CONFIG: Record<AccessStatus, AccessStatusConfig> = {
  Authorized: {
    color: 'success',
    text: 'Autorizado',
    icon: 'CheckCircle',
  },
  Denied: {
    color: 'error',
    text: 'Negado',
    icon: 'Cancel',
  },
};

const DEFAULT_CONFIG: AccessStatusConfig = {
  color: 'default',
  text: 'Desconhecido',
  icon: 'HelpOutline',
};

/**
 * Returns the full config for an access status. Unknown values get DEFAULT_CONFIG.
 */
export function getAccessStatusConfig(status: AccessStatus | string): AccessStatusConfig {
  return ACCESS_STATUS_CONFIG[status as AccessStatus] ?? DEFAULT_CONFIG;
}

/**
 * Returns the MUI color for the status.
 */
export function getAccessStatusColor(status: AccessStatus | string): StatusColor {
  return getAccessStatusConfig(status).color;
}

/**
 * Returns the icon key for the status (StatusChip maps this to MUI icon).
 */
export function getAccessStatusIconKey(status: AccessStatus | string): StatusIconKey {
  return getAccessStatusConfig(status).icon;
}

/**
 * Returns the display text for the status.
 */
export function getAccessStatusText(status: AccessStatus | string): string {
  return getAccessStatusConfig(status).text;
}
