"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Box, Typography, Alert } from "@mui/material";
import AuthBrandPanel from "./AuthBrandPanel";
import AuthCredentialsForm, {
  type AuthSubmitValues,
} from "./AuthCredentialsForm";
import AuthWelcomeHeader from "./AuthWelcomeHeader";
import { resolveAuthError } from "@/lib/auth-form";

const displayFont = 'var(--font-auth-display), "Inter", sans-serif';

export default function AuthPage() {
  const { login } = useAuth();

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidSubmit = async ({ email, password }: AuthSubmitValues) => {
    setApiError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setApiError(resolveAuthError(err, "login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          flex: { md: 1 },
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: 0,
          order: { xs: 2, md: 1 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, sm: 24, md: 32 },
            left: { xs: 24, sm: 32, md: 48 },
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Image
            src="/mantis-logo-mark.png"
            alt="Mantis"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <Typography
            variant="h6"
            component="span"
            sx={{ fontFamily: displayFont, fontWeight: 700 }}
          >
            Mantis
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "center",
            px: { xs: 3, sm: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 420,
              pt: { xs: 6, md: 7 },
            }}
          >
            <AuthWelcomeHeader mode="login" />

            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}

            <AuthCredentialsForm
              key="login"
              mode="login"
              loading={loading}
              onSubmit={handleValidSubmit}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: { md: 1 },
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          order: { xs: 1, md: 2 },
        }}
      >
        <AuthBrandPanel />
      </Box>
    </Box>
  );
}
