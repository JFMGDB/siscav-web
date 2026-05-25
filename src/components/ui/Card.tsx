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
  hover = true,
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
            transform: "translateY(-2px)",
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
