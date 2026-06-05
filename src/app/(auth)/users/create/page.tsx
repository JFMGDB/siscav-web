"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import AuthCredentialsForm, {
  type AuthSubmitValues,
} from "@/components/features/auth/AuthCredentialsForm";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/use-auth";
import { isPlatformSuperadmin } from "@/lib/auth/roles";
import { resolveAuthError } from "@/lib/auth-form";
import { MESSAGES, ROUTES } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { USERS_QUERY_KEY } from "@/hooks/use-users";

export default function CreateUserPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState("register-0");

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
      const created = await register(email, password);
      setSuccessMessage(`Usuário ${created.email} criado com sucesso.`);
      setFormKey(`register-${Date.now()}`);
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    } catch (err) {
      setApiError(resolveAuthError(err, "register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        component={Link}
        href={ROUTES.AUTH.SETTINGS}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, px: 0 }}
        color="inherit"
        size="small"
      >
        {MESSAGES.ACCOUNTS.BACK_TO_HUB}
      </Button>

      <Box sx={{ maxWidth: 480, mx: { xs: 0, sm: "auto" } }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            {MESSAGES.AUTH.CREATE_USER_TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {MESSAGES.AUTH.CREATE_USER_SUBTITLE}
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>
            {successMessage}
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }}>
            {apiError}
          </Alert>
        )}

        <Card hover={false} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <AuthCredentialsForm
            key={formKey}
            mode="register"
            loading={loading}
            submitLabel={MESSAGES.ACCOUNTS.CREATE_BUTTON}
            onSubmit={handleValidSubmit}
          />
        </Card>
      </Box>
    </Box>
  );
}
