import { beforeEach, describe, expect, it, vi } from "vitest";
import { setToken, getToken } from "@/features/auth/lib/token";
import { apiRequest } from "./client";
import { ApiError } from "./types";

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: response.json ?? (async () => ({})),
  } as Response);
}

describe("apiRequest", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("ajoute l'en-tete Authorization quand un jeton est present", async () => {
    setToken("jeton-de-test");
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    await apiRequest("/interventions");

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jeton-de-test");
  });

  it("leve une ApiError avec le corps sur une reponse non-ok", async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      json: async () => ({
        statusCode: 404,
        message: "Intervention introuvable",
        error: "Not Found",
        timestamp: "2026-09-01T00:00:00.000Z",
        path: "/interventions/x",
        method: "GET",
      }),
    });

    await expect(apiRequest("/interventions/x")).rejects.toThrow(ApiError);
  });

  it("purge le jeton sur une reponse 401", async () => {
    setToken("jeton-expire");
    mockFetchOnce({ ok: false, status: 401, json: async () => undefined });

    await expect(apiRequest("/auth/moi")).rejects.toThrow(ApiError);
    expect(getToken()).toBeNull();
  });
});
