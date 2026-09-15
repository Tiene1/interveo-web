import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { InterventionDetail } from "./InterventionDetail";
import type { InterventionDetail as InterventionDetailType } from "../types/intervention";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
  apiFetchBlob: vi.fn().mockResolvedValue(new Blob()),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const intervention: InterventionDetailType = {
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
  photos: [],
  technicien: {
    id: "tech-1",
    nom: "Koffi N'Guessan",
    identifiant: "koffi",
    role: "TECHNICIEN",
    actif: true,
  },
};

function renderDetail(data: InterventionDetailType = intervention) {
  vi.mocked(apiRequest).mockImplementation((path: string) => {
    if (path.includes("/interventions/") && !path.includes("PATCH")) {
      return Promise.resolve(data);
    }
    return Promise.resolve(data);
  });
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InterventionDetail id={data.id} />
    </QueryClientProvider>,
  );
}

describe("InterventionDetail", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    push.mockReset();
  });

  it("affiche le client, le technicien et les champs non renseignes", async () => {
    renderDetail();

    expect(await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" })).toBeInTheDocument();
    expect(screen.getAllByText("Koffi N'Guessan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("— non renseigné —").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aucune photo").length).toBe(2);
  });

  it("affiche le bouton Annuler seulement si le statut est Planifiee", async () => {
    renderDetail({ ...intervention, statut: "REALISEE", dateRealisation: "2026-09-14T12:00:00.000Z" });

    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });
    expect(screen.queryByText("Annuler l'intervention")).not.toBeInTheDocument();
    expect(screen.queryByText("Modifier")).not.toBeInTheDocument();
  });

  it("affiche un lien Modifier vers le formulaire d'edition quand le statut est Planifiee", async () => {
    renderDetail();
    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });

    const lien = screen.getByText("Modifier").closest("a");
    expect(lien).toHaveAttribute("href", `/interventions/modifier?id=${intervention.id}`);
  });

  it("ouvre la modale de confirmation et declenche l'annulation", async () => {
    renderDetail();
    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });

    fireEvent.click(screen.getByText("Annuler l'intervention"));
    expect(await screen.findByText("Cette action est définitive.", { exact: false })).toBeInTheDocument();

    const boutonsModale = screen.getAllByText("Annuler l'intervention");
    fireEvent.click(boutonsModale[boutonsModale.length - 1]);

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
        expect.stringContaining(`/interventions/${intervention.id}`),
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("affiche le bouton Supprimer seulement si le statut est Annulee", async () => {
    renderDetail({ ...intervention, statut: "ANNULEE" });

    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });
    expect(screen.getByText("Supprimer")).toBeInTheDocument();
  });

  it("n affiche pas le bouton Supprimer pour une intervention Planifiee ou Realisee", async () => {
    renderDetail();
    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });
    expect(screen.queryByText("Supprimer")).not.toBeInTheDocument();
  });

  it("ouvre la modale de confirmation et redirige vers la liste apres suppression", async () => {
    renderDetail({ ...intervention, statut: "ANNULEE" });
    await screen.findByRole("heading", { level: 1, name: "Hôtel Ivoire" });

    fireEvent.click(screen.getByText("Supprimer"));
    expect(await screen.findByText("Cette action est définitive et ne peut pas être annulée.", { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Supprimer définitivement"));

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
        expect.stringContaining(`/interventions/${intervention.id}`),
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/interventions"));
  });
});
