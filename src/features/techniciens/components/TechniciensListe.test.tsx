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

  it("filtre par recherche (nom ou identifiant) et reinitialise", async () => {
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

    fireEvent.change(screen.getByLabelText("Rechercher un technicien"), { target: { value: "awa" } });

    expect(screen.queryByText("Jean Koffi")).not.toBeInTheDocument();
    expect(screen.getByText("Awa Traore")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Réinitialiser les filtres"));

    expect(await screen.findByText("Jean Koffi")).toBeInTheDocument();
    expect(screen.getByText("Awa Traore")).toBeInTheDocument();
  });

  it("filtre par statut actif/inactif", async () => {
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

    fireEvent.click(screen.getByRole("combobox", { name: "Filtrer par statut" }));
    fireEvent.click(screen.getByRole("option", { name: "Inactifs" }));

    expect(screen.queryByText("Jean Koffi")).not.toBeInTheDocument();
    expect(screen.getByText("Awa Traore")).toBeInTheDocument();
  });

  it("affiche un message distinct quand un filtre ne trouve aucun technicien", async () => {
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
    expect(await screen.findByText("Jean Koffi")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rechercher un technicien"), { target: { value: "introuvable" } });

    expect(await screen.findByText(/ne correspond/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Réinitialiser les filtres"));

    expect(await screen.findByText("Jean Koffi")).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: "Motdepasse123!" } });
    fireEvent.click(screen.getByText("Créer le compte"));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs", {
        method: "POST",
        body: { nom: "Nouveau Technicien", identifiant: "nouveau", motDePasse: "Motdepasse123!" },
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
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: "Motdepasse123!" } });
    fireEvent.click(screen.getByText("Créer le compte"));

    expect(await screen.findByText("Cet identifiant est deja utilise")).toBeInTheDocument();
  });

  it("bloque la creation localement si le mot de passe manque de complexite", async () => {
    vi.mocked(apiRequest).mockResolvedValue([]);

    renderListe();
    await screen.findByText(/Aucun technicien/);

    fireEvent.click(screen.getAllByText("Créer un compte")[0]);
    fireEvent.change(screen.getByLabelText(/^Nom/), { target: { value: "X" } });
    fireEvent.change(screen.getByLabelText(/^Identifiant/), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: "motdepasse123" } });
    fireEvent.click(screen.getByText("Créer le compte"));

    expect(
      await screen.findByText(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      ),
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith("/utilisateurs", expect.objectContaining({ method: "POST" }));
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

  it("les boutons Reactiver et Supprimer n'apparaissent que pour les comptes inactifs", async () => {
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

    expect(screen.queryByRole("button", { name: "Réactiver" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Supprimer" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Réactiver" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Supprimer" })).toHaveLength(1);
  });

  it("reactive un compte au clic et rafraichit la liste", async () => {
    let actif = false;
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "PATCH") {
        actif = true;
        return Promise.resolve({
          id: "t2",
          nom: "Awa Traore",
          identifiant: "awa",
          role: "TECHNICIEN",
          actif: true,
          creeLe: "2026-09-02T00:00:00.000Z",
          misAJourLe: "2026-09-17T00:00:00.000Z",
        });
      }
      return Promise.resolve([
        {
          id: "t2",
          nom: "Awa Traore",
          identifiant: "awa",
          role: "TECHNICIEN",
          actif,
          creeLe: "2026-09-02T00:00:00.000Z",
          misAJourLe: "2026-09-02T00:00:00.000Z",
        },
      ]);
    });

    renderListe();
    await screen.findByText("Awa Traore");

    fireEvent.click(screen.getByRole("button", { name: "Réactiver" }));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs/t2/reactiver", { method: "PATCH" }),
    );
    await waitFor(() => expect(screen.getByText("Actif")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Réactiver" })).not.toBeInTheDocument();
  });

  it("supprime un compte apres confirmation et rafraichit la liste", async () => {
    let supprime = false;
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "DELETE") {
        supprime = true;
        return Promise.resolve(undefined);
      }
      return Promise.resolve(
        supprime
          ? []
          : [
              {
                id: "t2",
                nom: "Awa Traore",
                identifiant: "awa",
                role: "TECHNICIEN",
                actif: false,
                creeLe: "2026-09-02T00:00:00.000Z",
                misAJourLe: "2026-09-02T00:00:00.000Z",
              },
            ],
      );
    });

    renderListe();
    await screen.findByText("Awa Traore");

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText(/Supprimer ce/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Supprimer définitivement"));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs/t2", { method: "DELETE" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText(/Aucun technicien/)).toBeInTheDocument();
  });

  it("annule la suppression sans appeler l'API", async () => {
    vi.mocked(apiRequest).mockResolvedValue([
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
    await screen.findByText("Awa Traore");

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText(/Supprimer ce/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retour"));

    expect(screen.queryByText(/Supprimer ce/)).not.toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith("/utilisateurs/t2", expect.objectContaining({ method: "DELETE" }));
  });

  it("affiche l'erreur serveur 409 si le technicien a des interventions dans son historique", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "DELETE") {
        return Promise.reject(
          new ApiError(409, {
            statusCode: 409,
            message: "Ce technicien a des interventions dans son historique, suppression impossible",
            error: "Conflict",
            timestamp: "2026-09-17T00:00:00.000Z",
            path: "/utilisateurs/t2",
            method: "DELETE",
          }),
        );
      }
      return Promise.resolve([
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
    });

    renderListe();
    await screen.findByText("Awa Traore");

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText(/Supprimer ce/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Supprimer définitivement"));

    expect(
      await screen.findByText("Ce technicien a des interventions dans son historique, suppression impossible"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Awa Traore").length).toBeGreaterThan(0);
  });

  it("reinitialise le mot de passe apres saisie valide (US4.9)", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string, options?: { method?: string }) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          id: "t1",
          nom: "Jean Koffi",
          identifiant: "koffi",
          role: "TECHNICIEN",
          actif: true,
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
          actif: true,
          creeLe: "2026-09-01T00:00:00.000Z",
          misAJourLe: "2026-09-01T00:00:00.000Z",
        },
      ]);
    });

    renderListe();
    await screen.findByText("Jean Koffi");

    fireEvent.click(screen.getByText("Réinitialiser"));
    expect(await screen.findByRole("heading", { name: /Réinitialiser le mot de passe/ })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/), {
      target: { value: "Nouveaumdp123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/utilisateurs/t1/reinitialiser-mot-de-passe", {
        method: "PATCH",
        body: { motDePasse: "Nouveaumdp123!" },
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("bloque la reinitialisation localement si le mot de passe est trop court", async () => {
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

    fireEvent.click(screen.getByText("Réinitialiser"));
    await screen.findByRole("heading", { name: /Réinitialiser le mot de passe/ });

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/), { target: { value: "court" } });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    expect(
      await screen.findByText("Le mot de passe doit contenir au moins 8 caractères."),
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith(
      expect.stringContaining("/reinitialiser-mot-de-passe"),
      expect.anything(),
    );
  });

  it("bloque la reinitialisation localement si le mot de passe manque de complexite", async () => {
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

    fireEvent.click(screen.getByText("Réinitialiser"));
    await screen.findByRole("heading", { name: /Réinitialiser le mot de passe/ });

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/), { target: { value: "nouveaumdp123" } });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    expect(
      await screen.findByText(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      ),
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith(
      expect.stringContaining("/reinitialiser-mot-de-passe"),
      expect.anything(),
    );
  });
});
