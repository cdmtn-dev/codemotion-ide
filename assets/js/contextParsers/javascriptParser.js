import { renderSeparator } from "./globals.js";

const CHILD_KEYS = [
    "body",
    "declarations",
    "properties",
    "args",
    "alternate",
    "handler",
    "finalizer",
    "init",
];

export class JavascriptParser {
    getContextChain(ast, row) {
        const chain = [];
        this.traverse(ast, row, chain);
        return chain;
    }

    traverse(node, row, chain) {
        if (!node || typeof node !== "object") return;

        if (node.loc && !this.isRowInLoc(row, node.loc)) return;

        const item = this.nodeToChainItem(node);
        if (item) chain.push(item);

        this.recurse(node, row, chain);
    }

    isRowInLoc(row, loc) {
        return row >= loc.start.line && row <= loc.end.line;
    }

    nodeToChainItem(node) {
        switch (node.type) {
            case "FunctionDeclaration":
            case "FunctionExpression": {
                const name = node.id?.name || "anonymous";
                const prefix = node.isAsync ? "async " : "";
                return { icon: "function", label: `${prefix}${name}()`, class: "function" };
            }

            case "VariableDeclarator": {
                const name = node.id?.name || "";
                if (!name) return null;
                if (node.isArrow || node.isFunction) {
                    const prefix = node.isAsync ? "async " : "";
                    return { icon: "function", label: `${prefix}${name}()`, class: "function" };
                }
                if (node.isAwait) {
                    return { icon: "hourglass", label: `await ${name}`, class: "await" };
                }
                return { icon: "data_object", label: name, class: "variable" };
            }

            case "ClassDeclaration":
                return { icon: "category", label: node.id?.name || "anonymous", class: "class" };

            case "MethodDefinition": {
                const name = node.key?.name || "";
                if (node.isConstructor) {
                    return { icon: "construction", label: "constructor", class: "method" };
                }
                if (node.isGetter) {
                    return { icon: "output", label: `get ${name}`, class: "method" };
                }
                if (node.isSetter) {
                    return { icon: "input", label: `set ${name}`, class: "method" };
                }
                const parts = [];
                if (node.isStatic) parts.push("static");
                if (node.isAsync) parts.push("async");
                parts.push(`${name}()`);
                return {
                    icon: node.isPrivate ? "lock" : node.isProtected ? "shield" : "function",
                    label: parts.join(" "),
                    class: "method",
                };
            }

            case "ClassProperty":
                return {
                    icon:
                        node.isPrivate || node.isProtected
                            ? "lock"
                            : node.isStatic
                              ? "variable_add"
                              : "data_object",
                    label: `${node.isStatic ? "static " : ""}${node.id?.name || ""}`,
                    class: "variable",
                };

            case "ObjectMethod": {
                const prefix = node.isGetter
                    ? "get "
                    : node.isSetter
                      ? "set "
                      : node.isAsync
                        ? "async "
                        : "";
                return {
                    icon: "function",
                    label: `${prefix}${node.id?.name || "anonymous"}()`,
                    class: "method",
                };
            }

            case "Property": {
                const name = node.id?.name || "";
                if (!name) return null;
                if (node.isArrow || node.isFunction) {
                    return {
                        icon: "function",
                        label: `${node.isAsync ? "async " : ""}${name}()`,
                        class: "function",
                    };
                }
                return { icon: "data_object", label: name, class: "variable" };
            }

            case "CallExpression":
                return node.calleeName
                    ? { icon: "deployed_code", label: node.calleeName, class: "object" }
                    : null;

            case "AwaitExpression":
                return node.calleeName
                    ? { icon: "hourglass", label: `await ${node.calleeName}`, class: "await" }
                    : { icon: "hourglass", label: "await", class: "await" };

            case "AssignmentExpression":
                return node.assignTarget
                    ? { icon: "edit", label: node.assignTarget, class: "variable" }
                    : null;

            case "ImportDeclaration":
                return { icon: "download", label: this.formatImport(node), class: "object" };

            case "TSImportEqualsDeclaration":
                return {
                    icon: "download",
                    label: `import${node.importKind === "type" ? " type" : ""} ${node.id?.name || ""} = require(${JSON.stringify(node.source || "")})`,
                    class: "object",
                };

            case "ImportExpression":
                return {
                    icon: "download",
                    label: `import(${JSON.stringify(node.source || "")})`,
                    class: "object",
                };

            case "TryStatement":
                return { icon: "bug_report", label: "try", class: "object" };

            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return {
                    icon: "loop",
                    label:
                        node.type === "ForOfStatement"
                            ? "for...of"
                            : node.type === "ForInStatement"
                              ? "for...in"
                              : "for",
                    class: "object",
                };

            case "WhileStatement":
            case "DoWhileStatement":
                return {
                    icon: "loop",
                    label: node.type === "DoWhileStatement" ? "do...while" : "while",
                    class: "object",
                };

            default:
                return null;
        }
    }

    formatImport(node) {
        const defaults = [];
        const namespaces = [];
        const named = [];

        for (const specifier of node.specifiers || []) {
            if (specifier.type === "ImportDefault") {
                defaults.push(specifier.name);
            } else if (specifier.type === "ImportNamespace") {
                namespaces.push(`* as ${specifier.name}`);
            } else if (specifier.type === "ImportSpecifier") {
                const imported = specifier.imported || specifier.name;
                const alias =
                    imported === specifier.name ? imported : `${imported} as ${specifier.name}`;
                named.push(`${specifier.importKind === "type" ? "type " : ""}${alias}`);
            }
        }

        const source = JSON.stringify(node.source || "");
        const attributes = (node.attributes || [])
            .map((attribute) => `${attribute.key}: ${JSON.stringify(attribute.value)}`)
            .join(", ");
        const suffix = attributes ? ` with { ${attributes} }` : "";
        const phase = node.phase ? ` ${node.phase}` : "";

        if (defaults.length + namespaces.length + named.length === 0) {
            return `import${phase} ${source}${suffix}`;
        }

        const bindings = [...defaults, ...namespaces];
        if (named.length) bindings.push(`{ ${named.join(", ")} }`);
        return `import${node.importKind === "type" ? " type" : phase} ${bindings.join(", ")} from ${source}${suffix}`;
    }

    recurse(node, row, chain) {
        for (const key of CHILD_KEYS) {
            const value = node[key];
            if (Array.isArray(value)) {
                value.forEach((child) => this.traverse(child, row, chain));
            } else if (value && typeof value === "object") {
                this.traverse(value, row, chain);
            }
        }
    }

    renderContext(chain) {
        const container = document.querySelector(".code-structure");
        if (!container) return;

        container.replaceChildren();
        if (chain.length === 0) {
            container.textContent = "No context";
            return;
        }

        chain.forEach((item, index) => {
            const element = document.createElement("div");
            element.className = "context-item";

            const icon = document.createElement("span");
            icon.className = `material-symbols-rounded ${item.class}`;
            icon.style.fontSize = "16px";
            icon.textContent = item.icon;

            const label = document.createElement("span");
            label.textContent = item.label;

            element.append(icon, label);
            container.appendChild(element);

            if (index < chain.length - 1) container.appendChild(renderSeparator());
        });
    }
}
