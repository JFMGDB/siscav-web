import {
  ApiHttpError,
  formatApiErrorDetail,
  getApiErrorKind,
  isNetworkError,
  mapNetworkError,
  resolveApiError,
} from "@/lib/api/errors";

describe("formatApiErrorDetail", () => {
  it("returns string detail as-is", () => {
    expect(formatApiErrorDetail("E-mail ou senha inválidos.")).toBe(
      "E-mail ou senha inválidos.",
    );
  });

  it("joins Pydantic validation array messages with pt-BR fallback", () => {
    expect(
      formatApiErrorDetail([
        {
          loc: ["body", "email"],
          msg: "value is not a valid email address",
          type: "value_error.email",
        },
        {
          loc: ["body", "password"],
          msg: "String should have at least 8 characters",
          type: "string_too_short",
        },
      ]),
    ).toBe("Informe um e-mail válido.; Texto muito curto.");
  });

  it("falls back for unknown shapes", () => {
    expect(formatApiErrorDetail(null)).toBe(
      "Erro inesperado. Tente novamente.",
    );
  });
});

describe("ApiHttpError", () => {
  it("exposes status, detail and kind", () => {
    const err = new ApiHttpError(401, "Credenciais inválidas");
    expect(err.status).toBe(401);
    expect(err.detail).toBe("Credenciais inválidas");
    expect(err.message).toBe("Credenciais inválidas");
    expect(err.kind).toBe("authentication");
  });
});

describe("getApiErrorKind", () => {
  it("maps HTTP status to error kind", () => {
    expect(getApiErrorKind(422)).toBe("validation");
    expect(getApiErrorKind(403)).toBe("authorization");
    expect(getApiErrorKind(500)).toBe("unexpected");
  });
});

describe("isNetworkError", () => {
  it("detects fetch failures", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new ApiHttpError(500, "Erro"))).toBe(false);
  });
});

describe("mapNetworkError", () => {
  it("wraps network failures", () => {
    const err = mapNetworkError(new TypeError("Failed to fetch"));
    expect(err.kind).toBe("network");
    expect(err.detail).toContain("conectar");
  });
});

describe("resolveApiError", () => {
  it("prefers ApiHttpError detail", () => {
    expect(
      resolveApiError(new ApiHttpError(409, "Este e-mail já está registrado.")),
    ).toBe("Este e-mail já está registrado.");
  });

  it("uses fallback for unknown errors", () => {
    expect(resolveApiError(null, "Fallback")).toBe("Fallback");
  });
});
