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
    <Card
      title="Controle Remoto do Portão"
      subtitle="Abra ou feche o portão manualmente quando necessário"
      sx={{
        background:
          "linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(13, 148, 136, 0.04) 100%)",
        border: "1px solid rgba(13, 148, 136, 0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "stretch" },
          gap: { xs: 3, md: 4 },
          py: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row", md: "row" },
            alignItems: { xs: "center", sm: "flex-start", md: "center" },
            gap: 2.5,
            flex: 1,
            minWidth: 0,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              flexShrink: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.35)",
            }}
          >
            <LockOpenIcon sx={{ fontSize: 36, color: "white" }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            Use os botões ao lado para controlar o portão remotamente.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            width: { xs: "100%", md: "auto" },
            flexShrink: 0,
            alignItems: "stretch",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <Box sx={{ position: "relative", flex: { xs: 1, md: "0 0 auto" } }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={loading === "open" ? null : <LockOpenIcon />}
              onClick={handleOpenGate}
              disabled={isBusy}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: { sm: 180 },
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
                  color: "primary.contrastText",
                }}
              />
            )}
          </Box>
          <Box sx={{ position: "relative", flex: { xs: 1, md: "0 0 auto" } }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              startIcon={loading === "close" ? null : <LockIcon />}
              onClick={handleCloseGate}
              disabled={isBusy}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: { sm: 180 },
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
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
                  color: "primary.main",
                }}
              />
            )}
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}
