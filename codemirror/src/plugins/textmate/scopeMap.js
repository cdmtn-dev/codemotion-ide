const RULES = [
    [/^comment/, "cm-tm-comment"],
    [/^string/, "cm-tm-string"],
    [/^constant\.numeric/, "cm-tm-number"],
    [/^constant/, "cm-tm-constant"],
    [/^keyword\.control/, "cm-tm-keyword"],
    [/^keyword\.operator/, "cm-tm-operator"],
    [/^keyword/, "cm-tm-keyword"],
    [/^entity\.name\.function/, "cm-tm-function"],
    [/^entity\.name\.type/, "cm-tm-type"],
    [/^entity\.name\.tag/, "cm-tm-tag"],
    [/^entity\.other\.attribute-name/, "cm-tm-attribute"],
    [/^variable/, "cm-tm-variable"],
    [/^punctuation/, "cm-tm-punctuation"],
];

const cache = new Map();

export function scopesToClass(scopes) {
    const key = scopes[scopes.length - 1] ?? "";
    if (cache.has(key)) return cache.get(key);

    let match = null;
    outer: for (let i = scopes.length - 1; i >= 0; i--) {
        for (const [re, cls] of RULES) {
            if (re.test(scopes[i])) {
                match = cls;
                break outer;
            }
        }
    }

    cache.set(key, match);
    return match;
}
