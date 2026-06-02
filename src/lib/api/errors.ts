/**
 * FastAPI / Pydantic error parsing aligned with siscav-api contract.
 *
 * FastAPI `detail` can be:
 *   - string  → controller-raised HTTPException (401, 409, etc.)
 *   - array   → Pydantic ValidationError (422) with items { loc, msg, type }
 *
 * @see siscav-api/docs/api/frontend-integration.md
 */

export interface PydanticErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Custom error carrying HTTP status + parsed detail for auth flows.
 * Propagated from auth.ts to AuthPage so error display can branch on status.
 */
export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiHttpError";
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
      .map((item) => item.msg);
    if (msgs.length > 0) return msgs.join("; ");
  }

  return "Erro inesperado. Tente novamente.";
}

/**
 * Parse a non-ok Response into an ApiHttpError with formatted detail.
 * Replaces the old parseApiError for auth endpoints.
 */
export async function parseApiResponse(
  response: Response,
): Promise<ApiHttpError> {
  const text = await response.text();
  let detail: string = response.statusText || "Erro de rede";

  try {
    const json = JSON.parse(text);
    detail = formatApiErrorDetail(json.detail ?? json.message ?? detail);
  } catch {
    if (text) detail = text;
  }

  return new ApiHttpError(response.status, detail);
}
