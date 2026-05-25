"use client";

import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import UsbCameraPreview from "@/components/features/camera/UsbCameraPreview";
import NetworkCameraPreview from "@/components/features/camera/NetworkCameraPreview";
import { loadCameraConfig } from "@/lib/camera/camera-config";

export default function CameraPreviewPanel() {
  const [tab, setTab] = useState(() =>
    loadCameraConfig().source === "network" ? 1 : 0,
  );

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="USB / Este dispositivo"
          id="camera-tab-usb"
          aria-controls="camera-panel-usb"
        />
        <Tab
          label="Câmara na rede (URL)"
          id="camera-tab-network"
          aria-controls="camera-panel-network"
        />
      </Tabs>
      <Box
        role="tabpanel"
        hidden={tab !== 0}
        id="camera-panel-usb"
        aria-labelledby="camera-tab-usb"
      >
        {tab === 0 && <UsbCameraPreview />}
      </Box>
      <Box
        role="tabpanel"
        hidden={tab !== 1}
        id="camera-panel-network"
        aria-labelledby="camera-tab-network"
      >
        {tab === 1 && <NetworkCameraPreview />}
      </Box>
    </Box>
  );
}
