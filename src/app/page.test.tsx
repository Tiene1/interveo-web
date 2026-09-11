import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("affiche le nom de l'application", () => {
    render(<Home />);
    expect(screen.getByText("SIM Interventions")).toBeInTheDocument();
  });
});
