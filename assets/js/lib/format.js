/** Resolves an extension to the editor mode used by CodeMotion. */
export function getCodeByName(name, raw = false) {
    const extension = (name || "").toLowerCase();
    const names = {
        html: "html",
        js: "javascript",
        css: "css",
        json: "json",
        md: "markdown",
        todo: "markdown",
        ps: "prettyscript",
        py: "python",
        php: "php",
    };
    const rawNames = {
        html: "html",
        js: "javascript",
        ps: "prettyscript",
        py: "python",
        md: "markdown",
        css: "css",
        php: "php",
    };
    return raw ? rawNames[extension] || "text" : names[extension] || "plaintext";
}
/** Formats a Unix timestamp with the placeholders supported by the legacy helper. */
export function formatUnix(timestamp, format = "{dd}.{mm}.{yyyy}, {hh}:{ii}:{ss}") {
    const date = new Date(timestamp * 1000);
    const yyyy = String(date.getFullYear());
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const ii = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    if (!format)
        return `${dd}.${mm}, ${hh}:${ii}:${ss}`;
    return format
        .replaceAll("{dd}", dd)
        .replaceAll("{mm}", mm)
        .replaceAll("{hh}", hh)
        .replaceAll("{ii}", ii)
        .replaceAll("{ss}", ss)
        .replaceAll("{yyyy}", yyyy);
}
/** Converts seconds to minutes without rounding. */
export function secondsToMinutes(seconds) {
    return seconds / 60;
}
/** Normalizes Windows separators to forward slashes. */
export function normalizePath(path) {
    return path.replaceAll("\\", "/").replaceAll(/\\/g, "/");
}
/** Applies an alpha channel to a HEX, RGB, or RGBA color. */
export function transparentColor(color, alpha = 1) {
    const normalizedAlpha = Math.max(0, Math.min(1, alpha));
    const normalizedColor = color.trim();
    if (normalizedColor.startsWith("#")) {
        let hex = normalizedColor.slice(1);
        if (hex.length === 3)
            hex = hex
                .split("")
                .map((part) => part + part)
                .join("");
        if (hex.length !== 6)
            throw new Error("Invalid HEX color");
        const red = Number.parseInt(hex.slice(0, 2), 16);
        const green = Number.parseInt(hex.slice(2, 4), 16);
        const blue = Number.parseInt(hex.slice(4, 6), 16);
        return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
    }
    const match = normalizedColor.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
    if (match)
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${normalizedAlpha})`;
    throw new Error("Unsupported color format");
}
