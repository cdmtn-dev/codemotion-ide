interface RuntimeErrorProperties {
    msg?: string;
    line?: number | null;
    col?: number | null;
    time?: number | null;
    isNull?: boolean;
    win?: unknown;
}
/** Adds a unique runtime result to the errors history window. */
export declare function addRuntimeError({ msg, line, col, time, isNull, }: RuntimeErrorProperties): void;
/** Clears runtime errors and records a successful check result. */
export declare function clearRuntimeErrors(): void;
export {};
