import { ApiHttpError } from "@/lib/api/errors";
import { resolveAuthError } from "@/lib/auth-form";

describe("resolveAuthError", () => {
  it("returns ApiHttpError detail in pt-BR", () => {
    const err = new ApiHttpError(401, "E-mail ou senha inválidos.");
    expect(resolveAuthError(err, "login")).toBe("E-mail ou senha inválidos.");
  });

  it("uses register fallback for unknown errors", () => {
    expect(resolveAuthError(null, "register")).toBe(
      "Erro ao criar conta. Tente novamente.",
    );
  });

  it("uses login fallback for unknown errors", () => {
    expect(resolveAuthError(null, "login")).toBe(
      "Erro ao fazer login. Tente novamente.",
    );
  });
});
