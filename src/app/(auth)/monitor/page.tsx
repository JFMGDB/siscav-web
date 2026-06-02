"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import CameraFeed from "@/components/features/monitor/CameraFeed";
import PlateRecognitionDisplay from "@/components/features/monitor/PlateRecognitionDisplay";
import ManualRegistrationForm from "@/components/features/monitor/ManualRegistrationForm";
import { MonitorFrameCaptureProvider } from "@/contexts/monitor-frame-capture-context";

export default function MonitorPage() {
  const [unknownPlate, setUnknownPlate] = useState<string>("");
  const queryClient = useQueryClient();

  const handleUnknownPlate = (plate: string) => {
    setUnknownPlate(plate);
  };

  const handleRegistrationSuccess = () => {
    setUnknownPlate("");
  };

  const handleAccessLogRegistered = () => {
    void queryClient.invalidateQueries({
      queryKey: ["monitor", "lastCapture"],
    });
    void queryClient.invalidateQueries({ queryKey: ["logs"] });
  };

  return (
    <MonitorFrameCaptureProvider>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Monitoramento de Acesso
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Visualize o fluxo de veículos e gerencie acessos em tempo real.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <CameraFeed />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                height: "100%",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <PlateRecognitionDisplay onUnknownPlate={handleUnknownPlate} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <ManualRegistrationForm
                  initialPlate={unknownPlate}
                  onSuccess={handleRegistrationSuccess}
                  onAccessLogRegistered={handleAccessLogRegistered}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </MonitorFrameCaptureProvider>
  );
}
