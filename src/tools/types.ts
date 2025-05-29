/**
 * The raw match object returned by the regex.
 */
export interface RawMatch {
    placeholder: string;
    paramNumber?: string;
    paramNameKeys?: string;
    sign?: string;
    padChar?: string;
    leftAlign?: string;
    width?: string;
    precision?: string;
    type: string;
}

/**
 * A placeholder with all the information parsed from the format string.
 */
export interface FormatPlaceholder extends Omit<
    RawMatch,
    'paramNumber' | 'paramNameKeys' | 'sign' | 'leftAlign' | 'width' | 'precision'
> {
    paramNumber?: number;
    paramNameKeys?: string[];
    sign: boolean;
    leftAlign: boolean;
    width?: number;
    precision?: number;
}

export type ParseTree = (string | FormatPlaceholder)[]

export type ArgList = IArguments | unknown[]

// === Formats ===

/**
 * The list of valid format specifiers.
 */
export type FormatSpecifiers = {
    s: string;  // string
    d: number;  // signed decimal
    i: number;  // signed decimal
    f: number;  // float
    b: number;  // integer as binary
    x: number;  // integer as hexadecimal (lower-case)
    X: number;  // integer as hexadecimal (upper-case)
    o: string;  // integers as octal
    t: boolean; // boolean
    T: unknown; // argument type
    v: unknown; // primitive value
    j: unknown; // JSON
};

type ValidSpecifier = keyof FormatSpecifiers;
type ValidValue = FormatSpecifiers[ValidSpecifier];


// === Full matchers ===
// These matchers are used to parse the entire format string.

type MatchSign<T extends string> = T extends `+${infer Rest}` ? MatchPad<Rest> : MatchPad<T>;

type MatchPad<T extends string> = T extends `0${infer Rest}`
    ? MatchAlign<Rest>
    : T extends `'${infer PadChar extends string}${infer Rest}`
        ? PadChar extends `${infer _FirstChar}${''}`
            ? MatchAlign<Rest>
            : [never, '']
        : MatchAlign<T>;

type MatchAlign<T extends string> = T extends `-${infer Rest}`
    ? MatchWidth<Rest>
    : MatchWidth<T>;

type MatchWidth<T extends string> = T extends `${infer S}`
    ? SplitNumber<S> extends [infer Digits extends string, infer Rest extends string]
        ? Digits extends ''
            ? MatchPrecision<T>
            : MatchPrecision<Rest>
        : MatchPrecision<T>
    : MatchPrecision<T>;

type MatchPrecision<T extends string> = T extends `.${infer S}`
    ? SplitNumber<S> extends [infer Digits extends string, infer Rest extends string]
        ? Digits extends ''
            ? MatchType<T>
            : Rest extends `${infer Type extends ValidSpecifier}${infer After}`
                ? [FormatSpecifiers[Type], After]
                : [never, T]
        : never
    : MatchType<T>;

type MatchType<T extends string> = T extends `${infer Type extends ValidSpecifier}${infer Rest}`
    ? [FormatSpecifiers[Type], Rest]
    : T extends `${infer Type extends ValidSpecifier}`
        ? [FormatSpecifiers[Type], '']
        : [never, ''];

/**
 * Takes a string that represents a key path (e.g., "a.b[0].c") and parses it into an array of
 * string parts while handling both dot-separated properties and indexed brackets (e.g., ["a", "b", "0", "c"]).
 *
 * It works recursively by:
 * - Splitting the path at the current indexed brackets.
 * - Further dissecting any dot-separated properties in the extracted portions.
 * - Accumulating the results into the `Out` array.
 */
type SplitKeyPath<
    S extends string,
    Out extends string[] = []
> = S extends `${infer Prop}[${infer Index}]${infer Rest}`
    ? SplitKeyPath<`${Index}${Rest}`, [...Out, ...SplitDots<Prop>]>
    : [...Out, ...SplitDots<S>];

type SplitDots<S extends string> =
    S extends `${infer Head}.${infer Tail}`
        ? [Head, ...SplitDots<Tail>]
        : [S];

/**
 * A recursive type definition that generates a nested object or array structure.
 */
type BuildNested<Path extends string[], T> = Path extends [infer Head extends string, ...infer Tail extends string[]]
    ? Head extends `${number}`
        ? BuildNested<Tail, T>[]
        : { [K in Head]: BuildNested<Tail, T> }
    : T;


// === Helpers ===

/**
 * Split a string into a tuple of digits and the rest of the string.
 */
type SplitNumber<
    S extends string,
    Num extends string = ''
> = S extends `${infer C}${infer R}`
    ? C extends `${number}`
        ? SplitNumber<R, `${Num}${C}`>
        : [Num, `${C}${R}`]
    : [Num, ''];

/**
 * Return a tuple of all indexes already assigned by named placeholders.
 */
