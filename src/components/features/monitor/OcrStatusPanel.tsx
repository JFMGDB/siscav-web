"use client";

import React from "react";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import {
  CameraAlt as CaptureIcon,
  DocumentScanner as OcrIcon,
  CheckCircleOutlined as MatchedIcon,
  HelpOutlined as NoMatchIcon,
  WarningAmberOutlined as ErrorIcon,
  HourglassEmpty as IdleIcon,
} from "@mui/icons-material";
import { Card } from "@/components/ui/Card";
import {
  STABLE_READS_REQUIRED,
  type OcrLoopStatus,
} from "@/hooks/use-monitor-plate-orchestration";

type Props = {
  status: OcrLoopStatus;
};

type PhasePresentation = {
  label: string;
  icon: React.ReactNode;
};

function getPresentation(status: OcrLoopStatus): PhasePresentation {
  switch (status.phase) {
    case "capturing":
      return {
        label: "Capturando frame da câmara…",
        icon: <CaptureIcon fontSize="small" color="info" />,
      };
    case "recognizing":
      return {
        label: "Enviando ao OCR…",
        icon: <OcrIcon fontSize="small" color="info" />,
      };
    case "matched":
      return {
        label: "Placa detectada",
        icon: <MatchedIcon fontSize="small" color="success" />,
      };
    case "no_match":
      return {
        label: "Nenhuma placa válida neste frame",
        icon: <NoMatchIcon fontSize="small" color="warning" />,
      };
    case "error":
      return {
        label: status.errorMessage ?? "Erro no ciclo de OCR",
        icon: <ErrorIcon fontSize="small" color="error" />,
      };
    case "idle":
    default:
      return {
        label: "A aguardar primeira leitura…",
        icon: <IdleIcon fontSize="small" />,
      };
  }
}

function formatLastAt(lastAt: number | null): string {
  if (!lastAt) return "—";
  return new Date(lastAt).toLocaleTimeString("pt-BR");
}

export default function OcrStatusPanel({ status }: Props) {
  const presentation = getPresentation(status);
  const isWorking =
    status.phase === "capturing" || status.phase === "recognizing";
  const showStableProgress =
    status.phase === "matched" &&
    status.stableCount > 0 &&
    status.stableCount < STABLE_READS_REQUIRED;

  return (
    <Card
      title="Status do OCR"
      subtitle="Ciclo automático em tempo real"
      sx={{ "&:hover": { transform: "none" } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isWorking ? <CircularProgress size={18} /> : presentation.icon}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {presentation.label}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Última placa lida
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              {status.lastPlate ?? "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Última tentativa
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              {formatLastAt(status.lastAt)}
            </Typography>
          </Box>
        </Box>

        {showStableProgress ? (
          <Chip
            size="small"
            color="info"
            variant="outlined"
            label={`Aguardando confirmação (${status.stableCount}/${STABLE_READS_REQUIRED} leituras estáveis)`}
            sx={{ alignSelf: "flex-start" }}
          />
        ) : null}

        {status.phase === "matched" &&
        status.stableCount >= STABLE_READS_REQUIRED ? (
          <Chip
            size="small"
            color="success"
            label={`Leitura estável confirmada (${status.stableCount}/${STABLE_READS_REQUIRED})`}
            sx={{ alignSelf: "flex-start" }}
          />
        ) : null}
      </Box>
    </Card>
  );
}
