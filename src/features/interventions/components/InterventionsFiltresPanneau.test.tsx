import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Technicien } from "../types/intervention";
import { InterventionsFiltresPanneau } from "./InterventionsFiltresPanneau";

const technicien: Technicien = {
  id: "tech-1",
  nom: "Koffi N'Guessan",
  identifiant: "koffi",
  role: "TECHNICIEN",
  actif: true,
};

function props(overrides: Partial<Parameters<typeof InterventionsFiltresPanneau>[0]> = {}) {
  return {
    statut: "",
    onStatutChange: vi.fn(),
    technicienId: "",
    onTechnicienIdChange: vi.fn(),
    techniciens: [technicien],
    dateDebut: "",
    onDateDebutChange: vi.fn(),
    dateFin: "",
    onDateFinChange: vi.fn(),
    ...overrides,
  };
}

describe("InterventionsFiltresPanneau", () => {
  it("n'affiche pas de badge ni de Réinitialiser sans filtre actif", () => {
    render(<InterventionsFiltresPanneau {...props()} />);
    expect(screen.queryByText("Réinitialiser")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    expect(screen.queryByText("Réinitialiser")).not.toBeInTheDocument();
  });

  it("affiche un badge avec le nombre de filtres actifs", () => {
    render(<InterventionsFiltresPanneau {...props({ statut: "REALISEE", technicienId: "tech-1" })} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("selectionne un statut via le panneau", () => {
    const onStatutChange = vi.fn();
    render(<InterventionsFiltresPanneau {...props({ onStatutChange })} />);

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.click(screen.getByRole("combobox", { name: "Filtrer par statut" }));
    fireEvent.click(screen.getByRole("option", { name: "Réalisées" }));

    expect(onStatutChange).toHaveBeenCalledWith("REALISEE");
  });

  it("selectionne un technicien via le panneau", () => {
    const onTechnicienIdChange = vi.fn();
    render(<InterventionsFiltresPanneau {...props({ onTechnicienIdChange })} />);

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.click(screen.getByRole("combobox", { name: "Filtrer par technicien" }));
    fireEvent.click(screen.getByRole("option", { name: "Koffi N'Guessan" }));

    expect(onTechnicienIdChange).toHaveBeenCalledWith("tech-1");
  });

  it("filtre par periode via les champs Du/Au", () => {
    const onDateDebutChange = vi.fn();
    const onDateFinChange = vi.fn();
    render(<InterventionsFiltresPanneau {...props({ onDateDebutChange, onDateFinChange })} />);

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.change(screen.getByLabelText("Du"), { target: { value: "2026-09-01" } });
    fireEvent.change(screen.getByLabelText("Au"), { target: { value: "2026-09-30" } });

    expect(onDateDebutChange).toHaveBeenCalledWith("2026-09-01");
    expect(onDateFinChange).toHaveBeenCalledWith("2026-09-30");
  });

  it("Réinitialiser efface statut, technicien et periode ensemble", () => {
    const onStatutChange = vi.fn();
    const onTechnicienIdChange = vi.fn();
    const onDateDebutChange = vi.fn();
    const onDateFinChange = vi.fn();
    render(
      <InterventionsFiltresPanneau
        {...props({
          statut: "REALISEE",
          technicienId: "tech-1",
          dateDebut: "2026-09-01",
          dateFin: "2026-09-30",
          onStatutChange,
          onTechnicienIdChange,
          onDateDebutChange,
          onDateFinChange,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filtres/ }));
    fireEvent.click(screen.getByText("Réinitialiser"));

    expect(onStatutChange).toHaveBeenCalledWith("");
    expect(onTechnicienIdChange).toHaveBeenCalledWith("");
    expect(onDateDebutChange).toHaveBeenCalledWith("");
    expect(onDateFinChange).toHaveBeenCalledWith("");
  });
});
