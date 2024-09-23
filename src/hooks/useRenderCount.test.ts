import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useRenderCount } from "./useRenderCount";

describe("useRenderCount", () => {

    test("Increments count on render", () => {
        const { result, rerender } = renderHook(() => useRenderCount());
        const initialCount = result.current;

        rerender();
        const intermediateCount = result.current;

        rerender();
        rerender();
        const finalCount = result.current;

        expect(initialCount).toBeGreaterThan(0);
        expect(intermediateCount).toBeGreaterThan(initialCount);
        expect(finalCount).toBeGreaterThan(intermediateCount);
    })
})