"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import {
  DirectionsCar as TrafficIcon,
  AutoMode as AutoIcon,
  DocumentScanner as OcrIcon,
} from "@mui/icons-material";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

function todayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export default function DashboardMetrics() {
  const [selectedDate, setSelectedDate] = useState(todayLocalDate);
  const { data, isLoading, isError, refetch, isFetching } =
    useDashboardMetrics(selectedDate);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Volume de tráfego",
        value: data.traffic_volume,
        icon: <TrafficIcon sx={{ fontSize: 40 }} />,
        color: "primary" as const,
      },
      {
        title: "Aprovação sem intervenção",
        value: formatPercent(data.auto_approval_rate_percent),
        icon: <AutoIcon sx={{ fontSize: 40 }} />,
        color: "success" as const,
      },
      {
        title: "Eficácia do OCR",
        value: formatPercent(data.ocr_success_rate_percent),
        icon: <OcrIcon sx={{ fontSize: 40 }} />,
        color: "info" as const,
      },
    ];
  }, [data]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Métricas do dia
        </Typography>
        <TextField
          label="Data"
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 180 }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert
          severity="error"
          action={
            <Typography
              component="button"
              type="button"
              onClick={() => void refetch()}
              sx={{
                border: 0,
                background: "none",
                cursor: "pointer",
                color: "inherit",
                fontWeight: 600,
              }}
            >
              Tentar novamente
            </Typography>
          }
        >
          Falha ao carregar métricas{isFetching ? "…" : "."}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
