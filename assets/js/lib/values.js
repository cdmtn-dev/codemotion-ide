/** Returns whether a value is a non-integer number. */
export function isFloat(value) {
    return typeof value === "number" && !Number.isInteger(value);
}
/** Identifies JSON strings containing an array or object. */
export function isStringifiedObject(value) {
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed))
            return "array";
        if (typeof parsed === "object" && parsed !== null)
            return "object";
        return null;
    }
    catch {
        return false;
    }
}
/** Infers the editor's historical scalar type name from a value. */
export function type(value) {
    const text = value.toString().trim();
    if (/^-?\d+$/.test(text))
        return "int";
    if (/^-?\d*\.\d+$/.test(text))
        return "float";
    if (/^(true|false)$/.test(text))
        return "boolean";
    if (/^\[.*\]$/.test(text))
        return "array";
    if (/^\{.*\}$/.test(text))
        return "object";
    return "string";
}
/** Preserves the legacy object check, including its `null` behavior. */
export function isObject(value) {
    return typeof value === "object" && !Array.isArray(value);
}
/** Returns whether a value is an array. */
export function isArray(value) {
    return typeof value === "object" && Array.isArray(value);
}
/** Writes a visually distinct event diagnostic. */
export function eventLog(...args) {
    console.warn("[EVENT LOG] -----------\n", ...args);
}
