"use client";

import React from "react";
import { Box, Chip } from "@mui/material";
import {
  Videocam as VideocamIcon,
  FiberManualRecord as RecordIcon,
} from "@mui/icons-material";
import { Card } from "@/components/ui/Card";
import ConfiguredCameraLive from "@/components/features/camera/ConfiguredCameraLive";
import { useCameraConfig } from "@/hooks/use-camera-config";
import { useMonitorFrameCapture } from "@/contexts/monitor-frame-capture-context";

export default function CameraFeed() {
  const { config } = useCameraConfig();
  const { registerFrameCapture } = useMonitorFrameCapture();

  const sourceLabel =
    config.source === "usb"
      ? "USB"
      : config.networkUrl.trim()
        ? "Rede"
        : "Não configurada";

  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        minHeight: 500,
        bgcolor: "#000",
        p: 0,
        overflow: "hidden",
        "&:hover": {
          transform: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          display: "flex",
          gap: 1,
        }}
      >
        <Chip
          icon={
            <RecordIcon
              sx={{ color: "#ef4444 !important", fontSize: "12px !important" }}
            />
          }
          label="AO VIVO"
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.9)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.75rem",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.7 },
              "100%": { opacity: 1 },
            },
          }}
        />
        <Chip
          icon={<VideocamIcon sx={{ color: "white !important" }} />}
          label={sourceLabel}
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            fontWeight: 500,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 500,
          position: "relative",
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        }}
      >
        <ConfiguredCameraLive
          minHeight={500}
          maxVideoHeight={480}
          registerFrameCapture={registerFrameCapture}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
            backgroundSize: "50px 50px",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Card>
  );
}
