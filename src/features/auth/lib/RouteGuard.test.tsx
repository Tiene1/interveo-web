import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setToken } from "./token";
import { RouteGuard } from "./RouteGuard";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("RouteGuard", () => {
  beforeEach(() => {
    replace.mockReset();
    window.localStorage.clear();
  });

  it("redirige vers /connexion quand il n'y a pas de jeton", async () => {
    render(
      <RouteGuard>
        <p>Contenu protege</p>
      </RouteGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/connexion"));
    expect(screen.queryByText("Contenu protege")).not.toBeInTheDocument();
  });

  it("affiche le contenu quand un jeton est present", async () => {
    setToken("jeton-de-test");
    render(
      <RouteGuard>
        <p>Contenu protege</p>
      </RouteGuard>,
    );
    expect(await screen.findByText("Contenu protege")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
