import { getApiBaseUrl, PRODUCTION_API_URL } from "@/constants";

describe("getApiBaseUrl", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.NEXT_PUBLIC_MANTIS_API_URL;
    delete process.env.NEXT_PUBLIC_SISCAV_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.VERCEL;
  });

  afterAll(() => {
    process.env = env;
  });

  it("prefers NEXT_PUBLIC_MANTIS_API_URL when set", () => {
    process.env.NEXT_PUBLIC_MANTIS_API_URL = "https://api.example.com/";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("uses production API on Vercel when env var is missing", () => {
    process.env.VERCEL = "1";
    expect(getApiBaseUrl()).toBe(PRODUCTION_API_URL);
  });

  it("falls back to localhost in local development", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:8000");
  });
});
