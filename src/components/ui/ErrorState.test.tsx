import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("declenche onRetry au clic sur Réessayer", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Réessayer"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("n'affiche pas de bouton sans onRetry", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Réessayer")).not.toBeInTheDocument();
  });
});
