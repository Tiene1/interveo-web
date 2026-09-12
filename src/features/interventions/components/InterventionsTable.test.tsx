import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Intervention, Technicien } from "../types/intervention";
import { InterventionsTable } from "./InterventionsTable";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const technicien: Technicien = {
  id: "tech-1",
  nom: "Koffi N'Guessan",
  identifiant: "koffi",
  role: "TECHNICIEN",
  actif: true,
};

const intervention: Intervention = {
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
};

describe("InterventionsTable", () => {
  it("affiche le client, le technicien et le statut", () => {
    render(<InterventionsTable interventions={[intervention]} techniciens={[technicien]} />);

    expect(screen.getByText("Hôtel Ivoire")).toBeInTheDocument();
    expect(screen.getByText("Koffi N'Guessan")).toBeInTheDocument();
    expect(screen.getByText("Planifiée")).toBeInTheDocument();
  });

  it("navigue vers le detail au clic sur une ligne", () => {
    render(<InterventionsTable interventions={[intervention]} techniciens={[technicien]} />);

    fireEvent.click(screen.getByText("Hôtel Ivoire"));
    expect(push).toHaveBeenCalledWith(`/interventions/${intervention.id}`);
  });

  it("affiche un tiret quand le technicien est inconnu", () => {
    render(<InterventionsTable interventions={[intervention]} techniciens={[]} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
