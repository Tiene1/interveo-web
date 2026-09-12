import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { ApiError } from "@/lib/api/types";
import { apiRequest } from "@/lib/api/client";
import { getToken } from "../lib/token";
import { LoginForm } from "./LoginForm";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderLoginForm() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    push.mockReset();
    window.localStorage.clear();
  });

  it("affiche le message d'erreur sur une connexion échouée", async () => {
    vi.mocked(apiRequest).mockRejectedValue(
      new ApiError(401, {
        statusCode: 401,
        message: "Identifiant ou mot de passe incorrect",
        error: "Unauthorized",
        timestamp: "2026-09-12T00:00:00.000Z",
        path: "/auth/login",
        method: "POST",
      }),
    );

    renderLoginForm();
    fireEvent.change(screen.getByLabelText("Identifiant"), { target: { value: "kouassi" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "faux" } });
    fireEvent.click(screen.getByText("Se connecter"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiant ou mot de passe incorrect",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("redirige vers /interventions sur une connexion reussie", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ accessToken: "jeton" });

    renderLoginForm();
    fireEvent.change(screen.getByLabelText("Identifiant"), { target: { value: "kouassi" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "directeur123" } });
    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/interventions"));
    expect(getToken()).toBe("jeton");
  });
});
