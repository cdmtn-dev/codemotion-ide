import { parseTwemojiString } from "../../assets/js/lib.js";

const BOOLEAN_RE = /\b(true|false)\b/g;
const NUMBER_RE = /(?<!v)(?<!\d\.)(?<!^)\b\d+(?:\.\d+)?\b(?!(?:\.\d|[a-zA-Z]))/g;
const NULL_RE = /\bnull\b/g;
const UNDEFINED_RE = /\bundefined\b/g;

export function parse(content) {
    if (typeof content == "object" && Array.isArray(content)) {
        content = content.join(", ");
    }
    if (content == undefined) {
        content = "undefined";
    }
    if (content == null) {
        content = "null";
    }

    content = content.toString();

    content = content
        .replace(BOOLEAN_RE, `<span class="parse-boolean">$1</span>`)
        .replace(NULL_RE, `<span class="parse-null">null</span>`)
        .replace(UNDEFINED_RE, `<span class="parse-undefined">undefined</span>`)
        .replace(NUMBER_RE, `<span class="parse-number">$&</span>`);

    content = parseTwemojiString(content);

    return pretifyJson(content);
}

export function trimSpaces(value) {
    return value.replaceAll("%%", " ");
}

function pretifyJson(input) {
    if (typeof input !== "string") input = String(input);

    const match = input.match(/\{[\s\S]*\}/);
    if (!match) return input;

    const jsonStr = match[0];

    try {
        const obj = JSON.parse(jsonStr);
        let pretty = JSON.stringify(obj, null, 2);

        pretty = pretty.trim();
        if (pretty.startsWith("{")) pretty = pretty.slice(1);
        if (pretty.endsWith("}")) pretty = pretty.slice(0, -1);

        pretty = pretty.trim();

        return input.replace(jsonStr, `<span class="json">${pretty}</span>`);
    } catch (e) {
        return input;
    }
}

export function createCommandRegex(command) {
    const safeCommand = command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(`\\b${safeCommand}\\{([^}]*)\\}`, "g");
}