type ExtractNamedIndexes<
    D extends PlaceholderDef[],
    Out extends number[] = []
> = D extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
    ? H['type'] extends object
        ? H['index'] extends infer I extends number
            ? I extends 0
                ? ExtractNamedIndexes<T, Out>
                : ExtractNamedIndexes<T, [...Out, I]>
            : never
        : ExtractNamedIndexes<T, Out>
    : Out;

/**
 * Return a tuple of all indexes already assigned by explicitly positioned placeholders
 */
type ExtractIndexes<
    D extends PlaceholderDef[],
    Out extends number[] = []
> = D extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
    ? H['index'] extends infer I extends number
        ? I extends 0
            // Do not include index when it's 0 (implicitly positioned)
            ? ExtractIndexes<T, Out>
            // Include index when it's not 0 (explicitly positioned)
            : ExtractIndexes<T, [...Out, I]>
        : never
    : Out;

/**
 * Find the minimum value in an array.
 */
type MinValue<
    Arr extends number[],
    Default extends number,
    CurrentMin extends number = Arr extends [infer F extends number, ...number[]] ? F : Default
> = Arr extends [infer F extends number, ...infer R extends number[]]
    ? MinValue<
        R,
        Default,
        F extends CurrentMin ? CurrentMin : (F | CurrentMin extends CurrentMin ? F : CurrentMin)
    >
    : CurrentMin;

/**
 * Build a tuple of length `L`.
 */
type BuildTuple<
    L extends number,
    T extends 1[] = []
> = T['length'] extends L
    ? T
    : BuildTuple<L, [...T, 1]>;

/**
 * Check if a number is in a list of numbers.
 */
type Includes<
    List extends number[],
    X extends number
> = List extends [infer F extends number, ...infer R extends number[]]
    ? F extends X
        ? true
        : Includes<R, X>
    : false;

/**
 * Add two numbers together.
 */
type Add<
    A extends number,
    B extends number
> = [...BuildTuple<A>, ...BuildTuple<B>]['length'] & number;

/**
 * Find the next available index.
 *
 * This is a recursive function that finds the next available index in a list of used indexes.
 * It works by:
 * - Incrementing the index by 1.
 * - If the index is already in the list of used indexes, recursively call the function with the incremented index.
 * - If the index is not in the list of used indexes, return the index.
 */
type NextFree<
    Used extends number[],
    Taken extends number[],
    N extends number = 1
> = Includes<Used, N> extends true
    ? NextFree<Used, Taken, Add<N, 1>>
    : Includes<Taken, N> extends true
        ? NextFree<Used, Taken, Add<N, 1>>
        : N;

/**
 * TS trick to have the merged objects expand.
 *   `MergedObject<{ a: string }, { b: string }>`
 *     becomes
 *   `{ a: string, b: string }`
 */
type Expand<T> = T extends infer O
    ? { [K in keyof O]: O[K] }
    : never;

/**
 * Merge two objects.
 */
type MergeObjects<A, B> = Expand<{
    [K in keyof A | keyof B]:
    K extends keyof A & keyof B
        ? A[K] & B[K]
        : K extends keyof B
            ? B[K]
            : K extends keyof A
                ? A[K]
                : never;
}>;

/**
 * Shape of a placeholder definition.
 */
type PlaceholderDef<
    Index extends number = number,
    Type extends ValidValue | object = ValidValue | object
> = {
    index: Index;
    type: Type;
};

// === Arg Collector ===

/**
 * If it finds a placeholder, it returns: [placeholder, string], where string is everything after the placeholder.
 * If it doesn't find a placeholder, it returns nothing.
 *
 * This allows CollectRaw to easily iterate through the "rest" of the string, not mixing parsed placeholders with
 * unparsed text.
 */
type ParseRaw<S extends string> =
    // Named positional: %3$(foo).2f
    S extends `${infer N extends number}$(${infer P})${infer Rest}`
        ? [PlaceholderDef<N, BuildNested<SplitKeyPath<P>, MatchSign<Rest>[0]>>, MatchSign<Rest>[1]]
        // Explicit positional: %2$+d
        : S extends `${infer N extends number}$${infer  Rest}`
            ? [PlaceholderDef<N, MatchSign<Rest>[0]>, MatchSign<Rest>[1]]
            // Default named: %(foo)s
            : S extends `(${infer P})${infer Rest}`
                ? [PlaceholderDef<0, BuildNested<SplitKeyPath<P>, MatchSign<Rest>[0]>>, MatchSign<Rest>[1]]
                // Default: %+06.2f, %-10s, %s, %d, etc.
                : MatchSign<S> extends [infer V extends ValidValue, infer Rest extends string]
                    ? [PlaceholderDef<0, V>, Rest]
                    : never;

/**
 * Collect all placeholders into a list if `{ index, type }`
 */
