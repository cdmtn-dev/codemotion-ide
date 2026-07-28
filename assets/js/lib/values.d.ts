/** Returns whether a value is a non-integer number. */
export declare function isFloat(value: unknown): value is number;
/** Identifies JSON strings containing an array or object. */
export declare function isStringifiedObject(value: string): "array" | "object" | null | false;
/** Infers the editor's historical scalar type name from a value. */
export declare function type(value: {
    toString(): string;
}): string;
/** Preserves the legacy object check, including its `null` behavior. */
export declare function isObject(value: unknown): boolean;
/** Returns whether a value is an array. */
export declare function isArray(value: unknown): value is unknown[];
/** Writes a visually distinct event diagnostic. */
export declare function eventLog(...args: unknown[]): void;
