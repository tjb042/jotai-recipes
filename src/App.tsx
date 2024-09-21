import { Provider } from "jotai";
import { ReactNode, useState } from 'react';
import './App.css';
import { atomMap, useAtomMap } from './atoms/atomMap';
import { atomSet, useAtomSet } from './atoms/atomSet';
import { useRenderCount } from './hooks/useRenderCount';
import { TreeTest } from './TreeTest';

function App() {

    const [test, setTest] = useState<"map" | "set" | "tree">("tree");

    return (
        <Provider>
            <div>
                Select test<br />
                <button onClick={() => setTest("map")}>Map</button>
                <button onClick={() => setTest("set")}>Set</button>
                <button onClick={() => setTest("tree")}>Tree</button>
            </div>
            {test === "map" && (
                <div>
                    Map test:
                    <MapOfStuff />
                </div>
            )}
            {test === "set" && (
                <div>
                    Set test:
                    <SetOfStuff />
                </div>
            )}
            {test === "tree" && (
                <div>
                    Tree test:
                    <TreeTest />
                </div>
            )}
        </Provider>
    )
}

const mapAtom = atomMap<string, number>(new Map<string, number>([["Initial Value", 69]]));
let mapCounter = 0;
function MapOfStuff() {

    const map = useAtomMap(mapAtom);
    const elements: ReactNode[] = [];
    const renders = useRenderCount();

    for (const [key, value] of map) {
        elements.push(
            <li key={key} onClick={() => map.set(key, value + 1)}>
                {key}:
                {value}

                <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    map.delete(key);
                }}>x</button>
            </li>
        )
    }

    return (
        <div>
            <div>
                <span>Renders: {renders}</span>
                <button onClick={() => map.set((mapCounter++).toString(), 0)}>
                    Add Item
                </button>
                <button onClick={() => map.clear()}>
                    Clear Items
                </button>
            </div>
            <ul>
                {elements}
            </ul>
        </div>
    )
}

const setAtom = atomSet<string>(new Set<string>(["Initial Value"]));
let setCounter = 0;
function SetOfStuff() {

    const set = useAtomSet(setAtom);
    const elements: ReactNode[] = [];

    for (const value of set.values()) {
        elements.push(
            <li key={value} onClick={() => set.delete(value)}>
                {value}
            </li>
        )
    }

    return (
        <div>
            <div>
                <button onClick={() => set.add((setCounter++).toString())}>
                    Add Item
                </button>
                <button onClick={set.clear}>
                    Clear Items
                </button>
            </div>
            <ul>
                {elements}
            </ul>
        </div>
    )
}

export default App;