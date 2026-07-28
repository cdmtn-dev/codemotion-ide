/** Resolves an extension to the editor mode used by CodeMotion. */
export declare function getCodeByName(name: string | null | undefined, raw?: boolean): string;
/** Formats a Unix timestamp with the placeholders supported by the legacy helper. */
export declare function formatUnix(timestamp: number, format?: string): string;
/** Converts seconds to minutes without rounding. */
export declare function secondsToMinutes(seconds: number): number;
/** Normalizes Windows separators to forward slashes. */
export declare function normalizePath(path: string): string;
/** Applies an alpha channel to a HEX, RGB, or RGBA color. */
export declare function transparentColor(color: string, alpha?: number): string;
