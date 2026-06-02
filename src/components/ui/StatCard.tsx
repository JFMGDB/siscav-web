import React from "react";
import { Box, Typography, SxProps, Theme } from "@mui/material";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  sx?: SxProps<Theme>;
}

const colorMap = {
  primary: "#0d9488",
  secondary: "#10b981",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export function StatCard({
  title,
  value,
  icon,
  color = "primary",
  trend,
  sx,
}: StatCardProps) {
  const colorValue = colorMap[color];

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${colorValue}15 0%, ${colorValue}05 100%)`,
        border: `1px solid ${colorValue}20`,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              color: colorValue,
              mt: 1,
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: "block",
                color: trend.positive ? "success.main" : "error.main",
                fontWeight: 500,
              }}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              {trend.label}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              color: colorValue,
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
}
