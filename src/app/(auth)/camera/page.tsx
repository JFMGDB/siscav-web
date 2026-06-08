"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import CameraPreviewPanel from "@/components/features/camera/CameraPreviewPanel";

export default function CameraPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pré-visualização de câmera
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vídeo em tempo real a partir de uma câmera USB ou de uma URL na rede
          (MJPEG / HLS). O stream não passa pela API Mantis.
        </Typography>
      </Box>
      <CameraPreviewPanel />
    </Container>
  );
}
