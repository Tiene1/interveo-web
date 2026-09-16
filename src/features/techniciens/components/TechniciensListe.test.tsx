import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { TechniciensListe } from "./TechniciensListe";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

function renderListe() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TechniciensListe />
    </QueryClientProvider>,
  );
}

describe("TechniciensListe", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("affiche les techniciens actifs et inactifs avec le decompte", async () => {
    vi.mocked(apiRequest).mockResolvedValue([
      {
        id: "t1",
        nom: "Jean Koffi",
        identifiant: "koffi",
        role: "TECHNICIEN",
        actif: true,
        creeLe: "2026-09-01T00:00:00.000Z",
        misAJourLe: "2026-09-01T00:00:00.000Z",
      },
      {
        id: "t2",
        nom: "Awa Traore",
        identifiant: "awa",
        role: "TECHNICIEN",
        actif: false,
        creeLe: "2026-09-02T00:00:00.000Z",
        misAJourLe: "2026-09-02T00:00:00.000Z",
      },
    ]);

    renderListe();

    expect(await screen.findByText("Jean Koffi")).toBeInTheDocument();
    expect(screen.getByText("Awa Traore")).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText("Inactif")).toBeInTheDocument();
    expect(screen.getByText(/techniciens au total/)).toBeInTheDocument();
  });

  it("appelle GET /utilisateurs?role=TECHNICIEN sans filtre actif (contrairement au selecteur d'attribution)", async () => {
    vi.mocked(apiRequest).mockResolvedValue([]);

    renderListe();

    await screen.findByText(/Aucun technicien/);
    expect(apiRequest).toHaveBeenCalledWith("/utilisateurs?role=TECHNICIEN");
  });

  it("affiche l'etat d'erreur et permet de reessayer", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("erreur reseau"));

    renderListe();

    expect(await screen.findByText(/Impossible de charger/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Réessayer"));
  });
});
