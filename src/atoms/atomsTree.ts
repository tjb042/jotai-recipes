import { Atom, atom, createStore, PrimitiveAtom } from "jotai";

export const TreeRoot = Symbol();
export type TreeRoot = typeof TreeRoot;

type JotaiStore = ReturnType<typeof createStore>;

interface TreeAtoms<TKey, TNode> {
    node: PrimitiveAtom<TNode>,
    parent: PrimitiveAtom<TKey | TreeRoot>,
    children: PrimitiveAtom<TKey[]>,
}

interface ReadOnlyTreeAtoms<TKey, TNode> {
    node: PrimitiveAtom<TNode>,
    parent: Atom<TKey | TreeRoot>,
    children: Atom<TKey[]>,
}

export type AtomsTree<TKey, TNode extends { id: TKey }> = ReturnType<typeof atomsTree<TKey, TNode>>;

export function atomsTree<TKey, TNode extends { id: TKey }>(store: JotaiStore) {

    const atomMap = new Map<TKey | TreeRoot, TreeAtoms<TKey, TNode>>();
    atomMap.set(TreeRoot, {
        node: atom<TNode>({ id: "static-tree-root" } as TNode),
        parent: atom<TKey | TreeRoot>(TreeRoot),
        children: atom<TKey[]>([])
    })

    function addNode(node: TNode, parentKey: TKey | TreeRoot, toIndex?: number) {
        if (atomMap.has(node.id)) {
            throw new Error(`Tree already contains an item with key ${String(node.id)}`);
        }

        const parentAtoms = atomMap.get(parentKey);
        if (parentAtoms === undefined) {
            throw new Error(`Tree does not contain parent key ${String(parentKey)}`)
        }

        // add new node into the map
        // set the parent key equal to the selected parent
        const atoms: TreeAtoms<TKey, TNode> = {
            node: atom(node),
            parent: atom(parentKey),
            children: atom<TKey[]>([])
        };

        atomMap.set(node.id, atoms);

        // add node to the parent's children atom
        store.set(parentAtoms.children, (children) => {
            const newChildren = [...children];
            newChildren.splice(toIndex ?? children.length, 0, node.id);

            return newChildren;
        });

        return atoms as ReadOnlyTreeAtoms<TKey, TNode>;
    }

    function moveNode(node: TNode, newParentKey: TKey | TreeRoot, toIndex?: number): boolean {
        const nodeAtoms = atomMap.get(node.id);
        if (nodeAtoms === undefined) {
            return false;
        }

        const newParentAtoms = atomMap.get(newParentKey);
        if (newParentAtoms === undefined) {
            return false;
        }

        // remove node from the current parent's children array
        const currentParentAtoms = atomMap.get(store.get(nodeAtoms.parent))!;
        store.set(currentParentAtoms.children, (children) => children.filter(c => c !== node.id));

        // uniquely add node to the new parent's children array
        if (!store.get(newParentAtoms.children).includes(node.id)) {
            store.set(newParentAtoms.children, (children) => {
                const newChildren = [...children];
                newChildren.splice(toIndex || children.length, 0, node.id);

                return newChildren;
            });
        }

        // update node's parent atom
        store.set(nodeAtoms.parent, newParentKey);

        return true;
    }

    function hasKey(key: TKey | TreeRoot): boolean {
        return atomMap.has(key);
    }

    /**
     * Remove a node from the tree and recursively remove its children
     * @param key The key of the node to remove
     */
    function removeNode(key: TKey): boolean {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return false;
        }

        // remove me from my parent's children array
        const parentAtoms = atomMap.get(store.get(nodeAtoms.parent));
        if (parentAtoms !== undefined) {
            store.set(parentAtoms.children, (children) => children.filter(c => c !== key));
        }

        // begin recursively deleting nodes
        const queue = [...store.get(nodeAtoms.children)];
        while (queue.length) {
            const childId = queue.pop();
            if (!childId) {
                break;
            }

            const childAtoms = atomMap.get(childId);
            if (childAtoms) {
                const childIds = store.get(childAtoms.children);
                queue.push(...childIds);
                atomMap.delete(childId);
            }
        }

        return true;
    }

    /**
     * Remove all children of the given node
     * @param key The node to remove descendants
     */
    function removeDescendants(key: TKey | TreeRoot): boolean {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return false;
        }

        const childIds = [...store.get(nodeAtoms.children)];
        for (const childId of childIds) {
            removeNode(childId);
        }

        return true;
    }

    function getRootAtoms() {
        return getNodeAtoms(TreeRoot);
    }

    function getNodeAtoms(key: TKey | TreeRoot) {
        return atomMap.get(key) as ReadOnlyTreeAtoms<TKey, TNode> | undefined;
    }

    function getNodeValue(key: TKey | TreeRoot): TNode | undefined {
        const nodeAtoms = atomMap.get(key)
        if (nodeAtoms) {
            return store.get(nodeAtoms.node);
        }
    }

    function getParentId(key: TKey): TKey | TreeRoot | undefined {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return;
        }

        return store.get(nodeAtoms.parent);
    }

    function getSiblingIds(key: TKey): TKey[] | undefined {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return;
        }

        return getChildrenIds(store.get(nodeAtoms.parent));
    }

    function getChildrenIds(key: TKey | TreeRoot): TKey[] | undefined {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return;
        }

        return store.get(nodeAtoms.children);
    }

    /**
     * Reorders a key amongst its siblings by moving it earlier (to a lower index) in the array 
     * @returns true, if the reorder is successful; otherwise, false.
     */
    function reorderUp(key: TKey): boolean {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return false;
        }

        // get parent's children
        const parentKey = store.get(nodeAtoms.parent);
        const parentAtoms = atomMap.get(parentKey);
        if (parentAtoms === undefined) {
            return false;
        }

        const children = store.get(parentAtoms.children);
        const index = children.indexOf(key);

        // if the index is already zero there's no need to move it up
        if (index > 0) {
            store.set(parentAtoms.children, (children) => {
                children.splice(index, 1);
                children.splice(index - 1, 0, key);

                return [...children];
            });

            return true;
        }

        return false;
    }

    /**
     * Reorders a key amongst its siblings by moving it later (to a higher index) in the array
     * @returns true, if the reorder is successful; otherwise, false.
     */
    function reorderDown(key: TKey): boolean {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return false;
        }

        // get parent's children
        const parentKey = store.get(nodeAtoms.parent);
        const parentAtoms = atomMap.get(parentKey);
        if (parentAtoms === undefined) {
            return false;
        }

        const children = store.get(parentAtoms.children);
        const index = children.indexOf(key);
        if (index < 0) {
            // does not exist in the children array
            return false;
        }

        // if the index is already at max there's no need to move it down
        if (index < children.length - 1) {
            store.set(parentAtoms.children, (children) => {
                children.splice(index, 1);
                children.splice(index + 1, 0, key);

                return [...children];
            });

            return true;
        }

        return false;
    }

    function reorderTo(key: TKey, toIndex: number): boolean {
        const nodeAtoms = atomMap.get(key);
        if (nodeAtoms === undefined) {
            return false;
        }

        // get parent's children
        const parentKey = store.get(nodeAtoms.parent);
        const parentAtoms = atomMap.get(parentKey);
        if (parentAtoms === undefined) {
            return false;
        }

        const children = store.get(parentAtoms.children);
        const currentIndex = children.indexOf(key);

        // out of bounds or already in this position
        if (currentIndex < 0) {
            return false;
        }

        // offset negative numbers for the target index
        while (toIndex < 0) {
            toIndex += children.length;
        }

        // the adjusted target index is the same as ours, nothing to do
        if (currentIndex === toIndex) {
            return false;
        }

        store.set(parentAtoms.children, (children) => {
            children.splice(currentIndex, 1);
            children.splice(toIndex, 0, key);

            return [...children];
        });
        return true;
    }

    return {
        addNode,
        moveNode,
        removeNode,
        removeDescendants,
        hasKey,
        getRootAtoms,
        getNodeAtoms,
        getNodeValue,
        getParentId,
        getSiblingIds,
        getChildrenIds,
        reorderUp,
        reorderDown,
        reorderTo
    }
}