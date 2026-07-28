/** Encodes a UTF-8 string as base64. */
export function toBase64(value: string): string {
    return btoa(unescape(encodeURIComponent(value)));
}

/** Produces the base64 identifier format used by existing DOM elements. */
export function idify(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary).replaceAll("=", "");
}
