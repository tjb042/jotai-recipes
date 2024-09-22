import { atom, useAtom, WritableAtom } from "jotai";
import { useConstant } from "../hooks/useConstant";

type ReadOnlyArray<T> = Pick<Array<T>,
    "concat" |
    "entries" | "every" | "filter" | "find" | "findIndex" |
    "flat" | "flatMap" | "forEach" | "includes" | "indexOf" |
    "join" | "keys" | "lastIndexOf" | "length" | "map" | "reduce" |
    "reduceRight" | "slice" | "some" | "toLocaleString" | "toString" |
    "values">;

type AtomArrayActions<T> =
    { type: "copyWithin", target: number, start: number, end?: number } |
    { type: "fill", value: T, start?: number, end?: number } |
    { type: "pop" } |
    { type: "push", values: T | T[] } |
    { type: "reverse" } |
    { type: "shift" } |
    { type: "sort", compareFn?: (a: T, b: T) => number } |
    { type: "splice", start: number, deleteCount?: number, values: T | T[] } |
    { type: "unshift", values: T | T[] }
    ;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomArray<T> = WritableAtom<{ array: ReadOnlyArray<T> }, [action: AtomArrayActions<T>], any>;

export function atomArray<T>(initialArray?: T[]): AtomArray<T> {

    const arrayAtom = atom<{ array: T[] }>({ array: initialArray ? [...initialArray] : [] });
    return atom(
        (get) => get(arrayAtom),
        (get, set, action) => {
            const array = get(arrayAtom).array;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let result: any;

            switch (action.type) {
                case "copyWithin":
                    result = array.copyWithin(action.target, action.start, action.end);
                    break;
                case "fill":
                    result = array.fill(action.value, action.start, action.end);
                    break;
                case "pop":
                    result = array.pop();
                    break;
                case "push":
                    if (Array.isArray(action.values)) {
                        result = array.push(...action.values);
                    }
                    else {
                        result = array.push(action.values);
                    }
                    break;
                case "reverse":
                    result = array.reverse();
                    break;
                case "shift":
                    result = array.shift();
                    break;
                case "sort":
                    result = array.sort(action.compareFn);
                    break;
                case "splice":
                    if (action.values !== undefined) {
                        if (Array.isArray(action.values)) {
                            result = array.splice(action.start, action.deleteCount ?? 0, ...action.values);
                        }
                        else {
                            result = array.splice(action.start, action.deleteCount ?? 0, action.values);
                        }
                    }
                    else {
                        result = array.splice(action.start, action.deleteCount);
                    }
                    break;
                case "unshift":
                    if (Array.isArray(action.values)) {
                        result = array.unshift(...action.values);
                    }
                    else {
                        result = array.unshift(action.values);
                    }
                    break;
            }

            set(arrayAtom, { array });
            return result;
        }
    )

}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ObservableArray<T> extends Array<T> { }

export function useAtomArray<T>(atom: AtomArray<T>): ObservableArray<T> {

    const [{ array }, dispatch] = useAtom(atom);
    const arrayLike = useConstant(() => {
        const arrayLike = Object.create(array) as Array<T>;

        arrayLike.copyWithin = function (target: number, start: number, end?: number) {
            dispatch({ type: "copyWithin", target, start, end });
            return this;
        }

        arrayLike.fill = function (value: T, start?: number, end?: number) {
            dispatch({ type: "fill", value, start, end });
            return this;
        }

        arrayLike.pop = function (): T | undefined {
            return dispatch({ type: "pop" });
        }

        arrayLike.push = function (...values: T[]) {
            return dispatch({ type: "push", values });
        }

        arrayLike.reverse = function() {
            dispatch({ type: "reverse" });
            return this;
        }

        arrayLike.shift = function(): T | undefined {
            return dispatch({ type: "shift" });
        }

        arrayLike.sort = function(compareFn?: (a: T, b: T) => number) {
            dispatch({ type: "sort", compareFn });
            return this;
        }

        arrayLike.splice = function(start: number, deleteCount: number, ...values: T[]) {
            return dispatch({ type: "splice", start, deleteCount, values });
        }

        arrayLike.unshift = function(...values: T[]) {
            return dispatch({ type: "unshift", values });
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arrayLike as any)[Symbol.iterator] = (array as any)[Symbol.iterator].bind(array);
        arrayLike.concat = array.concat.bind(array);
        arrayLike.entries = array.entries.bind(array);
        arrayLike.every = array.every.bind(array);
        arrayLike.filter = array.filter.bind(array);
        arrayLike.find = array.find.bind(array);
        arrayLike.findIndex = array.findIndex.bind(array);
        arrayLike.flat = array.flat.bind(array);
        arrayLike.flatMap = array.flatMap.bind(array);
        arrayLike.forEach = array.forEach.bind(array);
        arrayLike.includes = array.includes.bind(array);
        arrayLike.indexOf = array.indexOf.bind(array);
        arrayLike.join = array.join.bind(array);
        arrayLike.keys = array.keys.bind(array);
        arrayLike.lastIndexOf = array.lastIndexOf.bind(array);
        arrayLike.map = array.map.bind(array);
        arrayLike.reduce = array.reduce.bind(array);
        arrayLike.reduceRight = array.reduceRight.bind(array);
        arrayLike.slice = array.slice.bind(array);
        arrayLike.some = array.some.bind(array);
        arrayLike.toLocaleString = array.toLocaleString.bind(array);
        arrayLike.toString = array.toString.bind(array);
        arrayLike.values = array.values.bind(array);

        return arrayLike;
    });

    return arrayLike;
}