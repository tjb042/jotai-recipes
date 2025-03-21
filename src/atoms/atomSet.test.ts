import { act, renderHook } from "@testing-library/react";
import { useAtom } from "jotai";
import { describe, expect, test } from "vitest";
import { atomSet, AtomSetActions, useAtomSet } from "./atomSet";

/**
 * Each of the following tests rely on the fact that the underlying atom returns a ref-style object.
 * Where an object literal is returned with a single property that contains the reference to the actual
 * collection. Whenever the collection is mutated it is simply copied to a different wrapper and the
 * instance of the collection remains the same.
 * These tests check for this by asserting whether the pointer to the initial wrapper equals the pointer
 * to the resulting one (depending on the test)
 */
describe("atomSet", () => {

    test("Read-only actions do not cause mutations", () => {
        const atom = atomSet<string>();
        const { result } = renderHook(() => useAtom(atom));
        const initialWrapper = result.current[0];
        const [{ set }] = result.current;

        act(() => {
            // iterator
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const item in set) {
                // don't need to do anything with it
            }

            set.entries();
            set.forEach(() => { });
            set.has("test string");
            set.keys();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const size = set.size;
            set.values();
        });

        expect(result.current[0]).toBe(initialWrapper);
    });

    test.each<AtomSetActions<string>>([
        { type: "add", value: "one" },
        { type: "clear" },
        { type: "delete", value: "one" },
    ])(`Dispatching $type causes a mutation`, (action) => {
        const atom = atomSet<string>();
        const { result } = renderHook(() => useAtom(atom));
        const [initialWrapper, dispatch] = result.current;

        act(() => {
            dispatch(action);
        });

        expect(result.current[0]).not.toBe(initialWrapper);
    });

    test("Dispatch state is available immediately", () => {
        const atom = atomSet<number>();
        const { result } = renderHook(() => useAtom(atom));
        const [{set}, dispatch] = result.current;

        const initialSize = set.size;
        let intermediateSize = 0;
        act(() => {
            dispatch({ type: "add", value: 1 });
            intermediateSize = set.size;

            dispatch({ type: "add", value: 15 });
            dispatch({ type: "add", value: 87 });
        });

        expect(initialSize).toBe(0);
        expect(intermediateSize).toBe(1);
        expect(result.current[0].set.size).toBe(3);
        expect(Array.from(result.current[0].set.values())).toEqual([1, 15, 87]);
    })

    test("Invoking an invalid action does not cause a mutation", () => {
        const atom = atomSet<string>();
        const { result } = renderHook(() => useAtom(atom));
        const initialWrapper = result.current[0];

        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.current[1]({ type: "fake" } as any);
        });

        expect(initialWrapper).toBe(result.current[0]);
    });

});

describe("useAtomSet", () => {

    test("Mutations available immediately and over multiple renders", () => {
        const atom = atomSet<string>();
        const { result, rerender } = renderHook(() => useAtomSet(atom));

        result.current.add("one");
        expect(result.current.size).toBe(1);

        rerender();
        expect(result.current.size).toBe(1);

        rerender();
        result.current.add("two");
        result.current.add("three");
        expect(result.current.delete("three")).toBe(true);
        expect(result.current.size).toBe(2);

        rerender();
        result.current.clear();
        expect(result.current.size).toBe(0);
    })

})