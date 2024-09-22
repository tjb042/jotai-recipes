import { describe, expect, test } from "vitest";
import { atomMap, AtomMapActions } from "./atomMap";
import { act, renderHook } from "@testing-library/react";
import { useAtom } from "jotai";

describe("atomMap", () => {

    test("Read-only actions do not cause mutations", () => {
        const atom = atomMap<string, number>();
        const { result } = renderHook(() => useAtom(atom));
        const initialWrapper = result.current[0];
        const [{ map }] = result.current;

        act(() => {
            // iterator
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const item in map) {
                // don't need to do anything with it
            }

            map.entries();
            map.forEach(() => {});
            map.get("value");
            map.has("thing");
            map.keys();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const size = map.size;
            map.values();
        });

        expect(result.current[0]).toBe(initialWrapper);
    });

    test.each<AtomMapActions<string, number>>([
        { type: "clear" },
        { type: "delete", key: "something" },
        { type: "set", key: "daft-punk", value: 999 }
    ])(`Dispatching $type causes a mutation`, (action) => {
        const atom = atomMap<string, number>();
        const { result } = renderHook(() => useAtom(atom));
        const [initialWrapper, dispatch] = result.current;

        act(() => {
            dispatch(action);
        });

        expect(result.current[0]).not.toBe(initialWrapper);
    })
});