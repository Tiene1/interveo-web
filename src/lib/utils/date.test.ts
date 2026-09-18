import { describe, expect, it } from "vitest";
import { formatDateTime, salutation } from "./date";

describe("formatDateTime", () => {
  it("formate au format jj/mm/aaaa · HH:mm", () => {
    expect(formatDateTime("2026-09-14T09:00:00.000Z")).toMatch(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
  });
});

describe("salutation", () => {
  it("Bonsoir avant 5h", () => {
    expect(salutation(new Date(2026, 8, 14, 4, 59))).toBe("Bonsoir");
  });

  it("Bonjour de 5h a 11h59", () => {
    expect(salutation(new Date(2026, 8, 14, 5, 0))).toBe("Bonjour");
    expect(salutation(new Date(2026, 8, 14, 11, 59))).toBe("Bonjour");
  });

  it("Bon apres-midi de 12h a 17h59", () => {
    expect(salutation(new Date(2026, 8, 14, 12, 0))).toBe("Bon après-midi");
    expect(salutation(new Date(2026, 8, 14, 17, 59))).toBe("Bon après-midi");
  });

  it("Bonsoir a partir de 18h", () => {
    expect(salutation(new Date(2026, 8, 14, 18, 0))).toBe("Bonsoir");
    expect(salutation(new Date(2026, 8, 14, 23, 59))).toBe("Bonsoir");
  });
});
