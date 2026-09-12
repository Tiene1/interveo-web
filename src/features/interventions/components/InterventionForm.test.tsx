import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { InterventionForm } from "./InterventionForm";
import type { InterventionDetail, Technicien } from "../types/intervention";

const push = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const techniciens: Technicien[] = [
  { id: "tech-1", nom: "Koffi N'Guessan", identifiant: "koffi", role: "TECHNICIEN", actif: true },
  { id: "tech-2", nom: "Awa Traore", identifiant: "awa", role: "TECHNICIEN", actif: true },
];

const intervention: InterventionDetail = {
  id: "3915b537-5d7a-40b7-be54-87578e11be91",
  nomClient: "Hôtel Ivoire",
  adresse: "Boulevard Hassan II, Cocody",
  telephone1: "+2250700000001",
  telephone2: "+2250700000002",
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
  technicien: techniciens[0],
};

function mockApi(resultat: unknown = { id: "nouvelle-id" }) {
  vi.mocked(apiRequest).mockImplementation((path: string) => {
    if (path.includes("/utilisateurs")) return Promise.resolve(techniciens);
    return Promise.resolve(resultat);
  });
}

function renderForm(props: Partial<React.ComponentProps<typeof InterventionForm>> = { mode: "creer" }) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InterventionForm mode="creer" {...props} />
    </QueryClientProvider>,
  );
}

describe("InterventionForm (creation)", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    push.mockReset();
  });

  it("affiche le recapitulatif des champs requis lorsque le formulaire est vide", async () => {
    mockApi();
    renderForm();
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.click(screen.getByText("Créer l'intervention"));

    expect(await screen.findByText("Le nom du client est requis")).toBeInTheDocument();
    expect(screen.getByText("L'adresse est requise")).toBeInTheDocument();
    expect(screen.getByText("Sélectionnez un technicien")).toBeInTheDocument();
  });

  it("cree l'intervention et redirige vers le detail lorsque le formulaire est valide", async () => {
    mockApi({ id: "nouvelle-id" });
    renderForm();
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.change(screen.getByLabelText(/Nom du client/), { target: { value: "Hôtel Ivoire" } });
    fireEvent.change(screen.getByLabelText(/^Adresse/), { target: { value: "Boulevard Hassan II" } });
    fireEvent.change(screen.getByLabelText(/Téléphone 1/), { target: { value: "+2250700000001" } });
    fireEvent.change(screen.getByLabelText(/Date et heure prévues/), { target: { value: "2026-09-20" } });
    fireEvent.change(document.getElementById("heure") as HTMLInputElement, { target: { value: "09:00" } });
    fireEvent.change(screen.getByLabelText(/Technicien assigné/), { target: { value: "tech-2" } });

    fireEvent.click(screen.getByText("Créer l'intervention"));

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
        "/interventions",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({ nomClient: "Hôtel Ivoire", technicienId: "tech-2" }),
        }),
      ),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/interventions/detail?id=nouvelle-id"));
  });
});

describe("InterventionForm (modification)", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    push.mockReset();
  });

  it("preremplit les champs avec les donnees actuelles de l'intervention", async () => {
    mockApi();
    renderForm({ mode: "modifier", intervention });
    await screen.findByText("Awa Traore", { exact: false });

    expect(screen.getByLabelText(/Nom du client/)).toHaveValue("Hôtel Ivoire");
    expect(screen.getByLabelText(/^Adresse/)).toHaveValue("Boulevard Hassan II, Cocody");
    expect(screen.getByLabelText(/Téléphone 1/)).toHaveValue("+2250700000001");
    expect(screen.getByLabelText(/Technicien assigné/)).toHaveValue("tech-1");
    expect(screen.getByText("Enregistrer les modifications")).toBeInTheDocument();
  });

  it("envoie le PATCH avec les champs modifies et redirige vers le detail", async () => {
    mockApi({ ...intervention, nomClient: "Hôtel Ivoire Renove" });
    renderForm({ mode: "modifier", intervention });
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.change(screen.getByLabelText(/Nom du client/), { target: { value: "Hôtel Ivoire Renove" } });
    fireEvent.click(screen.getByText("Enregistrer les modifications"));

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
        `/interventions/${intervention.id}`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.objectContaining({ nomClient: "Hôtel Ivoire Renove", telephone2: "+2250700000002" }),
        }),
      ),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(`/interventions/detail?id=${intervention.id}`),
    );
  });

  it("envoie une chaine vide pour effacer un champ optionnel vide", async () => {
    mockApi(intervention);
    renderForm({ mode: "modifier", intervention });
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.change(screen.getByLabelText(/Téléphone 2/), { target: { value: "" } });
    fireEvent.click(screen.getByText("Enregistrer les modifications"));

    await waitFor(() =>
      expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
        `/interventions/${intervention.id}`,
        expect.objectContaining({ body: expect.objectContaining({ telephone2: "" }) }),
      ),
    );
  });

  it("le bouton Annuler ramene vers le detail de l'intervention", async () => {
    mockApi();
    renderForm({ mode: "modifier", intervention });
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.click(screen.getByText("Annuler"));
    expect(push).toHaveBeenCalledWith(`/interventions/detail?id=${intervention.id}`);
  });
});
