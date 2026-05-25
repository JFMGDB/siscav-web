"use client";

/**
 * Plate Recognition Display - uses useMonitorCapture (TanStack Query with polling).
 */

import React, { useEffect, useRef } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { getAccessStatusColor } from "@/lib/access-status";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { useMonitorCapture } from "@/hooks/use-monitor-capture";

interface PlateRecognitionDisplayProps {
  onUnknownPlate: (plate: string) => void;
}

export default function PlateRecognitionDisplay({
  onUnknownPlate,
}: PlateRecognitionDisplayProps) {
  const { capture, loading, isError, isFetching, refetch } =
    useMonitorCapture();
  const lastCaptureIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isError || !capture) return;
    if (
      capture.id !== lastCaptureIdRef.current &&
      capture.status === "Denied"
    ) {
      lastCaptureIdRef.current = capture.id;
      onUnknownPlate(capture.plate);
    } else {
      lastCaptureIdRef.current = capture.id;
    }
  }, [capture, onUnknownPlate, isError]);

  const cardShellSx = {
    textAlign: "center" as const,
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    minHeight: 300,
  };

  if (isError) {
    return (
      <Card sx={cardShellSx}>
        <Alert severity="error" sx={{ textAlign: "left", width: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Falha ao carregar a última leitura
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 400, mb: 2 }}>
            Não foi possível obter os dados. Verifique a ligação à API ou tente
            novamente.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Tentar novamente
          </Button>
        </Alert>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card sx={cardShellSx}>
        <CircularProgress
          size={48}
          sx={{ mx: "auto", mb: 2, color: "primary.main" }}
        />
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
          A carregar última leitura…
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: 400 }}
        >
          A obter dados do servidor…
        </Typography>
      </Card>
    );
  }

  if (capture === null) {
    return (
      <Card sx={cardShellSx}>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
          Sem leituras recentes
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: 400 }}
        >
          Ainda não há registos de acesso para mostrar.
        </Typography>
      </Card>
    );
  }

  const statusColor = getAccessStatusColor(capture.status);
  const confidence = capture.confidence;

  return (
    <Card
      title="Última Leitura"
      subtitle="Reconhecimento automático de placa em tempo real"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Box
          sx={{
            border: "3px solid",
            borderColor: `${statusColor}.main`,
            borderRadius: 3,
            p: 3,
            bgcolor: `${statusColor}.50`,
            mb: 3,
            width: "100%",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${statusColor}.100 0%, transparent 100%)`,
              opacity: 0.5,
            },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 600,
              letterSpacing: 6,
              fontFamily: "monospace",
              position: "relative",
              zIndex: 1,
              color: `${statusColor}.main`,
            }}
          >
            {capture.plate}
          </Typography>
        </Box>

        <StatusChip
          status={capture.status}
          sx={{
            fontSize: "1rem",
            py: 2,
            px: 3,
            width: "100%",
            mb: 2,
          }}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent:
              typeof confidence === "number" ? "space-between" : "flex-end",
            alignItems: "center",
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {typeof confidence === "number" ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", fontWeight: 400 }}
              >
                Confiança
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(confidence * 100).toFixed(1)}%
              </Typography>
            </Box>
          ) : null}
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: 400 }}
            >
              Timestamp
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontFamily: "monospace" }}
            >
              {new Date(capture.timestamp).toLocaleTimeString("pt-BR")}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
