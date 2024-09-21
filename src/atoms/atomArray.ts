type ReadOnlyArray<T> = Pick<Array<T>, 
    "entries" | "every" | "filter" | "find" | "findIndex" | 
    "flat" | "flatMap" | "forEach" | "includes" | "indexOf" | 
    "join" | "keys" | "lastIndexOf" | "length" | "map" | "reduce" |
    "reduceRight" | "slice" | "some" | "toLocaleString" | "toString" |
    "values">;

    // concat, copyWithin, fill, pop, push, reverse, shift, sort, splice, unshift
type AtomArrayActions<T> = 
    { type: "concat" }