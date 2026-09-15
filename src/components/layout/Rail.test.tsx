import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getToken, setToken } from "@/features/auth/lib/token";
import { Rail } from "./Rail";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Rail", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
  });

  it("efface le jeton et redirige vers /connexion au clic sur Se deconnecter", () => {
    setToken("jeton-de-test");
    render(<Rail />);

    fireEvent.click(screen.getByLabelText("Se déconnecter"));

    expect(getToken()).toBeNull();
    expect(push).toHaveBeenCalledWith("/connexion");
  });
});
