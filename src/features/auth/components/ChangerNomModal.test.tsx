import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { ChangerNomModal } from "./ChangerNomModal";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

const profil = { id: "u1", nom: "Kouassi Bertin", identifiant: "kouassi", role: "DIRECTEUR" as const };

function renderModal(onClose = vi.fn()) {
  const queryClient = createQueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <ChangerNomModal onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose, queryClient };
}

describe("ChangerNomModal", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("refuse un nom vide sans appeler l'API", () => {
    vi.mocked(apiRequest).mockResolvedValue(profil);
    renderModal();
    fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(screen.getByText(/ne peut pas être vide/)).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith("/auth/nom", expect.anything());
  });

  it("envoie le nouveau nom puis confirme la réussite", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path === "/auth/nom") return Promise.resolve({ ...profil, nom: "Nouveau Nom" });
      return Promise.resolve(profil);
    });
    const { onClose } = renderModal();
    fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: "Nouveau Nom" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(await screen.findByText(/dès maintenant/)).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/auth/nom", {
      method: "PATCH",
      body: { nom: "Nouveau Nom" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("affiche l'erreur renvoyée par le serveur", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path === "/auth/nom") return Promise.reject(new Error("nom ne doit pas etre vide"));
      return Promise.resolve(profil);
    });
    renderModal();
    fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("nom ne doit pas etre vide"));
    expect(screen.queryByText(/dès maintenant/)).not.toBeInTheDocument();
  });

  it("Annuler ferme la fenêtre sans appeler l'API", () => {
    vi.mocked(apiRequest).mockResolvedValue(profil);
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onClose).toHaveBeenCalled();
    expect(apiRequest).not.toHaveBeenCalledWith("/auth/nom", expect.anything());
  });
});
