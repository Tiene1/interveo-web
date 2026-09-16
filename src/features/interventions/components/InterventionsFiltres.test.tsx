import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Technicien } from "../types/intervention";
import { InterventionsFiltres } from "./InterventionsFiltres";

const technicien: Technicien = {
  id: "tech-1",
  nom: "Koffi N'Guessan",
  identifiant: "koffi",
  role: "TECHNICIEN",
  actif: true,
};

describe("InterventionsFiltres", () => {
  it("n'affiche pas Réinitialiser sans filtre actif", () => {
    render(
      <InterventionsFiltres
        motCle=""
        onMotCleChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );
    expect(screen.queryByText("Réinitialiser")).not.toBeInTheDocument();
  });

  it("affiche Réinitialiser et le declenche quand un filtre est actif", () => {
    const onMotCleChange = vi.fn();
    const onTechnicienIdChange = vi.fn();
    render(
      <InterventionsFiltres
        motCle="hotel"
        onMotCleChange={onMotCleChange}
        technicienId=""
        onTechnicienIdChange={onTechnicienIdChange}
        techniciens={[technicien]}
      />,
    );

    fireEvent.click(screen.getByText("Réinitialiser"));
    expect(onMotCleChange).toHaveBeenCalledWith("");
    expect(onTechnicienIdChange).toHaveBeenCalledWith("");
  });

  it("propage la saisie du mot-cle", () => {
    const onMotCleChange = vi.fn();
    render(
      <InterventionsFiltres
        motCle=""
        onMotCleChange={onMotCleChange}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Rechercher une intervention"), {
      target: { value: "hotel ivoire" },
    });
    expect(onMotCleChange).toHaveBeenCalledWith("hotel ivoire");
  });

  it("liste les techniciens dans le select", () => {
    render(
      <InterventionsFiltres
        motCle=""
        onMotCleChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );
    fireEvent.click(screen.getByLabelText("Filtrer par technicien"));
    expect(screen.getByRole("option", { name: "Koffi N'Guessan" })).toBeInTheDocument();
  });

  it("selectionne un technicien au clic sur une option", () => {
    const onTechnicienIdChange = vi.fn();
    render(
      <InterventionsFiltres
        motCle=""
        onMotCleChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={onTechnicienIdChange}
        techniciens={[technicien]}
      />,
    );

    fireEvent.click(screen.getByLabelText("Filtrer par technicien"));
    fireEvent.click(screen.getByRole("option", { name: "Koffi N'Guessan" }));

    expect(onTechnicienIdChange).toHaveBeenCalledWith("tech-1");
  });

  it("affiche l indicateur de tri par date prevue", () => {
    render(
      <InterventionsFiltres
        motCle=""
        onMotCleChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );
    expect(screen.getByText("date prévue")).toBeInTheDocument();
  });
});
