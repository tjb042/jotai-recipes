import { Atom, useAtom, useAtomValue, useStore } from "jotai";
import { memo, useMemo, useRef, useState } from "react";
import { AtomsTree, atomsTree, TreeRoot } from "./atoms/atomsTree";
import { useConstant } from "./hooks/useConstant";

interface TreeNode {
    id: string,
    label: string,
}

const DefaultMaxItemsBounds = 10;
let nodeCounter = 0;

function createNode(): TreeNode {
    nodeCounter++;
    return {
        id: nodeCounter.toString(),
        label: `Node_${nodeCounter}`
    }
}

const MemoizedTreeItem = memo(TreeItem, (prev, next) => prev.nodeId === next.nodeId && prev.index === next.index);
const MemoizedTreeItems = memo(TreeItems, (prev, next) => Object.is(prev.childrenAtom, next.childrenAtom));

export function TreeTest() {

    const store = useStore();
    const [tree, rootAtoms] = useConstant(() => {
        const tree = atomsTree<string, TreeNode>(store);

        return [
            tree,
            tree.getNodeAtoms(TreeRoot)!
        ]
    });

    return (
        <div>
            <div>
                <button onClick={() => tree.addNode(createNode(), TreeRoot)}>Add Node</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.removeDescendants(TreeRoot)}>Clear</button>
            </div>
            <MemoizedTreeItems
                tree={tree}
                childrenAtom={rootAtoms.children}
            />
        </div>
    )
}

function TreeItem(props: { tree: AtomsTree<string, TreeNode>, nodeId: string, index: number }) {

    const { tree, nodeId, index } = props;
    const atoms = useMemo(() => tree.getNodeAtoms(nodeId)!, [tree, nodeId]);
    const [node, setNode] = useAtom(atoms.node);
    
    const renders = useRef(0);
    renders.current++;

    return (
        <li>
            <div>
                <span>{node.label}</span>
                <button style={{ marginLeft: 4 }} onClick={() => setNode({ ...node, label: `Node_${nodeCounter++}` })}>Rename</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.reorderUp(node.id)}>Up</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.reorderDown(node.id)}>Down</button>
                
                <button style={{ marginLeft: 4 }} onClick={() => tree.reorderTo(node.id, 0)}>Top</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.reorderTo(node.id, tree.getSiblingIds(node.id)!.length)}>Bottom</button>

                <button style={{ marginLeft: 4 }} onClick={() => tree.removeNode(node.id)}>X</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.addNode(createNode(), node.id)}>Add child</button>

                <button style={{ marginLeft: 4 }} onClick={() => tree.addNode(createNode(), tree.getParentId(node.id)!, index)}>Insert before</button>
                <button style={{ marginLeft: 4 }} onClick={() => tree.addNode(createNode(), tree.getParentId(node.id)!, index + 1)}>Insert after</button>

                <span>render: {renders.current}</span>
            </div>
            <MemoizedTreeItems tree={tree} childrenAtom={atoms.children} />
        </li>
    )
}

function TreeItems(props: { tree: AtomsTree<string, TreeNode>, childrenAtom: Atom<string[]> }) {

    const { tree, childrenAtom } = props;
    const [maxItems, setMaxItems] = useState(DefaultMaxItemsBounds);
    const nodeIds = useAtomValue(childrenAtom);

    return (
        <ul>
            {nodeIds.slice(0, maxItems).map((nodeId, index) => (
                <MemoizedTreeItem key={nodeId} nodeId={nodeId} tree={tree} index={index} />
            ))}
            {nodeIds.length > maxItems && (
                <li onClick={() => setMaxItems(maxItems + DefaultMaxItemsBounds)}>
                    {nodeIds.length - maxItems} hidden. Click to show {Math.min(DefaultMaxItemsBounds, nodeIds.length - maxItems)} more...
                </li>
            )}
        </ul>
    )
}