import { useRef } from "react";

const symbol = Symbol();
export function useConstant<T>(initialize: () => T) {

    const ref = useRef<T | typeof symbol>(symbol);
    if (ref.current === symbol) {
        ref.current = initialize();
    }

    return ref.current;
}