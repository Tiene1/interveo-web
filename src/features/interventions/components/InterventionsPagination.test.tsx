import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InterventionsPagination } from "./InterventionsPagination";

describe("InterventionsPagination", () => {
  it("desactive Precedent sur la premiere page et Suivant sur la derniere", () => {
    render(<InterventionsPagination page={1} limit={20} total={9} onPageChange={vi.fn()} />);
    expect(screen.getByText("Précédent")).toBeDisabled();
    expect(screen.getByText("Suivant")).toBeDisabled();
    expect(screen.getByText("1–9")).toBeInTheDocument();
  });

  it("appelle onPageChange avec la page suivante", () => {
    const onPageChange = vi.fn();
    render(<InterventionsPagination page={1} limit={2} total={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("Suivant"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
