import { Atom } from "jotai";

type AddEventCallback<TKey, AtomType> = (event: {
    key: TKey,
    atom: AtomType
}) => void;

type RemoveEventCallback<TKey> = (event: {
    key: TKey,
}) => void;

export type AtomsMap<TKey, AtomType extends Atom<unknown>> = typeof atomsMap<TKey, AtomType>;

/**
 * Creates a map (index) of atoms that can be retrieved via key.
 * @param initializeAtom Initializer function for creating new atoms in the map
 */
export function atomsMap<TKey, AtomType extends Atom<unknown>>(initializeAtom: (key: TKey) => AtomType) {
 
    const atomMap = new Map<TKey, AtomType>();
    const addEvent = new Set<AddEventCallback<TKey, AtomType>>();
    const removeEvent = new Set<RemoveEventCallback<TKey>>();
    
    function onAdd_Subscribe(callback: AddEventCallback<TKey, AtomType>) {
        addEvent.add(callback);
    }

    function onAdd_Unsubscribe(callback: AddEventCallback<TKey, AtomType>) {
        addEvent.delete(callback)
    }

    function onAdd_Notify(key: TKey, atom: AtomType) {
        for(const cb of addEvent) {
            cb({ key, atom });
        }
    }

    function onRemove_Subscribe(callback: RemoveEventCallback<TKey>) {
        removeEvent.add(callback);
    }

    function onRemove_Unsubscribe(callback: RemoveEventCallback<TKey>) {
        removeEvent.delete(callback)
    }

    function onRemove_Notify(key: TKey) {
        for(const cb of removeEvent) {
            cb({ key });
        }
    }

    function get(key: TKey) {
        return atomMap.get(key);
    }

    function create(key: TKey) {
        const newAtom = initializeAtom(key);
        atomMap.set(key, newAtom);
        onAdd_Notify(key, newAtom);
    }

    function getOrCreate(key: TKey) {
        return get(key) ?? create(key);
    }

    function getKeys() {
        return atomMap.keys();
    }

    function size() {
        return atomMap.size;
    }

    function has(key: TKey) {
        return atomMap.has(key);
    }

    function remove(key: TKey) {
        if (atomMap.delete(key)) {
            onRemove_Notify(key);
            return true;
        }

        return false;
    }

    function clear() {
        const keys = atomMap.keys();
        for(const key of keys) {
            remove(key);
        }
    }

    return {
        onAdd: {
            sub: onAdd_Subscribe,
            unsub: onAdd_Unsubscribe
        },
        onRemove: {
            sub: onRemove_Subscribe,
            unsub: onRemove_Unsubscribe
        },
        get,
        create,
        getOrCreate,
        getKeys,
        size,
        has,
        remove,
        clear
    }
}