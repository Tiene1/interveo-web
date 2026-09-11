import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "./StatusChip";

describe("StatusChip", () => {
  it("affiche le libellé français de chaque statut", () => {
    render(<StatusChip statut="PLANIFIEE" />);
    expect(screen.getByText("Planifiée")).toBeInTheDocument();
  });

  it("barre le texte pour une intervention annulée", () => {
    render(<StatusChip statut="ANNULEE" />);
    expect(screen.getByText("Annulée")).toHaveClass("line-through");
  });
});
