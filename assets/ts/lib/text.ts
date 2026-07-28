/** Escapes a value for insertion into HTML markup. */
export function escapeHtml(value: unknown): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/** Capitalizes the first character. The misspelled name is retained for API compatibility. */
export function capitilize(text: unknown): string {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

/** Returns up to two initials, or the historical `A` fallback. */
export function getInitials(name: string): string {
    if (!name) return "A";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
}

/** Truncates a string and appends an ellipsis when needed. */
export function truncateString(value: string, maxLength: number): string {
    return value.length <= maxLength ? value : value.slice(0, maxLength) + "...";
}

/** Converts HTTP links in plain text to safe external anchors. */
export function linkify(text: string): string {
    return text.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer"><span>$1</span></a>',
    );
}

/** Splits a camel-cased identifier into display words. */
export function splitCamelCase(value: string): string[] {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(" ")
        .map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase(),
        );
}

/** Removes the common leading indentation from a multiline string. */
export function dedent(value: string): string {
    const lines = value.replace(/^\n/, "").split("\n");
    const indents = lines
        .filter((line) => line.trim())
        .map((line) => line.match(/^ */)?.[0].length ?? 0);
    const indent = Math.min(...indents);
    return lines
        .map((line) => line.slice(indent))
        .join("\n")
        .trimEnd();
}
