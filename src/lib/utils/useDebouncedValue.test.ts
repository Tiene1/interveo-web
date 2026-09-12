import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("ne renvoie la nouvelle valeur qu'apres le delai", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "hotel" },
    });

    expect(result.current).toBe("hotel");

    rerender({ value: "hotel ivoire" });
    expect(result.current).toBe("hotel");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("hotel ivoire");
  });
});
