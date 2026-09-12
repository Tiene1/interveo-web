import { describe, expect, it } from "vitest";
import { referenceCourte } from "./reference";

describe("referenceCourte", () => {
  it("derive 4 caracteres stables a partir de l'uuid", () => {
    expect(referenceCourte("3915b537-5d7a-40b7-be54-87578e11be91")).toBe("BE91");
  });
});
