import { atom, useAtom, WritableAtom } from "jotai";
import { useConstant } from "../hooks/useConstant";

type ReadOnlySet<T> = Pick<Set<T>, "has" | "entries" | "forEach" | "keys" | "size" | "values"> & Iterable<T>;

type AtomSetActions<T> =
    { type: "add", value: T } |
    { type: "clear" } |
    { type: "delete", value: T }
;

export type AtomSet<T> = WritableAtom<{ set: ReadOnlySet<T> }, [action: AtomSetActions<T>], boolean>;

/**
 * A memory-efficient implementation of a {@link Set<T>} inside of an Atom that uses
 * a dispatcher to mutate the underlying set and force re-renders
 */
export function atomSet<T>(initialValue?: Set<T>): AtomSet<T> {

    const setAtom = atom({ set: initialValue ?? new Set<T>() });
    return atom(
        (get) => get(setAtom),
        (get, set, action) => {
            const setRef = get(setAtom);
            let result = false;

            switch (action.type) {
                case "add":
                    setRef.set.add(action.value);
                    result = true;
                    break;
                case "clear":
                    setRef.set.clear();
                    result = true;
                    break;
                case "delete":
                    result = setRef.set.delete(action.value);
                    break;
                default:
                    return false;
            }

            set(setAtom, { ...setRef });
            return result;
        },
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ObservableSet<T> extends Set<T> {}

export function useAtomSet<T>(atom: AtomSet<T>): ObservableSet<T> {

    const [{set}, dispatch] = useAtom(atom);
    const setLike = useConstant(() => {
        const setLike = Object.create(set) as Set<T>;
        setLike.add = function(value: T) {
            dispatch({ type: "add", value });
            return this;
        };
        setLike.clear = function() {
            dispatch({ type: "clear" });
        };

        setLike.delete = function(value: T) {
            return dispatch({ type: "delete", value });
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (setLike as any)[Symbol.iterator] = set[Symbol.iterator].bind(set);
        setLike.entries = set.entries.bind(set);
        setLike.forEach = set.forEach.bind(set);
        setLike.has = set.has.bind(set);
        setLike.keys = set.keys.bind(set);
        setLike.values = set.values.bind(set);

        return setLike;
    });

    return setLike;
}