type CollectRaw<
    S extends string,
    Out extends PlaceholderDef[] = []
> = // Skip escaped "%""
    S extends `%%${infer Tail}`
        ? CollectRaw<Tail, Out>
        // Find each `%`
        : S extends `${infer C}${infer Tail}`
            ? C extends `%`
                // Try to parse as a placeholder
                ? ParseRaw<Tail> extends [infer Info extends PlaceholderDef, infer Rest extends string]
                    // It's a valid placeholder, add to the output list and iterate next
                    ? CollectRaw<Rest, [...Out, Info]>
                    // Not a valid placeholder, iterate next
                    : CollectRaw<Tail, Out>
                : CollectRaw<Tail, Out>
            // We've iterated the whole string, return results
            : Out;

/**
 * Assign implicit indexes to placeholders.
 */
type AssignImplicit<
    D extends PlaceholderDef[],
    Used extends number[],
    NamedSlot extends number = 0,
    Out extends PlaceholderDef[] = [],
    Taken extends number[] = []
> = // Iterate through all placeholders
    D extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
        // Implicitly positioned
        ? H['index'] extends 0
            // Only named placeholders have object types
            ? H['type'] extends object
                // If there is no named placeholder already assigned an index
                ? NamedSlot extends 0
                    ? AssignImplicit<
                        T,
                        Used,
                        NextFree<Used, Taken>,
                        [...Out, PlaceholderDef<NextFree<Used, Taken>, H['type']>],
                        [...Taken, NextFree<Used, Taken>]
                    >
                    : AssignImplicit<T, Used, NamedSlot, [...Out, PlaceholderDef<NamedSlot, H['type']>], Taken>
                : AssignImplicit<
                    T,
                    Used,
                    NamedSlot,
                    [...Out, PlaceholderDef<NextFree<Used, Taken>, H['type']>],
                    [...Taken, NextFree<Used, Taken>]
                >
            : AssignImplicit<T, Used, NamedSlot, [...Out, H], [...Taken, H['index']]>
        : Out;

/**
 * Merge a placeholder into the list of placeholders.
 */
type Upsert<
    Acc extends PlaceholderDef[],
    P extends PlaceholderDef,
    Out extends PlaceholderDef[] = []
> = Acc extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
    ? H['index'] extends P['index']
        ? [
            ...Out,
            {
                index: H["index"];
                type: H['type'] extends object
                    ? P['type'] extends object
                        ? MergeObjects<H['type'], P['type']>
                        : H['type'] | P['type']
                    : H["type"] | P["type"];
            },
            ...T
        ]
        : Upsert<T, P, [...Out, H]>
    : [...Out, P];

/**
 * Merge all placeholders at the same index.
 */
type MergeDefs<
    D extends PlaceholderDef[],
    Out extends PlaceholderDef[] = []
> = D extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
    ? Upsert<Out, H> extends infer U extends PlaceholderDef[]
        ? MergeDefs<T, U>
        : never
    : Out;

/**
 * Find the type for a placeholder at a given index.
 */
type FindType<
    D extends PlaceholderDef[],
    I extends number
> = D extends [infer H extends PlaceholderDef, ...infer T extends PlaceholderDef[]]
    ? H['index'] extends I
        ? H['type']
        : FindType<T, I>
    : never;

/**
 * Build a range of numbers.
 */
type BuildRange<
    N extends number,
    Out extends number[] = []
> = Out['length'] extends N
    ? Out
    : BuildRange<N, [...Out, Add<Out['length'], 1>]>;

/**
 * Turn a list of placeholders into a tuple of argument types.
 */
type ToTuple<
    D extends PlaceholderDef[],
    Indexes extends number[] = BuildRange<D['length']>
> = { [K in keyof Indexes]: FindType<D, Indexes[K]> };

/**
 * The list of arguments to pass to the sprintf function.
 */
export type SprintfArgs<T extends string> =
    // Collect all placeholders into a list if `{ index, type }`
    CollectRaw<T> extends infer Raw extends PlaceholderDef[]
        // Pull out which indexes were explicitly used
        ? ExtractIndexes<Raw> extends infer Used extends number[]
            // Pull out explicit indexes from named placeholders
            ? ExtractNamedIndexes<Raw> extends infer NamedIndexes extends number[]
                // Walk through the list, assigning all implicit indexes to the first available index
                ? AssignImplicit<Raw, Used, NamedIndexes['length'] extends 0 ? 0 : MinValue<NamedIndexes, 0>> extends infer WithImplicits extends PlaceholderDef[]
                    // Merge all placeholders at the same index
                    ? MergeDefs<WithImplicits> extends infer Merged extends PlaceholderDef[]
                        // Finally, turn into a tuple of argument types
                        ? ToTuple<Merged>
                        : never
                    : never
                : never
            : never
        : never;
