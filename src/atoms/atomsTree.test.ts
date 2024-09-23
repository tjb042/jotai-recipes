import { describe, expect, test } from "vitest";
import { atomsTree, TreeRoot } from "./atomsTree";

describe("atomsTree", () => {

    test("Add node", () => {
        const tree = atomsTree();
        
        tree.addNode({ id: "1" });
        tree.addNode({ id: "2" });

        expect(tree.size()).toBe(2);
        expect(tree.getValue("1")).toBeDefined();
        expect(tree.getValue("2")).toBeDefined();
    });

    test("Cannot add node to invalid parent key", () => {
        const tree = atomsTree();

        expect(() => {
            tree.addNode({ id: "A" }, "fake");
        }).toThrowError();
    })

    test("Cannot add duplicate id node", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });

        expect(() => {
            tree.addNode({ id: "1" });
        }).toThrowError();
    })

    test("Cannot add node with itself as parent", () => {
        const tree = atomsTree();

        expect(() => {
            tree.addNode({ id: "A" }, "A");
        }).toThrowError();
    })

    test("Add child nodes", () => {
        const tree = atomsTree();
        
        tree.addNode({ id: "1" });
        tree.addNode({ id: "1A" }, "1");

        expect(tree.size()).toBe(2);
        expect(tree.getValue("1")).toBeDefined();
        expect(tree.getValue("1A")).toBeDefined();
    })

    test("Move node", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "2" });
        tree.addNode({ id: "1A" }, "1");

        const result = tree.moveNode("1A", "2");
        const node1Children = tree.getChildrenIds("1");
        const node2Children = tree.getChildrenIds("2");

        expect(result).toBe(true);
        expect(node1Children).toEqual([]);
        expect(node2Children).toEqual(["1A"]);
        expect(tree.size()).toBe(3);
    })

    test("Move node to TreeRoot", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "1A" }, "1");
        
        const result = tree.moveNode("1A", TreeRoot);
        const node1Children = tree.getChildrenIds("1");
        const rootChildren = tree.getChildrenIds(TreeRoot);

        expect(result).toBe(true);
        expect(node1Children).toEqual([]);
        expect(rootChildren).toEqual(["1", "1A"])
    });

    test("Move node noops if parents match", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        const result = tree.moveNode("1", TreeRoot);
        const rootChildren = tree.getChildrenIds(TreeRoot);

        expect(result).toBe(false);
        expect(tree.size()).toBe(1);
        expect(rootChildren).toEqual(["1"]);
    })

    test("Move node bails on invalid parent key", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        const result = tree.moveNode("1", "fake");

        expect(result).toBe(false);
    })

    test("Move node bails on invalid key", () => {
        const tree = atomsTree();

        tree.addNode({ id: "B" });
        const result = tree.moveNode("A", "B");

        expect(result).toBe(false);
    })

    test("Remove node without children", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "2" });
        const result = tree.removeNode("2");

        expect(result).toBe(true);
        expect(tree.size()).toBe(1);
    });

    test("Remove node with children", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "1A" }, "1");
        const result = tree.removeNode("1");

        expect(result).toBe(true);
        expect(tree.size()).toBe(0);
    });

    test("Cannot remove TreeRoot", () => {
        const tree = atomsTree();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = tree.removeNode(TreeRoot as any);

        expect(result).toBe(false);
        expect(tree.size()).toBe(0);
    });

    test("Remove descendents", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "1A" }, "1");
        const result = tree.removeDescendants("1");

        expect(result).toBe(true);
        expect(tree.size()).toBe(1);
    });

    test("Remove descendents of TreeRoot", () => {
        const tree = atomsTree();

        tree.addNode({ id: "1" });
        tree.addNode({ id: "1A" }, "1");
        const result = tree.removeDescendants(TreeRoot);

        expect(result).toBe(true);
        expect(tree.size()).toBe(0);
    })

    test("Has Key for TreeRoot", () => {
        const tree = atomsTree();

        expect(tree.hasKey(TreeRoot)).toBe(true);
    });

    test("Has Key for custom key", () => {
        const tree = atomsTree();
        tree.addNode({ id: "five" });

        expect(tree.hasKey("five")).toBe(true);
    });

    test("Has key for invalid key", () => {
        const tree = atomsTree();
        
        expect(tree.hasKey("fake")).toBe(false);
    })

});