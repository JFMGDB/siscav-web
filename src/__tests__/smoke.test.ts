// Teste de fumaça (smoke test) para garantir que o Jest está operando.
// Mantém o pipeline do CI saudável mesmo antes de testes reais de features.

describe("CI Smoke Test", () => {
  it("executa uma asserção básica", () => {
    expect(1 + 1).toBe(2);
  });
});
