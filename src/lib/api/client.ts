/**
 * Base HTTP client. Token is supplied via getToken (server: cookies(), client: document.cookie).
 * No sessionStorage/localStorage; cookie-based auth per ADR 0003.
 */

import { API_CONFIG, AUTH_CONFIG, MESSAGES, getApiBaseUrl } from "@/constants";
import {
  ApiHttpError,
  mapNetworkError,
  parseApiResponse,
} from "./errors";

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

export { parseApiResponse } from "./errors";

export type GetToken = () => Promise<string | null> | string | null;

export interface ApiClientOptions {
  baseUrl: string;
  getToken: GetToken;
  setTokens?: (access: string | null, refresh: string | null) => void;
  clearTokens?: () => void;
  getRefreshToken?: () => string | null;
}

function buildHeaders(
  token: string | null,
  options: RequestInit,
): HeadersInit {
  const base: Record<string, string> = { Accept: "application/json" };
  if (token) base.Authorization = `Bearer ${token}`;

  const incoming = new Headers(options.headers);
  incoming.forEach((value, key) => {
    base[key] = value;
  });

  const method = (options.method ?? "GET").toUpperCase();
  const hasBody = options.body != null && options.body !== "";
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (
    hasBody &&
    !isFormData &&
    !base["Content-Type"] &&
    !base["content-type"] &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    base["Content-Type"] = "application/json";
  }

  return base;
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

  private async safeFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
    timeoutMs: number = API_CONFIG.REQUEST_TIMEOUT_MS,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeoutMs,
    );
    const callerSignal = init?.signal;
    if (callerSignal?.aborted) {
      controller.abort();
    } else if (callerSignal) {
      callerSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiHttpError(0, MESSAGES.COMMON.REQUEST_TIMEOUT, "network");
      }
      throw mapNetworkError(err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async refreshTokens(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refresh = this.getRefreshToken();
        if (!refresh) {
          throw new ApiHttpError(401, MESSAGES.COMMON.SESSION_EXPIRED);
        }
        const form = new URLSearchParams({ refresh_token: refresh });
        const res = await this.safeFetch(
          `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form,
          },
        );
        if (!res.ok) {
          this.clearTokensCallback();
          if (res.status === 403 || res.status === 404) {
            throw new ApiHttpError(401, MESSAGES.COMMON.SESSION_EXPIRED);
          }
          throw await parseApiResponse(res);
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

    const headers = buildHeaders(token, options);
    let response = await this.safeFetch(`${this.baseUrl}${endpoint}`, {
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
      response = await this.safeFetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: buildHeaders(token, options),
      });
      if (!response.ok) throw await parseApiResponse(response);
      return this.readResponseBody<T>(response);
    }

    if (!response.ok) throw await parseApiResponse(response);

    return this.readResponseBody<T>(response);
  }

  async requestMultipartJson<T>(
    endpoint: string,
    buildFormData: () => FormData,
    retry = true,
    timeoutMs: number = API_CONFIG.REQUEST_TIMEOUT_MS,
    signal?: AbortSignal,
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
      return this.safeFetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
        body: form,
        signal,
      }, timeoutMs);
    };

    let response = await doFetch();

    if (response.status === 401 && retry) {
      try {
        await this.refreshTokens();
        response = await doFetch();
      } catch (e) {
        this.clearTokensCallback();
        throw e;
      }
    }

    if (!response.ok) throw await parseApiResponse(response);

    const ct = response.headers.get("content-type");
    if (ct?.includes("application/json")) return response.json();
    return {} as T;
  }

  setTokens(access: string | null, refresh: string | null): void {
    this.setTokensImpl(access, refresh);
  }

  clearTokens(): void {
    this.clearTokensCallback();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

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
      this.safeFetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {},
      });

    let response = await fetchOnce(token);

    if (response.status === 401 && retry) {
      try {
        await this.refreshTokens();
        token = await this.resolveToken();
        response = await fetchOnce(token);
      } catch (e) {
        this.clearTokensCallback();
        throw e;
      }
    }

    if (!response.ok) throw await parseApiResponse(response);
    return response.blob();
  }
}

let clientSingleton: ApiClient | null = null;

function getClientSingleton(): ApiClient {
  if (!clientSingleton) {
    clientSingleton = new ApiClient({
      baseUrl: getApiBaseUrl(),
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

export async function getServerApiClient(): Promise<ApiClient> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return new ApiClient({
    baseUrl: getApiBaseUrl(),
    getToken: () =>
      Promise.resolve(store.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value ?? null),
  });
}
