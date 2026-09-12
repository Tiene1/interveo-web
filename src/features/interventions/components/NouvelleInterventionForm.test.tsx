import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { NouvelleInterventionForm } from "./NouvelleInterventionForm";
import type { Technicien } from "../types/intervention";

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

function renderForm() {
  vi.mocked(apiRequest).mockImplementation((path: string) => {
    if (path.includes("/utilisateurs")) return Promise.resolve(techniciens);
    return Promise.resolve({ id: "nouvelle-id" });
  });
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NouvelleInterventionForm />
    </QueryClientProvider>,
  );
}

describe("NouvelleInterventionForm", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    push.mockReset();
  });

  it("affiche le recapitulatif des champs requis lorsque le formulaire est vide", async () => {
    renderForm();
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.click(screen.getByText("Créer l'intervention"));

    expect(await screen.findByText("Le nom du client est requis")).toBeInTheDocument();
    expect(screen.getByText("L'adresse est requise")).toBeInTheDocument();
    expect(screen.getByText("Sélectionnez un technicien")).toBeInTheDocument();
  });

  it("cree l'intervention et redirige vers le detail lorsque le formulaire est valide", async () => {
    renderForm();
    await screen.findByText("Awa Traore", { exact: false });

    fireEvent.change(screen.getByLabelText(/Nom du client/), { target: { value: "Hôtel Ivoire" } });
    fireEvent.change(screen.getByLabelText(/^Adresse/), { target: { value: "Boulevard Hassan II" } });
    fireEvent.change(screen.getByLabelText(/Téléphone 1/), { target: { value: "+2250700000001" } });
    fireEvent.change(screen.getByLabelText(/Date et heure prévues/), { target: { value: "2026-09-20" } });
    fireEvent.change(screen.getByLabelText(/Technicien assigné/), { target: { value: "tech-2" } });

    const heureInput = document.getElementById("heure") as HTMLInputElement;
    fireEvent.change(heureInput, { target: { value: "09:00" } });

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
