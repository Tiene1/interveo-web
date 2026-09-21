import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { ChangerMotDePasseModal } from "./ChangerMotDePasseModal";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

function renderModal(onClose = vi.fn()) {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ChangerMotDePasseModal onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose };
}

function remplir(actuel: string, nouveau: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText(/Mot de passe actuel/), { target: { value: actuel } });
  fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/), { target: { value: nouveau } });
  fireEvent.change(screen.getByLabelText(/Confirmer le nouveau/), { target: { value: confirmation } });
}

describe("ChangerMotDePasseModal", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("refuse un nouveau mot de passe trop faible sans appeler l'API", () => {
    renderModal();
    remplir("Ancien!12345", "faible", "faible");
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }));

    expect(screen.getByText(/au moins 8 caractères/)).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("refuse une confirmation différente sans appeler l'API", () => {
    renderModal();
    remplir("Ancien!12345", "Nouveau!67890", "Autre!67890");
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }));

    expect(screen.getByText(/ne correspond pas/)).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("envoie l'ancien et le nouveau mot de passe puis confirme la réussite", async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined);
    const { onClose } = renderModal();
    remplir("Ancien!12345", "Nouveau!67890", "Nouveau!67890");
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }));

    expect(await screen.findByText(/prochaine connexion/)).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/auth/mot-de-passe", {
      method: "PATCH",
      body: { motDePasseActuel: "Ancien!12345", nouveauMotDePasse: "Nouveau!67890" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("affiche l'erreur renvoyée par le serveur (ancien mot de passe incorrect)", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("Mot de passe actuel incorrect"));
    renderModal();
    remplir("Faux!12345", "Nouveau!67890", "Nouveau!67890");
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Mot de passe actuel incorrect"));
    expect(screen.queryByText(/prochaine connexion/)).not.toBeInTheDocument();
  });

  it("Annuler ferme la fenêtre sans appeler l'API", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onClose).toHaveBeenCalled();
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
