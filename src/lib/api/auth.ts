/**
 * Auth API layer — maps HTTP status codes to pt-BR ApiHttpError
 * per the contract in siscav-api/docs/api/frontend-integration.md.
 *
 * Registration sends Bearer token (superadmin only). Uses fetch directly so 403
 * is not treated as a session refresh trigger (see ApiClient.request).
 *
 * @see siscav-api/apps/api/src/api/v1/endpoints/auth.py
 * @see siscav-api/apps/api/src/api/v1/schemas/user.py (UserCreate: min_length=8)
 */

import type { ApiClient } from "./client";
import { readBrowserAccessToken } from "./client";
import type { AuthResponse, User } from "@/types";
import { API_CONFIG, MESSAGES } from "@/constants";
import { ApiHttpError, parseApiResponse } from "./errors";

const REGISTER_INVALID_DATA_MSG = "Dados inválidos. Verifique e-mail e senha.";

/** Matches API `UserRead` (no password). */
interface UserReadResponse {
  id: string;
  email: string;
  is_admin: boolean;
  is_superadmin: boolean;
  created_at: string;
  updated_at: string;
}

function toAuthUser(data: UserReadResponse): User {
  return {
    id: String(data.id),
    email: data.email,
    name: data.email.split("@")[0] ?? data.email,
    is_admin: data.is_admin,
    is_superadmin: data.is_superadmin,
  };
}

/** Loads the authenticated user from GET /api/v1/users/me (Bearer access token). */
export async function fetchCurrentUser(client: ApiClient): Promise<User> {
  const data = await client.request<UserReadResponse>(
    API_CONFIG.ENDPOINTS.AUTH.ME,
  );
  return toAuthUser(data);
}

export async function register(
  client: ApiClient,
  email: string,
  password: string,
): Promise<UserReadResponse> {
  const token = readBrowserAccessToken();
  const res = await fetch(
    `${client.getBaseUrl()}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ email, password }),
    },
  );

  if (!res.ok) {
    switch (res.status) {
      case 403:
        throw new ApiHttpError(
          403,
          MESSAGES.AUTH.CREATE_USER_FORBIDDEN,
        );
      case 409:
        throw new ApiHttpError(
          409,
          "Este e-mail já está registrado. Tente fazer login.",
        );
      case 429:
        throw new ApiHttpError(
          429,
          "Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.",
        );
      case 400:
      case 422:
        throw new ApiHttpError(res.status, REGISTER_INVALID_DATA_MSG);
      default:
        throw await parseApiResponse(res);
    }
  }

  return res.json();
}

export async function login(
  client: ApiClient,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const form = new URLSearchParams({ username: email, password });
  const res = await fetch(
    `${client.getBaseUrl()}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    },
  );

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new ApiHttpError(
          401,
          "E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.",
        );
      case 400:
        throw new ApiHttpError(400, "Informe e-mail e senha para entrar.");
      case 429:
        throw new ApiHttpError(
          429,
          "Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.",
        );
      default: {
        const parsed = await parseApiResponse(res);
        throw new ApiHttpError(
          res.status,
          parsed.detail || "Erro ao fazer login. Tente novamente.",
        );
      }
    }
  }

  const token = await res.json();
  client.setTokens(token.access_token, token.refresh_token ?? null);

  const user = await fetchCurrentUser(client);

  return {
    access_token: token.access_token,
    token_type: token.token_type,
    refresh_token: token.refresh_token,
    user,
  };
}
