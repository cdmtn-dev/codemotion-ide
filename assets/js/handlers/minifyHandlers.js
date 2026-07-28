export function minifyJSON(json) {
    return JSON.stringify(JSON.parse(json));
}

export function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,>])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim();
}

export function minifyJS(code) {
    let out = "";
    let i = 0;
    const len = code.length;

    let state = "normal";
    let quote = null;
    let prev = "";

    function isWord(c) {
        return /[a-zA-Z0-9_$]/.test(c);
    }

    function lastOut() {
        return out[out.length - 1];
    }

    while (i < len) {
        const c = code[i];
        const n = code[i + 1];

        // ---------- STRING ----------
        if (state === "string") {
            out += c;

            if (c === "\\") {
                out += n;
                i += 2;
                continue;
            }

            if (c === quote) {
                state = "normal";
            }

            i++;
            continue;
        }

        // ---------- TEMPLATE ----------
        if (state === "template") {
            out += c;

            if (c === "\\") {
                out += n;
                i += 2;
                continue;
            }

            if (c === "`") {
                state = "normal";
            }

            i++;
            continue;
        }

        // ---------- REGEX ----------
        if (state === "regex") {
            out += c;

            if (c === "\\") {
                out += n;
                i += 2;
                continue;
            }

            if (c === "/") {
                state = "normal";
            }

            i++;
            continue;
        }

        // ---------- STRING START ----------
        if (c === '"' || c === "'") {
            quote = c;
            state = "string";
            out += c;
            i++;
            continue;
        }

        // ---------- TEMPLATE START ----------
        if (c === "`") {
            state = "template";
            out += c;
            i++;
            continue;
        }

        // ---------- COMMENTS ----------
        if (c === "/" && n === "/") {
            while (i < len && code[i] !== "\n") i++;
            continue;
        }

        if (c === "/" && n === "*") {
            i += 2;
            while (i < len && !(code[i] === "*" && code[i + 1] === "/")) i++;
            i += 2;
            continue;
        }

        // ---------- REGEX DETECTION ----------
        if (c === "/") {
            const prev = lastOut();

            if (!prev || /[({[=,:!&|?;<>+-]/.test(prev)) {
                state = "regex";
                out += c;
                i++;
                continue;
            }
        }

        // ---------- WHITESPACE ----------
        if (/\s/.test(c)) {
            const prev = lastOut();
            const next = code[i + 1];

            if (isWord(prev) && isWord(next)) {
                out += " ";
            }

            i++;
            continue;
        }

        // ---------- REMOVE EXTRA ; ----------
        if (c === ";" && n === "}") {
            i++;
            continue;
        }

        out += c;
        prev = c;
        i++;
    }

    return out.trim();
}
