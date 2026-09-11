import { describe, expect, it } from "vitest";
import { formatDateTime } from "./date";

describe("formatDateTime", () => {
  it("formate au format jj/mm/aaaa · HH:mm", () => {
    expect(formatDateTime("2026-09-14T09:00:00.000Z")).toMatch(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
  });
});
