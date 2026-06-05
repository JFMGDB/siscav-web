/**
 * Base HTTP client. Token is supplied via getToken (server: cookies(), client: document.cookie).
 * No sessionStorage/localStorage; cookie-based auth per ADR 0003.
 */

import { API_CONFIG, AUTH_CONFIG } from "@/constants";
import { formatApiErrorDetail } from "./errors";

const COOKIE_MAX_AGE_ACCESS = 60 * 60; // 1 hour
const COOKIE_MAX_AGE_REFRESH = 60 * 60 * 24 * 7; // 7 days

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Browser-only: read access_token cookie with same encode/decode rules as setCookie/getCookie. */
export function readBrowserAccessToken(): string | null {
  return getCookie(AUTH_CONFIG.ACCESS_TOKEN_KEY);
}

/** Browser-only: read refresh_token cookie with same encode/decode rules as setCookie/getCookie. */
export function readBrowserRefreshToken(): string | null {
  return getCookie(AUTH_CONFIG.REFRESH_TOKEN_KEY);
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
}

export async function parseApiError(response: Response): Promise<string> {
  const text = await response.text();
  let message = response.statusText || "API Error";
  try {
    const json = JSON.parse(text);
    const raw = json.detail ?? json.message;
    message = raw !== undefined ? formatApiErrorDetail(raw) : message;
  } catch {
    if (text) message = text;
  }
  return message;
}

export type GetToken = () => Promise<string | null> | string | null;

