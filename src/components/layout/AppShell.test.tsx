import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { apiRequest } from "@/lib/api/client";
import { AppShell } from "./AppShell";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderShell() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AppShell>contenu</AppShell>
    </QueryClientProvider>,
  );
}

describe("AppShell", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("affiche le libelle statique tant que le profil n'est pas charge", () => {
    vi.mocked(apiRequest).mockReturnValue(new Promise(() => {}));
    renderShell();
    expect(screen.getByText("SIM · Interventions")).toBeInTheDocument();
  });

  it("affiche une salutation dynamique avec le nom une fois le profil charge", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      id: "directeur-1",
      nom: "Kouassi Bertin",
      identifiant: "kouassi",
      role: "DIRECTEUR",
    });

    renderShell();

    await waitFor(() =>
      expect(screen.getByText(/Kouassi Bertin/)).toBeInTheDocument(),
    );
    expect(screen.queryByText("SIM · Interventions")).not.toBeInTheDocument();
  });

  it("retombe sur le libelle statique si la recuperation du profil echoue", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("erreur reseau"));
    renderShell();

    await waitFor(() => expect(vi.mocked(apiRequest)).toHaveBeenCalled());
    expect(screen.getByText("SIM · Interventions")).toBeInTheDocument();
  });
});
