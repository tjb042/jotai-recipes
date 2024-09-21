import { useRef } from "react";

export function useRenderCount() {

    const renders = useRef(0);
    renders.current++;

    return renders.current;
}