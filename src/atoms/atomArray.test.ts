import { act, renderHook } from "@testing-library/react";
import { useAtom } from "jotai";
import { describe, expect, test } from "vitest";
import { atomArray, AtomArrayActions } from "./atomArray";

describe("atomArray", () => {

    test("Read-only actions do not cause mutations", () => {
        const atom = atomArray<string>();
        const { result } = renderHook(() => useAtom(atom));
        const initialWrapper = result.current[0];
        const [{ array }] = result.current;

        act(() => {
            // iterator
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const item in array) {
                // don't need to do anything with it
            }

            array.concat("something");
            array.entries();
            array.every(x => x);
            array.filter(x => x === "yes");
            array.find(x => x === "153");
            array.findIndex(x => x);
            array.flat();
            array.flatMap(() => []);
            array.forEach(() => {});
            array.includes("witch");
            array.indexOf("fine");
            array.join(",");
            array.keys();
            array.lastIndexOf("something");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const length = array.length;
            array.map(x => Number(x));
            array.reduce((p) => p + 1, 0);
            array.reduceRight(p => p + 1, 0);
            array.slice(1, 10);
            array.some(x => x);
            array.toLocaleString();
            array.toString();
            array.values();
        });

        expect(result.current[0]).toBe(initialWrapper);
    });

    test.each<AtomArrayActions<string>>([
        { type: "copyWithin", target: 5, start: 1 },
        { type: "fill", start: 0, end: 10, value: "wow" },
        { type: "pop" },
        { type: "push", values: "whip" },
        { type: "push", values: ["one", "two"] },
        { type: "reverse" },
        { type: "shift" },
        { type: "sort" },
        { type: "splice", start: 0, deleteCount: 1 },
        { type: "unshift", values: "shifty" },
        { type: "unshift", values: ["mutli", "shifty"] }
    ])(`Dispatching $type causes a mutation`, (action) => {
        const atom = atomArray<string>();
        const { result } = renderHook(() => useAtom(atom));
        const [initialWrapper, dispatch] = result.current;

        act(() => {
            dispatch(action);
        });

        expect(result.current[0]).not.toBe(initialWrapper);
    });

});