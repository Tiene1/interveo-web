import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useScrollRestaure } from "./useScrollRestaure";

function ComposantTest({ cle, pret }: { cle: string; pret: boolean }) {
  const { ref, onScroll } = useScrollRestaure<HTMLDivElement>(cle, pret);
  return (
    <div ref={ref} onScroll={onScroll} data-testid="conteneur" style={{ overflow: "auto", height: 100 }}>
      <div style={{ height: 1000 }} />
    </div>
  );
}

describe("useScrollRestaure", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sauvegarde la position de defilement dans sessionStorage a chaque scroll", () => {
    const { getByTestId } = render(<ComposantTest cle="test-scroll-sauvegarde" pret />);
    const conteneur = getByTestId("conteneur") as HTMLDivElement;

    conteneur.scrollTop = 250;
    fireEvent.scroll(conteneur);

    expect(sessionStorage.getItem("test-scroll-sauvegarde")).toBe("250");
  });

  it("restaure la position sauvegardee une fois le conteneur pret", () => {
    sessionStorage.setItem("test-scroll-restaure", "180");

    const { getByTestId } = render(<ComposantTest cle="test-scroll-restaure" pret />);
    const conteneur = getByTestId("conteneur") as HTMLDivElement;

    expect(conteneur.scrollTop).toBe(180);
  });

  it("ne restaure rien tant que pretARestaurer est faux", () => {
    sessionStorage.setItem("test-scroll-pas-pret", "180");

    const { getByTestId } = render(<ComposantTest cle="test-scroll-pas-pret" pret={false} />);
    const conteneur = getByTestId("conteneur") as HTMLDivElement;

    expect(conteneur.scrollTop).toBe(0);
  });

  it(
    "ignore un evenement scroll parasite survenant avant que la restauration " +
      "n'ait eu lieu (bug reel : le montage initial du conteneur declenchait " +
      "parfois un scrollTop=0 qui ecrasait la valeur sauvegardee avant meme " +
      "qu'elle soit lue)",
    () => {
      sessionStorage.setItem("test-scroll-parasite", "400");

      const { getByTestId, rerender } = render(<ComposantTest cle="test-scroll-parasite" pret={false} />);
      const conteneur = getByTestId("conteneur") as HTMLDivElement;

      conteneur.scrollTop = 0;
      fireEvent.scroll(conteneur);
      expect(sessionStorage.getItem("test-scroll-parasite")).toBe("400");

      rerender(<ComposantTest cle="test-scroll-parasite" pret />);

      expect(conteneur.scrollTop).toBe(400);
    },
  );

  it("ne restaure qu'une seule fois, meme si le composant se re-rend ensuite", () => {
    sessionStorage.setItem("test-scroll-unique", "180");

    const { getByTestId, rerender } = render(<ComposantTest cle="test-scroll-unique" pret />);
    const conteneur = getByTestId("conteneur") as HTMLDivElement;
    expect(conteneur.scrollTop).toBe(180);

    // L'utilisateur remonte manuellement en haut, puis le composant se
    // re-rend (ex. nouvelle page de resultats) : la restauration ne doit pas
    // ecraser a nouveau ce choix.
    conteneur.scrollTop = 0;
    rerender(<ComposantTest cle="test-scroll-unique" pret />);

    expect(conteneur.scrollTop).toBe(0);
  });
});
