"use client";

import React, { useState } from "react";
import { Typography, Button, Box, CircularProgress, Stack } from "@mui/material";
import {
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { getClientApiClient } from "@/lib/api/client";
import * as gateApi from "@/lib/api/gate";
import { resolveApiError } from "@/lib/api/errors";
import { useSnackbar } from "@/hooks/use-snackbar";
import { MESSAGES } from "@/constants";
import { Card } from "@/components/ui/Card";

type GateAction = "open" | "close" | null;

export default function GateControl() {
  const [loading, setLoading] = useState<GateAction>(null);
  const { showMessage } = useSnackbar();

  const handleOpenGate = async () => {
    setLoading("open");
    try {
      await gateApi.openGate(getClientApiClient());
      showMessage(MESSAGES.GATE.OPEN_SUCCESS, "success");
    } catch (e) {
      showMessage(resolveApiError(e, MESSAGES.GATE.OPEN_ERROR), "error");
    } finally {
      setLoading(null);
    }
  };

  const handleCloseGate = async () => {
    setLoading("close");
    try {
      await gateApi.closeGate(getClientApiClient());
      showMessage(MESSAGES.GATE.CLOSE_SUCCESS, "success");
    } catch (e) {
      showMessage(resolveApiError(e, MESSAGES.GATE.CLOSE_ERROR), "error");
    } finally {
      setLoading(null);
    }
  };

  const isBusy = loading !== null;

  return (
    <>
      <Card
        title="Controle Remoto do Portão"
        subtitle="Abra ou feche o portão manualmente quando necessário"
        sx={{
          textAlign: "center",
          background: "linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        }}
      >
        <Box sx={{ py: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
            }}
          >
            <LockOpenIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use os botões abaixo para controlar o portão remotamente. Na
            simulação Wokwi, o portão também fecha sozinho após cerca de 10
            segundos.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Button
                variant="contained"
                color="warning"
                size="large"
                startIcon={loading === "open" ? null : <LockOpenIcon />}
                onClick={handleOpenGate}
                disabled={isBusy}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  minWidth: 180,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  boxShadow: "0 4px 15px -3px rgba(245, 158, 11, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    boxShadow: "0 6px 20px -3px rgba(245, 158, 11, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                {loading === "open" ? "Abrindo..." : "Abrir Portão"}
              </Button>
              {loading === "open" && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                    color: "white",
                  }}
                />
              )}
            </Box>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Button
                variant="outlined"
                color="warning"
                size="large"
                startIcon={loading === "close" ? null : <LockIcon />}
                onClick={handleCloseGate}
                disabled={isBusy}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  minWidth: 180,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                {loading === "close" ? "Fechando..." : "Fechar Portão"}
              </Button>
              {loading === "close" && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                    color: "warning.main",
                  }}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
