import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setToken } from "@/features/auth/lib/token";
import Home from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("Home", () => {
  beforeEach(() => {
    replace.mockReset();
    window.localStorage.clear();
  });

  it("redirige vers /connexion sans jeton", async () => {
    render(<Home />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/connexion"));
  });

  it("redirige vers /interventions avec un jeton present", async () => {
    setToken("jeton-de-test");
    render(<Home />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/interventions"));
  });
});
