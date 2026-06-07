"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CloudUpload as UploadIcon,
  Psychology as MlIcon,
} from "@mui/icons-material";
import { Card } from "@/components/ui/Card";
import { getClientApiClient } from "@/lib/api/client";
import { resolveApiError } from "@/lib/api/errors";
import * as mlApi from "@/lib/api/ml";
import { getVehicleCategoryLabel } from "@/lib/vehicle-category";
import type { VehicleClassificationResult } from "@/types";

/**
 * MUI official file-upload pattern — do NOT use display:none; it breaks the
 * native picker on some browsers (incl. Windows Chrome).
 * @see https://mui.com/material-ui/react-button/#file-upload
 */
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function isAcceptedImage(file: File): boolean {
  if (
    ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return true;
  }
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export default function MLPlayground() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VehicleClassificationResult | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!isAcceptedImage(file)) {
      setError("Formato não suportado. Use JPG, PNG ou WebP.");
      return;
    }

    setError(null);
    setResult(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    setBusy(true);
    try {
      const classification = await mlApi.classifyVehicle(
        getClientApiClient(),
        file,
        file.name,
      );
      setResult(classification);
    } catch (e) {
      setError(resolveApiError(e, "Falha ao classificar a imagem."));
    } finally {
      setBusy(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    void handleFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (busy) return;
    void handleFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <Card
      title="Playground ML"
      subtitle="Envie imagens para validar o classificador de ambulâncias sem registrar acessos ou acionar a cancela"
    >
      <Stack spacing={3}>
        <Box
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragOver(false);
          }}
          onDrop={handleDrop}
          sx={{
            position: "relative",
            alignSelf: "stretch",
            minHeight: 140,
            borderRadius: 2,
            border: "2px dashed",
            borderColor: dragOver ? "primary.main" : "divider",
            bgcolor: dragOver ? "action.hover" : "background.paper",
            transition: "border-color 0.2s ease, background-color 0.2s ease",
            overflow: "hidden",
          }}
        >
          {/* Visual layer — must not intercept clicks */}
          <Stack
            spacing={1}
            sx={{
              px: 3,
              py: 3,
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <UploadIcon
              color={busy ? "disabled" : "primary"}
              sx={{ fontSize: 40 }}
            />
            <Typography
              variant="body1"
              color={busy ? "text.disabled" : "text.primary"}
              sx={{ fontWeight: 600 }}
            >
              Clique ou arraste uma imagem
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG ou WebP
            </Typography>
          </Stack>

          {/* MUI file-upload label covers the whole drop zone */}
          {!busy && (
            <Button
              component="label"
              role={undefined}
              tabIndex={-1}
              variant="text"
              disableRipple
              sx={{
                position: "absolute",
                inset: 0,
                m: 0,
                minWidth: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                zIndex: 2,
                cursor: "pointer",
              }}
            >
              Selecionar imagem
              <VisuallyHiddenInput
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={handleInputChange}
              />
            </Button>
          )}
        </Box>

        {busy && <LinearProgress />}

        {previewUrl && (
          <Box
            component="img"
            src={previewUrl}
            alt="Pré-visualização"
            sx={{
              maxWidth: "100%",
              maxHeight: 320,
              borderRadius: 2,
              objectFit: "contain",
              bgcolor: "action.hover",
            }}
          />
        )}

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {result && (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2, alignItems: "center" }}
            >
              <MlIcon color="primary" />
              <Typography variant="h6">Resultado da classificação</Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              <Chip
                color={
                  result.predicted_category === "ambulance"
                    ? "error"
                    : "default"
                }
                label={`${getVehicleCategoryLabel(result.predicted_category)} · ${(result.confidence * 100).toFixed(1)}%`}
              />
              <Chip
                variant="outlined"
                label={`Backend: ${result.classifier_backend}`}
              />
              <Chip
                variant="outlined"
                label={`Modelo: ${result.model_version}`}
              />
            </Stack>

            {result.all_scores && result.all_scores.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Scores brutos
                </Typography>
                <Stack spacing={0.5}>
                  {result.all_scores.map((score) => (
                    <Typography
                      key={score.category}
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {getVehicleCategoryLabel(score.category)}:{" "}
                      {(score.score * 100).toFixed(2)}%
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        <Typography variant="caption" color="text.secondary">
          Endpoint:{" "}
          <code style={{ fontSize: "0.75rem" }}>
            POST /api/v1/ml/classify-vehicle
          </code>{" "}
          — resultado permanece visível até enviar uma nova imagem.
        </Typography>
      </Stack>
    </Card>
  );
}
