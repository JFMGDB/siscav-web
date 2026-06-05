"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import AuthCredentialsForm, {
  type AuthSubmitValues,
} from "@/components/features/auth/AuthCredentialsForm";
import { useAuth } from "@/hooks/use-auth";
import { isPlatformSuperadmin } from "@/lib/auth/roles";
import { resolveAuthError } from "@/lib/auth-form";
import { MESSAGES, ROUTES } from "@/constants";

export default function CreateUserPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !isPlatformSuperadmin(user)) {
      router.push(ROUTES.AUTH.DASHBOARD);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isPlatformSuperadmin(user)) {
    return null;
  }

  const handleValidSubmit = async ({ email, password }: AuthSubmitValues) => {
    setApiError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      if (!register) {
        setApiError(MESSAGES.AUTH.CREATE_USER_FORBIDDEN);
        return;
      }
      await register(email, password);
      setSuccessMessage(MESSAGES.AUTH.CREATE_USER_SUCCESS);
    } catch (err) {
      setApiError(resolveAuthError(err, "register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {MESSAGES.AUTH.CREATE_USER_TITLE}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {MESSAGES.AUTH.CREATE_USER_SUBTITLE}
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <AuthCredentialsForm
        key="register"
        mode="register"
        loading={loading}
        onSubmit={handleValidSubmit}
      />
    </Container>
  );
}
