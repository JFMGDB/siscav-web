/**
 * Componente Button Moderno
 * 
 * Wrapper para Button do MUI com estilos modernos pré-configurados.
 * Segue DRY: centraliza estilos comuns de botões.
 */

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode;
}

export function Button({ children, sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...props}
      sx={{
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  );
}










