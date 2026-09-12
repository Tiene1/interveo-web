import { describe, expect, it } from "vitest";
import { lienGoogleMaps } from "./maps";

describe("lienGoogleMaps", () => {
  it("garde un lien Google Maps colle tel quel", () => {
    const lien = "https://maps.app.goo.gl/abcd1234";
    expect(lienGoogleMaps(lien)).toBe(lien);
  });

  it("construit un lien de recherche pour des coordonnees ou une adresse", () => {
    expect(lienGoogleMaps("5.345,-4.024")).toBe(
      "https://www.google.com/maps/search/?api=1&query=5.345%2C-4.024",
    );
  });
});
