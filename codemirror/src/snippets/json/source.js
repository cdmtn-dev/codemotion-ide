export function identifierJSONCompletionSource(context) {
    const word = context.matchBefore(/[\w-]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    let data;
    try {
        data = JSON.parse(context.state.doc.toString());
    } catch {
        return null;
    }

    const keys = new Set();
    function walk(value) {
        if (Array.isArray(value)) {
            value.forEach(walk);
        } else if (value && typeof value === "object") {
            for (const key of Object.keys(value)) {
                keys.add(key);
                walk(value[key]);
            }
        }
    }
    walk(data);

    return {
        from: word.from,
        options: [...keys].map(label => ({ label, type: "property" }))
    };
}