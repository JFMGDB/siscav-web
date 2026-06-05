"use client";

import React from "react";
import Link from "next/link";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useAuth } from "@/hooks/use-auth";
import { isPlatformSuperadmin } from "@/lib/auth/roles";
import { useCameraConfig } from "@/hooks/use-camera-config";
import { ROUTES } from "@/constants";
import { redactUrlForDisplay } from "@/lib/camera/validate-camera-url";

export default function SettingsPage() {
  const { user } = useAuth();
  const { config } = useCameraConfig();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {user && isPlatformSuperadmin(user)
            ? "Gestão de contas"
            : "Configurações do Sistema"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {user && isPlatformSuperadmin(user)
            ? "Crie e administre contas de acesso ao sistema."
            : "Configure a câmara usada no monitoramento (USB ou URL na rede)."}
        </Typography>
      </Box>

      {isPlatformSuperadmin(user) && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crie contas de acesso para operadores do sistema.
          </Typography>
          <Button
            component={Link}
            href={ROUTES.AUTH.USERS_CREATE}
            variant="contained"
          >
            Criar usuário
          </Button>
        </Paper>
      )}

      {!isPlatformSuperadmin(user) && (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Câmara no monitor
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          component="p"
          sx={{ mb: 2 }}
        >
          O feed ao vivo em <strong>Monitoramento</strong> usa a configuração
          guardada em <strong>Pré-visualização</strong> (USB ou URL na rede),
          armazenada neste browser.
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Fonte:</strong>{" "}
            {config.source === "usb"
              ? "USB / este dispositivo"
              : "Câmara na rede (URL)"}
          </Typography>
          {config.source === "network" && config.networkUrl.trim() && (
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              <strong>URL:</strong> {redactUrlForDisplay(config.networkUrl)}
            </Typography>
          )}
          {config.source === "usb" && config.usbDeviceId && (
            <Typography variant="body2" color="text.secondary">
              Dispositivo USB selecionado (identificador guardado para este
              browser).
            </Typography>
          )}
        </Stack>
        <Button component={Link} href={ROUTES.AUTH.CAMERA} variant="contained">
          Editar em Pré-visualização
        </Button>
      </Paper>
      )}
    </Container>
  );
}
