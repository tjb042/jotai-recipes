import { atom, useAtom, WritableAtom } from "jotai";
import { useConstant } from "../hooks/useConstant";

type ReadOnlyMap<TKey, TValue> = Pick<Map<TKey, TValue>, 
    "entries" | "forEach" | "get" | "has" 
    | "keys" | "size" | "values"
> & Iterable<[TKey, TValue]>;

export type AtomMapActions<TKey, TValue> =
    { type: "set", key: TKey, value: TValue } |
    { type: "clear" } |
    { type: "delete", key: TKey };

export type AtomMap<TKey, TValue> = WritableAtom<{ map: ReadOnlyMap<TKey, TValue> }, [action: AtomMapActions<TKey, TValue>], boolean>;

/**
 * A memory-efficient implementation of a {@link Map<K, V>} inside of an Atom that uses
 * a dispatcher to mutate the underlying map and force re-renders
 */
export function atomMap<TKey, TValue>(initialValue?: Map<TKey, TValue>): AtomMap<TKey, TValue> {

    const mapAtom = atom({ map: initialValue ?? new Map<TKey, TValue>() });
    return atom(
        (get) => get(mapAtom),
        (get, set, action) => {
            const mapRef = get(mapAtom);
            let result = false;

            switch (action.type) {
                case "set":
                    mapRef.map.set(action.key, action.value);
                    result = true;
                    break;
                case "clear":
                    mapRef.map.clear();
                    result = true;
                    break;
                case "delete":
                    result = mapRef.map.delete(action.key);
                    break;
                default:
                    return false;
            }

            set(mapAtom, { ...mapRef });
            return result;
        }
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ObservableMap<TKey, TValue> extends Map<TKey, TValue> { }

export function useAtomMap<TKey, TValue>(atom: AtomMap<TKey, TValue>): ObservableMap<TKey, TValue> {

    const [{map}, dispatch] = useAtom(atom);
    const mapLike = useConstant(() => {
        const mapLike = Object.create(map) as Map<TKey, TValue>;
        mapLike.clear = function() {
            dispatch({ type: "clear" });
        };

        mapLike.delete = function(key: TKey) {
            return dispatch({ type: "delete", key })
        };

        mapLike.set = function(key: TKey, value: TValue) {
            dispatch({ type: "set", key, value });
            return this;
        };

        Object.defineProperty(mapLike, "size", {
            get: Object.getOwnPropertyDescriptor(Map.prototype, "size")!.get!.bind(map)
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapLike as any)[Symbol.iterator] = map[Symbol.iterator].bind(map);
        mapLike.entries = map.entries.bind(map);
        mapLike.forEach = map.forEach.bind(map);
        mapLike.get = map.get.bind(map);
        mapLike.has = map.has.bind(map);
        mapLike.keys = map.keys.bind(map);
        mapLike.values = map.values.bind(map);

        return mapLike;
    });

    return mapLike;
}