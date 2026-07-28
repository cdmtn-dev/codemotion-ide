export class DocumentationTypes {
    static types = [
        {
            name: "keyword",
            displayName: "Keyword",
            className: "keyword",
        },
        {
            name: "function",
            displayName: "Function",
            className: "function",
        },
        {
            name: "variable",
            displayName: "Variable",
            className: "variable",
        },
        {
            name: "type",
            displayName: "Type",
            className: "type",
        },
        {
            name: "string",
            displayName: "String",
            className: "string",
        },
        {
            name: "number",
            displayName: "Number",
            className: "number",
        },
        {
            name: "operator",
            displayName: "Operator",
            className: "operator",
        },
    ];

    static list() {
        return DocumentationTypes.types;
    }

    static add(object) {
        DocumentationTypes.types.push(object);
    }
}
