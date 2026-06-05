import React from "react";
import { Paper, PaperProps, Box, Typography } from "@mui/material";

export interface CardProps extends Omit<PaperProps, "title"> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  hover = false,
  sx,
  ...props
}: CardProps) {
  return (
    <Paper
      {...props}
      sx={{
        p: 3,
        ...(hover && {
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
          },
        }),
        ...sx,
      }}
    >
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && (
            <Typography variant="h6" component="h3" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Paper>
  );
}
