import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useConstant } from "./useConstant";

describe("useConstant", () => {

    test("Only fires initializer once", () => {
        const initializerSpy = vi.fn(() => 15);
        const { result, rerender } = renderHook(() => useConstant(initializerSpy));

        // trigger a few more renders
        for (let i = 0; i < 5; i++) {
            rerender();
        }

        expect(initializerSpy).toHaveBeenCalledOnce();
        expect(result.current).toBe(15);
    })

})