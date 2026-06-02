"use client";

import Image from "next/image";
import { Box } from "@mui/material";

export default function AuthBrandPanel() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 180, md: "100%" },
        minHeight: { md: "100vh" },
        flex: { md: 1 },
      }}
    >
      <Image
        src="/mantis-illustration.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 900px) 100vw, 50vw"
        style={{ objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: {
            xs: "linear-gradient(to bottom, rgba(15, 118, 110, 0.35), rgba(15, 118, 110, 0.55))",
            md: "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(15, 118, 110, 0.35) 100%)",
          },
          pointerEvents: "none",
        }}
        aria-hidden
      />
    </Box>
  );
}
