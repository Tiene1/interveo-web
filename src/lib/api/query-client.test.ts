import { describe, expect, it, vi } from "vitest";
import { createQueryClient } from "./query-client";
import { ApiError } from "./types";

function mockLocation(pathname: string) {
  const assign = vi.fn();
  Object.defineProperty(window, "location", {
    value: { pathname, assign },
    writable: true,
    configurable: true,
  });
  return assign;
}

describe("createQueryClient", () => {
  it("redirige vers /connexion sur une ApiError 401 hors de la page de connexion", async () => {
    const assign = mockLocation("/interventions");
    const queryClient = createQueryClient();

    await queryClient
      .fetchQuery({
        queryKey: ["proteges"],
        queryFn: () => {
          throw new ApiError(401, undefined);
        },
      })
      .catch(() => undefined);

    expect(assign).toHaveBeenCalledWith("/connexion");
  });

  it("ne redirige pas si l'erreur 401 survient deja sur /connexion (ex: mauvais mot de passe)", async () => {
    const assign = mockLocation("/connexion");
    const queryClient = createQueryClient();

    await queryClient
      .fetchQuery({
        queryKey: ["login"],
        queryFn: () => {
          throw new ApiError(401, undefined);
        },
      })
      .catch(() => undefined);

    expect(assign).not.toHaveBeenCalled();
  });
});
