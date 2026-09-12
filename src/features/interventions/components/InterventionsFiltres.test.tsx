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
        client=""
        onClientChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );
    expect(screen.queryByText("Réinitialiser")).not.toBeInTheDocument();
  });

  it("affiche Réinitialiser et le declenche quand un filtre est actif", () => {
    const onClientChange = vi.fn();
    const onTechnicienIdChange = vi.fn();
    render(
      <InterventionsFiltres
        client="hotel"
        onClientChange={onClientChange}
        technicienId=""
        onTechnicienIdChange={onTechnicienIdChange}
        techniciens={[technicien]}
      />,
    );

    fireEvent.click(screen.getByText("Réinitialiser"));
    expect(onClientChange).toHaveBeenCalledWith("");
    expect(onTechnicienIdChange).toHaveBeenCalledWith("");
  });

  it("propage la saisie du filtre client", () => {
    const onClientChange = vi.fn();
    render(
      <InterventionsFiltres
        client=""
        onClientChange={onClientChange}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filtrer par nom de client"), {
      target: { value: "hotel ivoire" },
    });
    expect(onClientChange).toHaveBeenCalledWith("hotel ivoire");
  });

  it("liste les techniciens dans le select", () => {
    render(
      <InterventionsFiltres
        client=""
        onClientChange={vi.fn()}
        technicienId=""
        onTechnicienIdChange={vi.fn()}
        techniciens={[technicien]}
      />,
    );
    expect(screen.getByRole("option", { name: "Koffi N'Guessan" })).toBeInTheDocument();
  });
});
