import { act, renderHook } from "@testing-library/react";
import { useAtom } from "jotai";
import { describe, expect, test } from "vitest";
import { atomSet, AtomSetActions } from "./atomSet";

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

});