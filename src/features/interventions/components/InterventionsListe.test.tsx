import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { InterventionsListe } from "./InterventionsListe";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderListe() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InterventionsListe />
    </QueryClientProvider>,
  );
}

describe("InterventionsListe", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("affiche l'etat vide quand la liste est vide", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
        });
      }
      return Promise.resolve([]);
    });

    renderListe();

    expect(await screen.findByText(/Aucune intervention/)).toBeInTheDocument();
  });

  it("affiche l'etat d'erreur et permet de reessayer", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        return Promise.reject(new Error("erreur reseau"));
      }
      return Promise.resolve([]);
    });

    renderListe();

    expect(await screen.findByText(/Impossible de charger/)).toBeInTheDocument();
    expect(screen.getByText("Réessayer")).toBeInTheDocument();
  });

  it("affiche le tableau quand des interventions existent", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        return Promise.resolve({
          data: [
            {
              id: "3915b537-5d7a-40b7-be54-87578e11be91",
              nomClient: "Hôtel Ivoire",
              adresse: "Boulevard Hassan II, Cocody",
              telephone1: "+2250700000001",
              telephone2: null,
              geolocalisation: null,
              motifSignale: null,
              datePrevue: "2026-09-14T09:00:00.000Z",
              technicienId: "tech-1",
              creeParId: "directeur-1",
              typeEquipement: null,
              problemeConstate: null,
              travauxRealises: null,
              statut: "PLANIFIEE",
              dateRealisation: null,
              creeLe: "2026-09-10T00:00:00.000Z",
              misAJourLe: "2026-09-10T00:00:00.000Z",
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
        });
      }
      return Promise.resolve([
        { id: "tech-1", nom: "Koffi N'Guessan", identifiant: "koffi", role: "TECHNICIEN", actif: true },
      ]);
    });

    renderListe();

    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Koffi N'Guessan").length).toBeGreaterThan(0));
  });

  it("affiche la repartition par statut dans la legende", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        return Promise.resolve({
          data: [],
          total: 9,
          page: 1,
          limit: 20,
          parStatut: { PLANIFIEE: 4, REALISEE: 3, ANNULEE: 2 },
        });
      }
      return Promise.resolve([]);
    });

    renderListe();

    expect(await screen.findByText(/4/)).toBeInTheDocument();
    expect(screen.getByText(/planifiées/)).toBeInTheDocument();
    expect(screen.getByText(/réalisées/)).toBeInTheDocument();
    expect(screen.getByText(/annulées/)).toBeInTheDocument();
  });

  it("affiche un message distinct quand un filtre ne trouve aucun resultat", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        const filtre = path.includes("motCle=");
        return Promise.resolve(
          filtre
            ? {
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
              }
            : {
                data: [
                  {
                    id: "3915b537-5d7a-40b7-be54-87578e11be91",
                    nomClient: "Hôtel Ivoire",
                    adresse: "Boulevard Hassan II, Cocody",
                    telephone1: "+2250700000001",
                    telephone2: null,
                    geolocalisation: null,
                    motifSignale: null,
                    datePrevue: "2026-09-14T09:00:00.000Z",
                    technicienId: "tech-1",
                    creeParId: "directeur-1",
                    typeEquipement: null,
                    problemeConstate: null,
                    travauxRealises: null,
                    statut: "PLANIFIEE",
                    dateRealisation: null,
                    creeLe: "2026-09-10T00:00:00.000Z",
                    misAJourLe: "2026-09-10T00:00:00.000Z",
                  },
                ],
                total: 1,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
              },
        );
      }
      return Promise.resolve([]);
    });

    renderListe();
    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rechercher une intervention"), {
      target: { value: "introuvable" },
    });

    expect(await screen.findByText(/ne correspond/, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getByText("Réinitialiser les filtres")).toBeInTheDocument();
  });

  it("filtre par statut via le selecteur et reinitialise avec les autres filtres", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        const filtreStatut = path.includes("statut=REALISEE");
        return Promise.resolve(
          filtreStatut
            ? {
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
              }
            : {
                data: [
                  {
                    id: "3915b537-5d7a-40b7-be54-87578e11be91",
                    nomClient: "Hôtel Ivoire",
                    adresse: "Boulevard Hassan II, Cocody",
                    telephone1: "+2250700000001",
                    telephone2: null,
                    geolocalisation: null,
                    motifSignale: null,
                    datePrevue: "2026-09-14T09:00:00.000Z",
                    technicienId: "tech-1",
                    creeParId: "directeur-1",
                    typeEquipement: null,
                    problemeConstate: null,
                    travauxRealises: null,
                    statut: "PLANIFIEE",
                    dateRealisation: null,
                    creeLe: "2026-09-10T00:00:00.000Z",
                    misAJourLe: "2026-09-10T00:00:00.000Z",
                  },
                ],
                total: 1,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
              },
        );
      }
      return Promise.resolve([]);
    });

    renderListe();
    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.click(screen.getByRole("combobox", { name: "Filtrer par statut" }));
    fireEvent.click(screen.getByRole("option", { name: "Réalisées" }));

    expect(await screen.findByText(/ne correspond/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Réinitialiser les filtres"));

    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();
  });

  it("filtre par periode via le panneau Filtres et reinitialise", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        const filtrePeriode = path.includes("dateDebut=2026-09-01") && path.includes("dateFin=2026-09-30");
        return Promise.resolve(
          filtrePeriode
            ? {
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
              }
            : {
                data: [
                  {
                    id: "3915b537-5d7a-40b7-be54-87578e11be91",
                    nomClient: "Hôtel Ivoire",
                    adresse: "Boulevard Hassan II, Cocody",
                    telephone1: "+2250700000001",
                    telephone2: null,
                    geolocalisation: null,
                    motifSignale: null,
                    datePrevue: "2026-09-14T09:00:00.000Z",
                    technicienId: "tech-1",
                    creeParId: "directeur-1",
                    typeEquipement: null,
                    problemeConstate: null,
                    travauxRealises: null,
                    statut: "PLANIFIEE",
                    dateRealisation: null,
                    creeLe: "2026-09-10T00:00:00.000Z",
                    misAJourLe: "2026-09-10T00:00:00.000Z",
                  },
                ],
                total: 1,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
              },
        );
      }
      return Promise.resolve([]);
    });

    renderListe();
    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.change(screen.getByLabelText("Du"), { target: { value: "2026-09-01" } });
    fireEvent.change(screen.getByLabelText("Au"), { target: { value: "2026-09-30" } });

    expect(await screen.findByText(/ne correspond/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Réinitialiser"));

    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();
  });

  it("filtre par mot-cle via la barre de recherche et reinitialise", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions")) {
        const filtreMotCle = path.includes("motCle=climatisation");
        return Promise.resolve(
          filtreMotCle
            ? {
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
              }
            : {
                data: [
                  {
                    id: "3915b537-5d7a-40b7-be54-87578e11be91",
                    nomClient: "Hôtel Ivoire",
                    adresse: "Boulevard Hassan II, Cocody",
                    telephone1: "+2250700000001",
                    telephone2: null,
                    geolocalisation: null,
                    motifSignale: null,
                    datePrevue: "2026-09-14T09:00:00.000Z",
                    technicienId: "tech-1",
                    creeParId: "directeur-1",
                    typeEquipement: null,
                    problemeConstate: null,
                    travauxRealises: null,
                    statut: "PLANIFIEE",
                    dateRealisation: null,
                    creeLe: "2026-09-10T00:00:00.000Z",
                    misAJourLe: "2026-09-10T00:00:00.000Z",
                  },
                ],
                total: 1,
                page: 1,
                limit: 20,
                parStatut: { PLANIFIEE: 1, REALISEE: 0, ANNULEE: 0 },
              },
        );
      }
      return Promise.resolve([]);
    });

    renderListe();
    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rechercher une intervention"), {
      target: { value: "climatisation" },
    });

    expect(await screen.findByText(/ne correspond/, {}, { timeout: 2000 })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Réinitialiser"));

    expect(await screen.findByText("Hôtel Ivoire")).toBeInTheDocument();
  });

  it("exporte le CSV de la liste filtree en declenchant un telechargement", async () => {
    const interventionExport = {
      id: "3915b537-5d7a-40b7-be54-87578e11be91",
      nomClient: "Hôtel Ivoire",
      adresse: "Boulevard Hassan II, Cocody",
      telephone1: "+2250700000001",
      telephone2: null,
      geolocalisation: null,
      motifSignale: null,
      datePrevue: "2026-09-14T09:00:00.000Z",
      technicienId: "tech-1",
      creeParId: "directeur-1",
      typeEquipement: null,
      problemeConstate: null,
      travauxRealises: null,
      statut: "PLANIFIEE",
      dateRealisation: null,
      creeLe: "2026-09-10T00:00:00.000Z",
      misAJourLe: "2026-09-10T00:00:00.000Z",
      technicien: { nom: "Awa Traore" },
    };

    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions/export")) {
        return Promise.resolve([interventionExport]);
      }
      if (path.startsWith("/interventions")) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
        });
      }
      return Promise.resolve([]);
    });

    const createObjectURL = vi.fn().mockReturnValue("blob:interventions-csv");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clic = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(clic);

    renderListe();
    await waitFor(() => expect(vi.mocked(apiRequest)).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /Exporter CSV/ }));

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(expect.stringContaining("/interventions/export")),
    );
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
    expect(clic).toHaveBeenCalled();

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("affiche un message d'erreur si l'export CSV echoue", async () => {
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path.startsWith("/interventions/export")) {
        return Promise.reject(new Error("erreur reseau"));
      }
      if (path.startsWith("/interventions")) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          parStatut: { PLANIFIEE: 0, REALISEE: 0, ANNULEE: 0 },
        });
      }
      return Promise.resolve([]);
    });

    renderListe();
    await waitFor(() => expect(vi.mocked(apiRequest)).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /Exporter CSV/ }));

    expect(await screen.findByText(/Échec de l'export CSV/)).toBeInTheDocument();
  });
});
