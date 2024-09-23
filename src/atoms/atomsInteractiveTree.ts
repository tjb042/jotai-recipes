import { atom, createStore } from "jotai";
import { atomsTree } from "./atomsTree";

type JotaiStore = ReturnType<typeof createStore>;

export interface TreeNode<TKey> {
    id: TKey,
    /**
     * Indicates whether this node is selected
     */
    selected?: boolean,
    /**
     * Indicates whether this node accepts interaction events
     */
    disabled?: boolean,
    /**
     * Indicates whether this node can be directly deleted.
     * Node could still be removed if it's parent is deleted.
     */
    deletable?: boolean,
}

export function atomsInteractiveTree<TKey>(store: JotaiStore) {

    const tree = atomsTree<TKey, TreeNode<TKey>>(store);
    const selectedNodesAtom = atom(() => {
        const selectedIds: TKey[] = [];
        tree.forEach((value) => {
            const node = store.get(value.node);
            if (node?.selected) {
                selectedIds.push(node.id);
            }
        });

        return selectedIds;
    });
    const disabledNodesAtom = atom(() => {
        const disabledIds: TKey[] = [];
        tree.forEach((value) => {
            const node = store.get(value.node);
            if (node?.disabled) {
                disabledIds.push(node.id);
            }
        });

        return disabledIds;
    })

    return {
        ...tree,
        selectedNodesAtom,
        disabledNodesAtom
    }
}