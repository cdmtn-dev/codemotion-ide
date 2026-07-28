export function fromJSONToTextMate(language) {
    const patterns = [];
    const repository = {};
    if (language.comment) {
        repository.comment = {
            match: language.comment,
            name: "comment.line"
        };
        patterns.push({ include: "#comment" });
    }
    if (language.keywords?.length) {
        repository.keywords = {
            patterns: [{
                    match: `\\b(${language.keywords.join("|")})\\b`,
                    name: "keyword.control"
                }]
        };
        patterns.push({ include: "#keywords" });
    }
    if (language.operators?.length) {
        repository.operators = {
            patterns: [{
                    match: `\\b(${language.operators.join("|")})\\b`,
                    name: "keyword.operator"
                }]
        };
        patterns.push({ include: "#operators" });
    }
    if (language.types?.length) {
        repository.types = {
            patterns: [{
                    match: `\\b(${language.types.join("|")})\\b`,
                    name: "entity.name.type"
                }]
        };
        patterns.push({ include: "#types" });
    }
    return {
        scopeName: `source.${language.id}`,
        patterns,
        repository
    };
}
