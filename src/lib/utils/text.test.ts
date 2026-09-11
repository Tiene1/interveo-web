import { describe, expect, it } from "vitest";
import { nonRenseigne } from "./text";

describe("nonRenseigne", () => {
  it("renvoie la valeur si elle est presente", () => {
    expect(nonRenseigne("Climatiseur en panne")).toBe("Climatiseur en panne");
  });

  it("renvoie le texte convenu si la valeur est vide ou absente", () => {
    expect(nonRenseigne(null)).toBe("— non renseigné —");
    expect(nonRenseigne(undefined)).toBe("— non renseigné —");
    expect(nonRenseigne("   ")).toBe("— non renseigné —");
  });
});
