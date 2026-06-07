"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  Stack,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Save as SaveIcon,
  DirectionsCar as CarIcon,
  Description as DescriptionIcon,
  DocumentScanner as OcrIcon,
  Sensors as SensorsIcon,
} from "@mui/icons-material";
import { getClientApiClient } from "@/lib/api/client";
import { ApiHttpError, resolveApiError } from "@/lib/api/errors";
import * as mlApi from "@/lib/api/ml";
import * as logsApi from "@/lib/api/logs";
import * as whitelistApi from "@/lib/api/whitelist";
import { useSnackbar } from "@/hooks/use-snackbar";
import { Card } from "@/components/ui/Card";
import { useMonitorFrameCapture } from "@/contexts/monitor-frame-capture-context";
import type { PlateCandidate, VehicleClassificationResult } from "@/types";
import { getAccessLogToast } from "@/lib/gate-trigger-toast";
import { getVehicleCategoryLabel } from "@/lib/vehicle-category";

const AUTO_OCR_INTERVAL_MS = 4500;

interface ManualRegistrationFormProps {
  initialPlate?: string;
  deniedLogId?: string;
  onSuccess?: () => void;
  onAccessLogRegistered?: () => void;
  /** When true, auto-OCR runs in monitor orchestration hook instead. */
  disableAutoOcr?: boolean;
}

export default function ManualRegistrationForm({
  initialPlate,
  deniedLogId,
  onSuccess,
  onAccessLogRegistered,
  disableAutoOcr = false,
}: ManualRegistrationFormProps) {
  const [plate, setPlate] = useState(initialPlate ?? "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessLogBusy, setAccessLogBusy] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [autoOcrEnabled, setAutoOcrEnabled] = useState(!disableAutoOcr);
  const [candidates, setCandidates] = useState<PlateCandidate[]>([]);
  const [lastClassification, setLastClassification] =
    useState<VehicleClassificationResult | null>(null);
  const { showMessage } = useSnackbar();
  const { captureFrame, tryBeginOcr, endOcr } = useMonitorFrameCapture();
  const ocrInFlight = useRef(false);

  const runServerOcr = useCallback(
    async (mode: "manual" | "auto") => {
      if (ocrInFlight.current || loading) return;
      if (!tryBeginOcr()) {
        if (mode === "manual") {
          showMessage("OCR já em andamento. Aguarde a leitura atual.", "info");
        }
        return;
      }
      ocrInFlight.current = true;
      if (mode === "manual") setOcrBusy(true);
      try {
        const blob = await captureFrame();
        if (!blob || blob.size === 0) {
          if (mode === "manual") {
            showMessage(
              "Captura vazia: aguarde o vídeo ao vivo ou use USB. Em streams HTTP noutro domínio sem CORS o browser não permite exportar o frame.",
              "warning",
            );
          }
          return;
        }

        const res = await mlApi.recognizePlate(
          getClientApiClient(),
          blob,
          mode === "manual" ? "monitor-frame.jpg" : "monitor-auto.jpg",
        );

        setCandidates(res.candidates);

        if (res.candidates.length === 1) {
          const p =
            res.candidates[0].normalized_plate || res.candidates[0].plate_raw;
          setPlate((current) => {
            if (!current || current === p) return p;
            return current;
          });
        }

        if (mode === "manual") {
          if (res.candidates.length === 0) {
            showMessage("Nenhuma placa detectada neste frame.", "info");
          }
        }
      } catch (e) {
        if (mode === "auto") return;
        if (e instanceof ApiHttpError && e.status === 503) {
          showMessage(
            "OCR indisponível no servidor. Verifique se a API foi reiniciada com as dependências ML.",
            "error",
          );
        } else if (e instanceof ApiHttpError && e.status === 413) {
          showMessage("Imagem demasiado grande para o servidor.", "error");
        } else {
          showMessage(
            resolveApiError(e, "Erro ao chamar o OCR no servidor."),
            "error",
          );
        }
      } finally {
        ocrInFlight.current = false;
        endOcr();
        if (mode === "manual") setOcrBusy(false);
      }
    },
    [captureFrame, endOcr, loading, showMessage, tryBeginOcr],
  );

  useEffect(() => {
    if (!autoOcrEnabled || disableAutoOcr) return;
    const kickoff = window.setTimeout(() => void runServerOcr("auto"), 1500);
    const id = window.setInterval(
      () => void runServerOcr("auto"),
      AUTO_OCR_INTERVAL_MS,
    );
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [autoOcrEnabled, disableAutoOcr, runServerOcr]);

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
      showMessage(
        resolveApiError(e, "Erro ao registrar tentativa de acesso."),
        "error",
      );
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
        showMessage("Veículo cadastrado e autorizado com sucesso!", "success");
      }
      setPlate("");
      setDescription("");
      setCandidates([]);
      if (onSuccess) onSuccess();
    } catch {
      showMessage("Erro ao cadastrar veículo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyCandidate = (c: PlateCandidate) => {
    setPlate(c.normalized_plate || c.plate_raw);
    showMessage(`Placa "${c.normalized_plate}" selecionada.`, "success");
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
          <FormControlLabel
            control={
              <Switch
                checked={autoOcrEnabled}
                onChange={(_, c) => setAutoOcrEnabled(c)}
                color="primary"
                disabled={disableAutoOcr}
              />
            }
            label="OCR automático (servidor)"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: -1 }}
          >
            {disableAutoOcr
              ? "O monitor envia frames automaticamente para OCR, whitelist e portão."
              : "Com o vídeo ao vivo, envia periodicamente um frame para o OCR. Uma placa única preenche o campo quando está vazio ou confirma a mesma leitura."}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              startIcon={<OcrIcon />}
              onClick={() => void runServerOcr("manual")}
              disabled={ocrBusy || loading}
              fullWidth
              sx={{ flex: "1 1 100%" }}
            >
              {ocrBusy ? "A processar OCR…" : "Ler placa agora (OCR)"}
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            <code style={{ fontSize: "0.75rem" }}>
              POST /api/v1/ml/recognize-plate
            </code>{" "}
            com JWT (multipart campo{" "}
            <code style={{ fontSize: "0.75rem" }}>file</code>).
          </Typography>

          {candidates.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Candidatos (toque para usar)
              </Typography>
              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                {candidates.map((c, i) => (
                  <Chip
                    key={`${c.normalized_plate}-${i}`}
                    label={`${c.normalized_plate} · ${c.plate_color_hint}`}
                    onClick={() => applyCandidate(c)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {lastClassification && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Classificação (última tentativa)
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
            variant="contained"
            color="secondary"
            size="large"
            startIcon={accessLogBusy ? null : <SensorsIcon />}
            onClick={() => void handleRegisterAccessAttempt()}
            disabled={accessLogBusy || loading || !plate}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600 }}
          >
            {accessLogBusy
              ? "Registrando tentativa…"
              : "Registrar tentativa de acesso"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Simula o dispositivo IoT:{" "}
            <code style={{ fontSize: "0.75rem" }}>
              POST /api/v1/access_logs/
            </code>{" "}
            (multipart <code style={{ fontSize: "0.75rem" }}>file</code> +{" "}
            <code style={{ fontSize: "0.75rem" }}>plate</code>).
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
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              boxShadow: "0 4px 15px -3px rgba(37, 99, 235, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                boxShadow: "0 6px 20px -3px rgba(37, 99, 235, 0.5)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            {loading ? "Salvando..." : "Autorizar Acesso"}
          </Button>
        </Box>
      </Card>
    </>
  );
}
