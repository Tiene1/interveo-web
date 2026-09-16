import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
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

  it("cree un compte via la modale et rafraichit la liste (US4.5)", async () => {
    const compteExistant = {
      id: "t1",
      nom: "Jean Koffi",
      identifiant: "koffi",
      role: "TECHNICIEN",
      actif: true,
      creeLe: "2026-09-01T00:00:00.000Z",
      misAJourLe: "2026-09-01T00:00:00.000Z",
    };
    const compteCree = {
      id: "t2",
      nom: "Nouveau Technicien",
      identifiant: "nouveau",
      role: "TECHNICIEN",
      actif: true,
      creeLe: "2026-09-16T00:00:00.000Z",
      misAJourLe: "2026-09-16T00:00:00.000Z",
    };
    let liste = [compteExistant];
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string; body?: unknown }) => {
      if (options?.method === "POST") {
        liste = [...liste, compteCree];
        return Promise.resolve(compteCree);
      }
      return Promise.resolve(liste);
    });

    renderListe();
    expect(await screen.findByText("Jean Koffi")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Créer un compte"));
    fireEvent.change(screen.getByLabelText(/^Nom/), { target: { value: "Nouveau Technicien" } });
    fireEvent.change(screen.getByLabelText(/^Identifiant/), { target: { value: "nouveau" } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: "motdepasse123" } });
    fireEvent.click(screen.getByText("Créer le compte"));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs", {
        method: "POST",
        body: { nom: "Nouveau Technicien", identifiant: "nouveau", motDePasse: "motdepasse123" },
      }),
    );
    expect(await screen.findByText("Nouveau Technicien")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("affiche une erreur de validation locale sans appeler l'API si les champs sont vides", async () => {
    vi.mocked(apiRequest).mockResolvedValue([]);

    renderListe();
    await screen.findByText(/Aucun technicien/);

    fireEvent.click(screen.getAllByText("Créer un compte")[0]);
    fireEvent.click(screen.getByText("Créer le compte"));

    expect(await screen.findByText("Le nom est requis.")).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith("/utilisateurs", expect.objectContaining({ method: "POST" }));
  });

  it("affiche l'erreur serveur 409 si l'identifiant existe deja", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "POST") {
        return Promise.reject(
          new ApiError(409, {
            statusCode: 409,
            message: "Cet identifiant est deja utilise",
            error: "Conflict",
            timestamp: "2026-09-16T00:00:00.000Z",
            path: "/utilisateurs",
            method: "POST",
          }),
        );
      }
      return Promise.resolve([]);
    });

    renderListe();
    await screen.findByText(/Aucun technicien/);

    fireEvent.click(screen.getAllByText("Créer un compte")[0]);
    fireEvent.change(screen.getByLabelText(/^Nom/), { target: { value: "Doublon" } });
    fireEvent.change(screen.getByLabelText(/^Identifiant/), { target: { value: "koffi" } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: "motdepasse123" } });
    fireEvent.click(screen.getByText("Créer le compte"));

    expect(await screen.findByText("Cet identifiant est deja utilise")).toBeInTheDocument();
  });

  it("le bouton Desactiver n'apparait que pour les comptes actifs (US4.7)", async () => {
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
    await screen.findByText("Jean Koffi");

    expect(screen.getAllByText("Désactiver")).toHaveLength(1);
  });

  it("desactive un compte apres confirmation et rafraichit la liste (US4.7)", async () => {
    let actif = true;
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "PATCH") {
        actif = false;
        return Promise.resolve({
          id: "t1",
          nom: "Jean Koffi",
          identifiant: "koffi",
          role: "TECHNICIEN",
          actif: false,
          creeLe: "2026-09-01T00:00:00.000Z",
          misAJourLe: "2026-09-16T00:00:00.000Z",
        });
      }
      return Promise.resolve([
        {
          id: "t1",
          nom: "Jean Koffi",
          identifiant: "koffi",
          role: "TECHNICIEN",
          actif,
          creeLe: "2026-09-01T00:00:00.000Z",
          misAJourLe: "2026-09-01T00:00:00.000Z",
        },
      ]);
    });

    renderListe();
    await screen.findByText("Jean Koffi");

    fireEvent.click(screen.getByText("Désactiver"));
    expect(await screen.findByText(/Désactiver ce/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Désactiver le compte"));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs/t1/desactiver", { method: "PATCH" }),
    );
    await waitFor(() => expect(screen.getByText("Inactif")).toBeInTheDocument());
    expect(screen.queryByText("Désactiver le compte")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Désactiver" })).not.toBeInTheDocument();
  });

  it("annule la desactivation sans appeler l'API", async () => {
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
    ]);

    renderListe();
    await screen.findByText("Jean Koffi");

    fireEvent.click(screen.getByText("Désactiver"));
    expect(await screen.findByText(/Désactiver ce/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retour"));

    expect(screen.queryByText(/Désactiver ce/)).not.toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith(
      expect.stringContaining("/desactiver"),
      expect.anything(),
    );
  });
});
