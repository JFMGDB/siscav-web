import { ApiHttpError, formatApiErrorDetail } from "@/lib/api/errors";

describe("formatApiErrorDetail", () => {
  it("returns string detail as-is", () => {
    expect(formatApiErrorDetail("Incorrect email or password")).toBe(
      "Incorrect email or password",
    );
  });

  it("joins Pydantic validation array messages", () => {
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
    ).toBe(
      "value is not a valid email address; String should have at least 8 characters",
    );
  });

  it("falls back for unknown shapes", () => {
    expect(formatApiErrorDetail(null)).toBe(
      "Erro inesperado. Tente novamente.",
    );
  });
});

describe("ApiHttpError", () => {
  it("exposes status and detail", () => {
    const err = new ApiHttpError(401, "Credenciais inválidas");
    expect(err.status).toBe(401);
    expect(err.detail).toBe("Credenciais inválidas");
    expect(err.message).toBe("Credenciais inválidas");
  });
});
