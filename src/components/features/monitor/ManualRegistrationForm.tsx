"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  Chip,
  Typography,
} from "@mui/material";
import {
  Save as SaveIcon,
  DirectionsCar as CarIcon,
  Description as DescriptionIcon,
  Sensors as SensorsIcon,
} from "@mui/icons-material";
import { getClientApiClient } from "@/lib/api/client";
import { resolveApiError } from "@/lib/api/errors";
import * as logsApi from "@/lib/api/logs";
import * as whitelistApi from "@/lib/api/whitelist";
import { useSnackbar } from "@/hooks/use-snackbar";
import { Card } from "@/components/ui/Card";
import { useMonitorFrameCapture } from "@/contexts/monitor-frame-capture-context";
import type { VehicleClassificationResult } from "@/types";
import { getAccessLogToast } from "@/lib/gate-trigger-toast";
import { getVehicleCategoryLabel } from "@/lib/vehicle-category";

interface ManualRegistrationFormProps {
  initialPlate?: string;
  deniedLogId?: string;
  onSuccess?: () => void;
  onAccessLogRegistered?: () => void;
}

export default function ManualRegistrationForm({
  initialPlate,
  deniedLogId,
  onSuccess,
  onAccessLogRegistered,
}: ManualRegistrationFormProps) {
  const [plate, setPlate] = useState(initialPlate ?? "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessLogBusy, setAccessLogBusy] = useState(false);
  const [lastClassification, setLastClassification] =
    useState<VehicleClassificationResult | null>(null);
  const { showMessage } = useSnackbar();
  const { captureFrame } = useMonitorFrameCapture();

  const handleRegisterAccessAttempt = async () => {
    if (!plate) return;

    setAccessLogBusy(true);
    try {
      const blob = await captureFrame();
      if (!blob || blob.size === 0) {
        showMessage(
          "Captura vazia: aponte a câmera USB para a placa antes de registrar.",
          "warning",
        );
        return;
      }

      const log = await logsApi.createAccessLog(
        getClientApiClient(),
        plate,
        blob,
        "monitor-access.jpg",
      );

      setLastClassification(log.vehicle_classification ?? null);

      const toast = getAccessLogToast(
        log.plate_string_detected,
        log.status,
        log.gate_trigger,
        log.vehicle_classification,
      );
      showMessage(toast.message, toast.severity);
      onAccessLogRegistered?.();
    } catch (e) {
      showMessage(resolveApiError(e, "Erro ao registrar passagem."), "error");
    } finally {
      setAccessLogBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate) return;

    setLoading(true);
    try {
      const client = getClientApiClient();
      if (deniedLogId) {
        await logsApi.whitelistFromDeniedLog(client, deniedLogId, description);
        showMessage(
          "Placa adicionada à whitelist. O registro negado permanece no histórico.",
          "success",
        );
      } else {
        await whitelistApi.addPlate(client, plate, description);
        showMessage("Placa cadastrada na whitelist com sucesso!", "success");
      }
      setPlate("");
      setDescription("");
      if (onSuccess) onSuccess();
    } catch {
      showMessage("Erro ao cadastrar placa na whitelist.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title="Cadastro Rápido"
        subtitle="Cadastre veículos visitantes ou não reconhecidos para liberar o acesso imediato"
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {lastClassification && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Classificação (última passagem)
              </Typography>
              <Chip
                color={
                  lastClassification.predicted_category === "ambulance"
                    ? "error"
                    : "default"
                }
                label={`${getVehicleCategoryLabel(lastClassification.predicted_category)} · ${(lastClassification.confidence * 100).toFixed(1)}%`}
              />
            </Box>
          )}

          <TextField
            label="Placa do Veículo"
            value={plate}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, "");
              setPlate(value);
            }}
            required
            fullWidth
            placeholder="ABC-1234"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CarIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                fontSize: "1.125rem",
                fontWeight: 600,
              },
            }}
          />

          <TextField
            label="Descrição / Proprietário"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Ex: Visitante Apto 101, Funcionário, etc."
            multiline
            rows={3}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <DescriptionIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="button"
            variant="outlined"
            color="primary"
            size="large"
            startIcon={accessLogBusy ? null : <SensorsIcon />}
            onClick={() => void handleRegisterAccessAttempt()}
            disabled={accessLogBusy || loading || !plate}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600 }}
          >
            {accessLogBusy ? "Registrando passagem…" : "Registrar passagem"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: -1 }}
          >
            Envia placa e frame ao servidor; a autorização ou negação segue as
            regras da whitelist e do classificador de ambulância.
          </Typography>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? null : <SaveIcon />}
            disabled={loading || !plate}
            fullWidth
            sx={{
              mt: 1,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {loading ? "Cadastrando na whitelist…" : "Cadastrar na whitelist"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: -1 }}
          >
            Inclui a placa na lista de veículos autorizados para passagens
            futuras, sem abrir o portão neste momento.
          </Typography>
        </Box>
      </Card>
    </>
  );
}
