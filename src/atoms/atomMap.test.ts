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
            map.forEach(() => { });
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

    test("Dispatch state is available immediately", () => {
        const atom = atomMap<string, number>();
        const { result } = renderHook(() => useAtom(atom));
        const [{ map }, dispatch] = result.current;
        const initialSize = map.size;
        let intermediateSize = 0;

        act(() => {
            dispatch({ type: "set", key: "ringo", value: 100 });
            intermediateSize = map.size;

            dispatch({ type: "set", key: "paul", value: 100 });
            dispatch({ type: "set", key: "george", value: 100 });
            dispatch({ type: "set", key: "john", value: 100 });
        });

        expect(initialSize).toBe(0);
        expect(intermediateSize).toBe(1);
        expect(result.current[0].map.size).toBe(4);
        expect(Array.from(result.current[0].map.entries())).toEqual([["ringo", 100], ["paul", 100], ["george", 100], ["john", 100]]);
    })
});