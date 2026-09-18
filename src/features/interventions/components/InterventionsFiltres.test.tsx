import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InterventionsFiltres } from "./InterventionsFiltres";

describe("InterventionsFiltres", () => {
  it("n'affiche pas Réinitialiser sans mot-cle actif", () => {
    render(<InterventionsFiltres motCle="" onMotCleChange={vi.fn()} />);
    expect(screen.queryByText("Réinitialiser")).not.toBeInTheDocument();
  });

  it("affiche Réinitialiser et le declenche quand un mot-cle est actif", () => {
    const onMotCleChange = vi.fn();
    render(<InterventionsFiltres motCle="hotel" onMotCleChange={onMotCleChange} />);

    fireEvent.click(screen.getByText("Réinitialiser"));
    expect(onMotCleChange).toHaveBeenCalledWith("");
  });

  it("propage la saisie du mot-cle", () => {
    const onMotCleChange = vi.fn();
    render(<InterventionsFiltres motCle="" onMotCleChange={onMotCleChange} />);

    fireEvent.change(screen.getByLabelText("Rechercher une intervention"), {
      target: { value: "hotel ivoire" },
    });
    expect(onMotCleChange).toHaveBeenCalledWith("hotel ivoire");
  });

  it("affiche l indicateur de tri par date prevue", () => {
    render(<InterventionsFiltres motCle="" onMotCleChange={vi.fn()} />);
    expect(screen.getByText("date prévue")).toBeInTheDocument();
  });
});
