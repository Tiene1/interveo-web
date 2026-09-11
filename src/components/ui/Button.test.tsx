import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("declenche onClick au clic", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Créer l&apos;intervention</Button>);
    fireEvent.click(screen.getByText("Créer l'intervention"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("ne declenche pas onClick quand desactive", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Clôturer
      </Button>,
    );
    fireEvent.click(screen.getByText("Clôturer"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
