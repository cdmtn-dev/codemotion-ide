/** Returns a value only when it contains meaningful notification data. */
export function valid(value) {
    if (value === undefined || value === null || value === false)
        return undefined;
    if (Array.isArray(value) && value.length === 0)
        return undefined;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
        return undefined;
    }
    return value;
}
