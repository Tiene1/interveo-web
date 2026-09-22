import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { getToken, setToken } from "@/features/auth/lib/token";
import { Rail } from "./Rail";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Rail", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
  });

  it("efface le jeton et redirige vers /connexion au clic sur Se deconnecter", () => {
    setToken("jeton-de-test");
    render(<Rail />);

    fireEvent.click(screen.getByLabelText("Se déconnecter"));

    expect(getToken()).toBeNull();
    expect(push).toHaveBeenCalledWith("/connexion");
  });

  it("l'icône clé ouvre la fenêtre de changement de mot de passe, Annuler la ferme", () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <Rail />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Changer mon mot de passe"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("l'icône crayon ouvre la fenêtre de changement de nom, Annuler la ferme", () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <Rail />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Changer mon nom"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("le lien Techniciens pointe vers /techniciens (US4.6)", () => {
    render(<Rail />);

    expect(screen.getByLabelText("Techniciens")).toHaveAttribute("href", "/techniciens");
  });
});
