import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "tech-1", label: "Koffi N'Guessan" },
  { value: "tech-2", label: "Awa Traore" },
];

describe("Select", () => {
  it("affiche le placeholder quand aucune valeur n'est selectionnee", () => {
    render(<Select value="" onChange={vi.fn()} options={options} placeholder="Choisir…" ariaLabel="Technicien" />);
    expect(screen.getByLabelText("Technicien")).toHaveTextContent("Choisir…");
  });

  it("affiche le libelle de l'option selectionnee", () => {
    render(<Select value="tech-2" onChange={vi.fn()} options={options} ariaLabel="Technicien" />);
    expect(screen.getByLabelText("Technicien")).toHaveTextContent("Awa Traore");
  });

  it("n'affiche pas les options tant que le menu n'est pas ouvert", () => {
    render(<Select value="" onChange={vi.fn()} options={options} ariaLabel="Technicien" />);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("ouvre le menu au clic et affiche les options", () => {
    render(<Select value="" onChange={vi.fn()} options={options} ariaLabel="Technicien" />);
    fireEvent.click(screen.getByLabelText("Technicien"));
    expect(screen.getByRole("option", { name: "Koffi N'Guessan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Awa Traore" })).toBeInTheDocument();
  });

  it("appelle onChange et referme le menu au clic sur une option", () => {
    const onChange = vi.fn();
    render(<Select value="" onChange={onChange} options={options} ariaLabel="Technicien" />);

    fireEvent.click(screen.getByLabelText("Technicien"));
    fireEvent.click(screen.getByRole("option", { name: "Awa Traore" }));

    expect(onChange).toHaveBeenCalledWith("tech-2");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("referme le menu sur Echap sans appeler onChange", () => {
    const onChange = vi.fn();
    render(<Select value="" onChange={onChange} options={options} ariaLabel="Technicien" />);

    fireEvent.click(screen.getByLabelText("Technicien"));
    fireEvent.keyDown(screen.getByLabelText("Technicien"), { key: "Escape" });

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("referme le menu au clic en dehors", () => {
    render(
      <div>
        <Select value="" onChange={vi.fn()} options={options} ariaLabel="Technicien" />
        <button type="button">Ailleurs</button>
      </div>,
    );

    fireEvent.click(screen.getByLabelText("Technicien"));
    expect(screen.getByRole("option", { name: "Koffi N'Guessan" })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Ailleurs"));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("navigue au clavier et selectionne avec Entree", () => {
    const onChange = vi.fn();
    render(<Select value="" onChange={onChange} options={options} ariaLabel="Technicien" />);

    const bouton = screen.getByLabelText("Technicien");
    fireEvent.click(bouton);
    fireEvent.keyDown(bouton, { key: "ArrowDown" });
    fireEvent.keyDown(bouton, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("tech-2");
  });
});
