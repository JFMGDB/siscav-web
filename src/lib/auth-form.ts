import { ApiHttpError } from "@/lib/api/errors";

export type AuthFormMode = "login" | "register";

/**
 * Resolves auth errors for the UI. ApiHttpError from auth.ts already carries pt-BR copy.
 */
export function resolveAuthError(err: unknown, mode: AuthFormMode): string {
  if (err instanceof ApiHttpError) {
    return err.detail;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return mode === "register"
    ? "Erro ao criar conta. Tente novamente."
    : "Erro ao fazer login. Tente novamente.";
}
