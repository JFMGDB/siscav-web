"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import CameraFeed from "@/components/features/monitor/CameraFeed";
import PlateRecognitionDisplay from "@/components/features/monitor/PlateRecognitionDisplay";
import ManualRegistrationForm from "@/components/features/monitor/ManualRegistrationForm";
import PlateAccessConfirmDialogs from "@/components/features/monitor/PlateAccessConfirmDialogs";
import OcrStatusPanel from "@/components/features/monitor/OcrStatusPanel";
import { MonitorFrameCaptureProvider } from "@/contexts/monitor-frame-capture-context";
import { useMonitorPlateOrchestration } from "@/hooks/use-monitor-plate-orchestration";

function MonitorOrchestration({
  onAccessLogRegistered,
  onUnknownPlate,
  onRegistrationSuccess,
  unknownPlate,
  deniedLogId,
}: {
  onAccessLogRegistered: () => void;
  onUnknownPlate: (plate: string, logId: string) => void;
  onRegistrationSuccess: () => void;
  unknownPlate: string;
  deniedLogId?: string;
}) {
  const orchestration = useMonitorPlateOrchestration({
    onAccessLogRegistered,
  });

  return (
    <>
      <PlateAccessConfirmDialogs
        authorizeOpen={orchestration.authorizeOpen}
        whitelistOpen={orchestration.whitelistOpen}
        pending={orchestration.pending}
        busy={orchestration.busy}
        onAuthorize={() => void orchestration.handleAuthorize()}
        onDeny={orchestration.handleDeny}
        onAddToWhitelist={() => void orchestration.handleAddToWhitelist()}
        onSkipWhitelist={orchestration.handleSkipWhitelist}
      />
      <Box>
        <OcrStatusPanel status={orchestration.ocrStatus} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <PlateRecognitionDisplay onUnknownPlate={onUnknownPlate} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <ManualRegistrationForm
          key={`${unknownPlate}-${deniedLogId ?? "none"}`}
          initialPlate={unknownPlate}
          deniedLogId={deniedLogId}
          onSuccess={onRegistrationSuccess}
          onAccessLogRegistered={onAccessLogRegistered}
          disableAutoOcr
        />
      </Box>
    </>
  );
}

export default function MonitorPage() {
  const [unknownPlate, setUnknownPlate] = useState<string>("");
  const [deniedLogId, setDeniedLogId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const handleUnknownPlate = (plate: string, logId: string) => {
    setUnknownPlate(plate);
    setDeniedLogId(logId);
  };

  const handleRegistrationSuccess = () => {
    setUnknownPlate("");
    setDeniedLogId(undefined);
  };

  const handleAccessLogRegistered = () => {
    void queryClient.invalidateQueries({
      queryKey: ["monitor", "lastCapture"],
    });
    void queryClient.invalidateQueries({ queryKey: ["logs"] });
    void queryClient.invalidateQueries({ queryKey: ["whitelist", "monitor"] });
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
              <MonitorOrchestration
                onAccessLogRegistered={handleAccessLogRegistered}
                onUnknownPlate={handleUnknownPlate}
                onRegistrationSuccess={handleRegistrationSuccess}
                unknownPlate={unknownPlate}
                deniedLogId={deniedLogId}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </MonitorFrameCaptureProvider>
  );
}
