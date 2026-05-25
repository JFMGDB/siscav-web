'use client';

/**
 * Shared StatusChip that displays access status using lib/access-status config.
 * Used in LogsTable and PlateRecognitionDisplay for consistent status display.
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { CheckCircle, Cancel, HelpOutline } from '@mui/icons-material';
import {
  getAccessStatusConfig,
  type AccessStatusConfig,
  type StatusIconKey,
} from '@/lib/access-status';
import type { AccessStatus } from '@/types';

const ICON_MAP: Record<StatusIconKey, React.ReactElement> = {
  CheckCircle: <CheckCircle />,
  Cancel: <Cancel />,
  HelpOutline: <HelpOutline />,
};

function getIconElement(config: AccessStatusConfig): React.ReactElement {
  return ICON_MAP[config.icon] ?? ICON_MAP.HelpOutline;
}

export interface StatusChipProps extends Omit<ChipProps, 'color' | 'icon' | 'label'> {
  status: AccessStatus | string;
  label?: string;
}

export function StatusChip({ status, label, size = 'small', ...chipProps }: StatusChipProps) {
  const config = getAccessStatusConfig(status);
  const icon = getIconElement(config);
  const displayLabel = label ?? config.text;

  return (
    <Chip
      icon={icon}
      label={displayLabel}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
      {...chipProps}
    />
  );
}
