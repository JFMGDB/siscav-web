/** @type {import('ts-jest').JestConfigWithTsJest} */
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Forneça o caminho para o seu aplicativo Next.js para carregar next.config.js e .env no ambiente de teste
  dir: "./",
});

// Adicione qualquer configuração personalizada do Jest a ser passada para o createJestConfig
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Adicione mais configurações de setup antes de cada teste
  setupFilesAfterEnv: ["<rootDir>/jest.setup.mjs"],
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js, que é assíncrona
export default createJestConfig(config);

