/**
 * FastAPI / Pydantic error parsing aligned with siscav-api contract.
 *
 * FastAPI `detail` can be:
 *   - string  → controller-raised HTTPException (401, 409, etc.)
 *   - array   → Pydantic ValidationError (422) with items { loc, msg, type }
 *
 * @see siscav-api/docs/api/frontend-integration.md
 */

import { MESSAGES } from "@/constants";

export interface PydanticErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export type ApiErrorKind =
  | "validation"
  | "authentication"
  | "authorization"
  | "business"
  | "not_found"
  | "conflict"
  | "network"
  | "unexpected";

const PYDANTIC_MSG_PT: Record<string, string> = {
  missing: "Campo obrigatório ausente.",
  string_type: "Informe um texto válido.",
  string_too_short: "Texto muito curto.",
  string_too_long: "Texto muito longo.",
  "value_error.email": "Informe um e-mail válido.",
  value_error: "Valor inválido.",
  int_parsing: "Informe um número inteiro válido.",
  float_parsing: "Informe um número válido.",
  uuid_parsing: "Identificador inválido.",
  enum: "Valor não permitido.",
};

function translatePydanticMsg(item: PydanticErrorItem): string {
  if (PYDANTIC_MSG_PT[item.type]) return PYDANTIC_MSG_PT[item.type];
  if (item.type.startsWith("value_error.")) return "Valor inválido.";
  if (/at least.*character/i.test(item.msg)) return "Texto muito curto.";
  if (/valid email/i.test(item.msg)) return "Informe um e-mail válido.";
  return item.msg;
}

export function getApiErrorKind(status: number): ApiErrorKind {
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 400 || status === 413) return "business";
  if (status >= 500) return "unexpected";
  return "business";
}

export function mapHttpStatusFallback(status: number): string {
  switch (status) {
    case 401:
      return MESSAGES.COMMON.UNAUTHORIZED;
    case 403:
      return MESSAGES.COMMON.FORBIDDEN;
    case 404:
      return MESSAGES.COMMON.NOT_FOUND;
    case 409:
      return MESSAGES.COMMON.CONFLICT;
    case 422:
      return MESSAGES.COMMON.VALIDATION_ERROR;
    case 429:
      return MESSAGES.COMMON.RATE_LIMIT;
    case 413:
      return MESSAGES.COMMON.PAYLOAD_TOO_LARGE;
    case 503:
      return MESSAGES.COMMON.SERVICE_UNAVAILABLE;
    default:
      return status >= 500
        ? MESSAGES.COMMON.UNEXPECTED_ERROR
        : MESSAGES.COMMON.UNEXPECTED_ERROR;
  }
}

/**
 * Custom error carrying HTTP status + parsed detail for all API flows.
 */
export class ApiHttpError extends Error {
  readonly kind: ApiErrorKind;

  constructor(
    public readonly status: number,
    public readonly detail: string,
    kind?: ApiErrorKind,
  ) {
    super(detail);
    this.name = "ApiHttpError";
    this.kind = kind ?? getApiErrorKind(status);
  }
}

/**
 * Normalize FastAPI `detail` (string | PydanticErrorItem[] | unknown) into
 * a human-readable pt-BR string.
 */
export function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const msgs = detail
      .filter(
        (item): item is PydanticErrorItem =>
          typeof item === "object" && item !== null && "msg" in item,
      )
      .map((item) => translatePydanticMsg(item));
    if (msgs.length > 0) return msgs.join("; ");
  }

  return MESSAGES.COMMON.UNEXPECTED_ERROR;
}

export function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    err.name === "TypeError" ||
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed")
  );
}

export function mapNetworkError(err: unknown): ApiHttpError {
  if (err instanceof ApiHttpError) return err;
  return new ApiHttpError(0, MESSAGES.COMMON.NETWORK_ERROR, "network");
}

/**
 * Parse a non-ok Response into an ApiHttpError with formatted detail.
 */
export async function parseApiResponse(
  response: Response,
): Promise<ApiHttpError> {
  const text = await response.text();
  let detail = mapHttpStatusFallback(response.status);

  try {
    const json = JSON.parse(text);
    const raw = json.detail ?? json.message;
    if (raw !== undefined) {
      detail = formatApiErrorDetail(raw);
    }
  } catch {
    if (text.trim()) detail = text;
  }

  return new ApiHttpError(response.status, detail);
}

export async function parseApiError(response: Response): Promise<string> {
  const err = await parseApiResponse(response);
  return err.detail;
}

/**
 * Resolves any thrown value into a user-facing pt-BR message.
 * API detail takes priority over generic fallbacks.
 */
export function resolveApiError(
  err: unknown,
  fallback: string = MESSAGES.COMMON.UNEXPECTED_ERROR,
): string {
  if (err instanceof ApiHttpError) return err.detail;
  if (isNetworkError(err)) return MESSAGES.COMMON.NETWORK_ERROR;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
