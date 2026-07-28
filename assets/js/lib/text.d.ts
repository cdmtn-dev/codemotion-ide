/** Escapes a value for insertion into HTML markup. */
export declare function escapeHtml(value: unknown): string;
/** Capitalizes the first character. The misspelled name is retained for API compatibility. */
export declare function capitilize(text: unknown): string;
/** Returns up to two initials, or the historical `A` fallback. */
export declare function getInitials(name: string): string;
/** Truncates a string and appends an ellipsis when needed. */
export declare function truncateString(value: string, maxLength: number): string;
/** Converts HTTP links in plain text to safe external anchors. */
export declare function linkify(text: string): string;
/** Splits a camel-cased identifier into display words. */
export declare function splitCamelCase(value: string): string[];
/** Removes the common leading indentation from a multiline string. */
export declare function dedent(value: string): string;
