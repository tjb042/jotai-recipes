import { describe, expect, test } from "vitest";
import { atomMap, AtomMapActions, useAtomMap } from "./atomMap";
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
    });

    test("Invoking an invalid action does not cause a mutation", () => {
        const atom = atomMap<string, number>();
        const { result } = renderHook(() => useAtom(atom));
        const initialWrapper = result.current[0];

        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.current[1]({ type: "fake" } as any);
        });

        expect(result.current[0]).toBe(initialWrapper);
    })
});

describe("useAtomMap", () => {

    test("Mutations available immediately and over multiple renders", () => {
        const atom = atomMap<string, number>();
        const { result, rerender } = renderHook(() => useAtomMap(atom));

        result.current.set("initial", 15);
        expect(result.current.size).toBe(1);

        rerender();
        expect(result.current.size).toBe(1);
        expect(result.current.has("initial")).toBe(true);

        rerender();
        result.current.set("another", 2);
        result.current.set("anothernother", 3);
        expect(result.current.delete("another")).toBe(true);
        expect(result.current.size).toBe(2);

        rerender();
        result.current.clear();
        expect(result.current.size).toBe(0);
    });
})