import {
  AUTH_PASSWORD_MIN_LENGTH,
  loginSchema,
  registerSchema,
} from "@/lib/auth-schema";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Informe seu e-mail.");
    }
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const short = "a".repeat(AUTH_PASSWORD_MIN_LENGTH - 1);
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: short,
      confirmPassword: short,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password mismatch", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password124",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find((i) =>
        i.path.includes("confirmPassword"),
      );
      expect(confirmIssue?.message).toBe("As senhas não coincidem.");
    }
  });
});
