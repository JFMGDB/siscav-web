import { z } from "zod";

/** Mirrors UserCreate.password min_length in siscav-api. */
export const AUTH_PASSWORD_MIN_LENGTH = 8;

const emailField = z
  .string()
  .trim()
  .min(1, { message: "Informe seu e-mail." })
  .pipe(z.email({ message: "Informe um e-mail válido." }));

const passwordField = z.string().min(1, { message: "Informe sua senha." });

/** Mirrors POST /login/access-token — frontend-integration.md */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

/** Mirrors UserCreate (email + password min 8) — siscav-api/schemas/user.py */
export const registerSchema = z
  .object({
    email: emailField,
    password: z.string().min(AUTH_PASSWORD_MIN_LENGTH, {
      message: "Senha deve ter no mínimo 8 caracteres.",
    }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
