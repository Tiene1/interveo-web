import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
  it("affiche le kicker, le titre et la description", () => {
    render(
      <StatePanel kicker="Aucune donnée" title="Rien ici" description="Description du vide" />,
    );
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.getByText("Rien ici")).toBeInTheDocument();
    expect(screen.getByText("Description du vide")).toBeInTheDocument();
  });

  it("applique la couleur danger au kicker", () => {
    render(<StatePanel tone="danger" kicker="Erreur" title="Oups" description="..." />);
    expect(screen.getByText("Erreur")).toHaveClass("text-danger");
  });
});