export interface ApiClientOptions {
  baseUrl: string;
  /** Server: () => (await cookies()).get(ACCESS_TOKEN_KEY)?.value ?? null. Client: () => getCookie(ACCESS_TOKEN_KEY). */
  getToken: GetToken;
  /** Client-only: called after login/refresh to persist tokens in cookies. Server client ignores. */
  setTokens?: (access: string | null, refresh: string | null) => void;
  /** Client-only: clear tokens from cookies. */
  clearTokens?: () => void;
  /** Client-only: return refresh token for refresh flow. */
  getRefreshToken?: () => string | null;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: GetToken;
  private setTokensImpl: (
    access: string | null,
    refresh: string | null,
  ) => void;
  private clearTokensCallback: () => void;
  private getRefreshToken: () => string | null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.getToken = options.getToken;
    this.setTokensImpl = options.setTokens ?? (() => {});
    this.clearTokensCallback = options.clearTokens ?? (() => {});
    this.getRefreshToken = options.getRefreshToken ?? (() => null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp - 60000;
    } catch {
      return true;
    }
  }

  private async resolveToken(): Promise<string | null> {
    const t = this.getToken();
    return t instanceof Promise ? t : Promise.resolve(t);
  }

  async refreshTokens(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refresh = this.getRefreshToken();
        if (!refresh) throw new Error("Refresh token not found");
        const form = new URLSearchParams({ refresh_token: refresh });
        const res = await fetch(
          `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form,
          },
        );
        if (!res.ok) {
          this.clearTokensCallback();
          if (res.status === 403 || res.status === 404)
            throw new Error("Session expired. Please log in again.");
          throw new Error(await parseApiError(res));
        }
        const data = await res.json();
        this.setTokensImpl(data.access_token, data.refresh_token ?? null);
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  /** Parses JSON when present; empty 204/205 and blank bodies must not throw. */
  private async readResponseBody<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return JSON.parse(text) as T;
    }

    return text as unknown as T;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    let token = await this.resolveToken();
    if (token && this.isTokenExpired(token)) {
      try {
        await this.refreshTokens();
        token = await this.resolveToken();
      } catch {
        // continue; server may still return 401
      }
    }

    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry) {
      try {
        await this.refreshTokens();
      } catch (e) {
        this.clearTokensCallback();
        throw e;
      }

      token = await this.resolveToken();
      const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      if (!retryRes.ok) throw new Error(await parseApiError(retryRes));
      return this.readResponseBody<T>(retryRes);
    }

    if (!response.ok) throw new Error(await parseApiError(response));

    return this.readResponseBody<T>(response);
  }

  /**
   * POST multipart/form-data expecting JSON. Rebuilds the body on every attempt — `FormData` is
   * one-shot in the Fetch API, so reusing the same instance after 401/refresh would send an empty body.
   */
  async requestMultipartJson<T>(
    endpoint: string,
    buildFormData: () => FormData,
    retry = true,
  ): Promise<T> {
    let token = await this.resolveToken();
    if (token && this.isTokenExpired(token)) {
      try {
        await this.refreshTokens();
        token = await this.resolveToken();
      } catch {
        // continue; server may still return 401
      }
    }

    const doFetch = async (): Promise<Response> => {
      const form = buildFormData();
      const t = await this.resolveToken();
      const headers: HeadersInit = {
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      };
      return fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: form,
      });
    };

    let response = await doFetch();

    if ((response.status === 401 || response.status === 403) && retry) {
      try {
        await this.refreshTokens();
        response = await doFetch();
      } catch (e) {
        this.clearTokensCallback();
        throw e;
      }
    }

    if (!response.ok) throw new Error(await parseApiError(response));

    const ct = response.headers.get("content-type");
    if (ct?.includes("application/json")) return response.json();
    return {} as T;
  }

  /** Client-only: set tokens after login (cookies). */
  setTokens(access: string | null, refresh: string | null): void {
    this.setTokensImpl(access, refresh);
  }

  /** Client-only: clear tokens (logout). */
  clearTokens(): void {
    this.clearTokensCallback();
  }

  /** Normalized base URL (no trailing slash), same string used by `request()`. */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /** GET binary response (e.g. access log images) with Bearer auth and refresh retry. */
  async requestBlob(endpoint: string, retry = true): Promise<Blob> {
    let token = await this.resolveToken();
    if (token && this.isTokenExpired(token)) {
      try {
        await this.refreshTokens();
        token = await this.resolveToken();
      } catch {
        // continue; server may still return 401
      }
    }

    const fetchOnce = async (authToken: string | null) =>
      fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

    let response = await fetchOnce(token);

    if ((response.status === 401 || response.status === 403) && retry) {
      try {
        await this.refreshTokens();
        token = await this.resolveToken();
        response = await fetchOnce(token);
      } catch (e) {
        this.clearTokensCallback();
        throw e;
      }
    }

    if (!response.ok) throw new Error(await parseApiError(response));
    return response.blob();
  }
}

/** Singleton for client-side. Reads/writes cookies. */
let clientSingleton: ApiClient | null = null;

function getClientSingleton(): ApiClient {
  if (!clientSingleton) {
    clientSingleton = new ApiClient({
      baseUrl: API_CONFIG.BASE_URL,
      getToken: () => readBrowserAccessToken(),
      setTokens: (access, refresh) => {
        if (access)
          setCookie(
            AUTH_CONFIG.ACCESS_TOKEN_KEY,
            access,
            COOKIE_MAX_AGE_ACCESS,
          );
        else deleteCookie(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        if (refresh)
          setCookie(
            AUTH_CONFIG.REFRESH_TOKEN_KEY,
            refresh,
            COOKIE_MAX_AGE_REFRESH,
          );
        else deleteCookie(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      },
      clearTokens: () => {
        deleteCookie(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        deleteCookie(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      },
      getRefreshToken: () => readBrowserRefreshToken(),
    });
  }
  return clientSingleton;
}

export function getClientApiClient(): ApiClient {
  return getClientSingleton();
}

/** Use only in Server Components or Server Actions. Reads token from next/headers cookies(). */
export async function getServerApiClient(): Promise<ApiClient> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return new ApiClient({
    baseUrl: API_CONFIG.BASE_URL,
    getToken: () =>
      Promise.resolve(store.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value ?? null),
  });
}
