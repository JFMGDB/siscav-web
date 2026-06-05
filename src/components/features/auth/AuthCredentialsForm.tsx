"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  OutlinedInput,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import type { AuthFormMode } from "@/lib/auth-form";
import {
  AUTH_PASSWORD_MIN_LENGTH,
  loginSchema,
  registerSchema,
  type LoginFormValues,
} from "@/lib/auth-schema";

export type AuthSubmitValues = {
  email: string;
  password: string;
};

export interface AuthCredentialsFormProps {
  mode: AuthFormMode;
  loading: boolean;
  onSubmit: (values: AuthSubmitValues) => void | Promise<void>;
  submitLabel?: string;
}

type FormValues = LoginFormValues & { confirmPassword?: string };

const defaultValues: FormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthCredentialsForm({
  mode,
  loading,
  onSubmit,
  submitLabel,
}: AuthCredentialsFormProps) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const passwordAutoComplete = isRegister ? "new-password" : "current-password";
  const fieldMargin = isRegister ? "dense" : "normal";

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onValidSubmit = (values: FormValues) => {
    void onSubmit({
      email: values.email.trim(),
      password: values.password,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onValidSubmit)} noValidate>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <FormControl
            fullWidth
            margin={fieldMargin}
            required
            error={Boolean(fieldState.error)}
          >
            <FormLabel htmlFor="auth-email">E-mail</FormLabel>
            <OutlinedInput
              {...field}
              id="auth-email"
              type="email"
              autoComplete="email"
              autoFocus
              startAdornment={
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            />
            {fieldState.error && (
              <FormHelperText error>{fieldState.error.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <FormControl
            fullWidth
            margin={fieldMargin}
            required
            error={Boolean(fieldState.error)}
          >
            <FormLabel htmlFor="auth-password">Senha</FormLabel>
            <OutlinedInput
              {...field}
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={passwordAutoComplete}
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon fontSize="small" color="action" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {fieldState.error ? (
              <FormHelperText error>{fieldState.error.message}</FormHelperText>
            ) : isRegister ? (
              <FormHelperText>
                Mínimo de {AUTH_PASSWORD_MIN_LENGTH} caracteres
              </FormHelperText>
            ) : null}
          </FormControl>
        )}
      />

      {isRegister && (
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl
              fullWidth
              margin={fieldMargin}
              required
              error={Boolean(fieldState.error)}
            >
              <FormLabel htmlFor="auth-confirm-password">
                Confirmar senha
              </FormLabel>
              <OutlinedInput
                {...field}
                id="auth-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={field.value ?? ""}
                startAdornment={
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
              />
              {fieldState.error && (
                <FormHelperText error>
                  {fieldState.error.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 2, py: 1.25 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          submitLabel ?? (isRegister ? "Criar conta" : "Entrar")
        )}
      </Button>
    </Box>
  );
}
