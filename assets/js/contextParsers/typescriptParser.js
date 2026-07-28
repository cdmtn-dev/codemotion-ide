import { JavascriptParser } from "./javascriptParser.js";

export class TypescriptParser extends JavascriptParser {
    nodeToChainItem(node) {
        switch (node.type) {
            case "InterfaceDeclaration":
                return {
                    icon: "integration_instructions",
                    label: node.id?.name || "",
                    class: "class",
                };

            case "InterfaceMethod": {
                const returnType = node.returnType ? `: ${node.returnType}` : "";
                return {
                    icon: "function",
                    label: `${node.id?.name || ""}${node.isOptional ? "?" : ""}()${returnType}`,
                    class: "method",
                };
            }

            case "InterfaceProperty": {
                const type = node.typeAnnotation ? `: ${node.typeAnnotation}` : "";
                return {
                    icon: node.isReadonly ? "lock" : "data_object",
                    label: `${node.id?.name || ""}${node.isOptional ? "?" : ""}${type}`,
                    class: "variable",
                };
            }

            case "TypeAlias":
                return { icon: "type_specimen", label: node.id?.name || "", class: "class" };

            case "EnumDeclaration":
                return {
                    icon: "format_list_numbered",
                    label: `${node.isConst ? "const " : ""}${node.id?.name || ""}`,
                    class: "class",
                };

            case "EnumMember":
                return { icon: "data_object", label: node.id?.name || "", class: "variable" };

            case "IndexSignature":
                return { icon: "tag", label: "[index]", class: "variable" };

            case "ClassDeclaration": {
                const extendsClause = node.extends?.length
                    ? ` extends ${node.extends.join(", ")}`
                    : "";
                const implementsClause = node.implements?.length
                    ? ` implements ${node.implements.join(", ")}`
                    : "";
                return {
                    icon: node.isAbstract ? "indeterminate_check_box" : "category",
                    label: `${node.id?.name || "anonymous"}${extendsClause}${implementsClause}`,
                    class: "class",
                };
            }

            case "MethodDefinition": {
                const name = node.key?.name || "";
                const returnType = node.returnType ? `: ${node.returnType}` : "";
                if (node.isConstructor) {
                    return { icon: "construction", label: "constructor", class: "method" };
                }
                if (node.isGetter) {
                    return { icon: "output", label: `get ${name}${returnType}`, class: "method" };
                }
                if (node.isSetter) {
                    return { icon: "input", label: `set ${name}`, class: "method" };
                }

                const modifiers = [];
                if (node.isAbstract) modifiers.push("abstract");
                if (node.isOverride) modifiers.push("override");
                if (node.isStatic) modifiers.push("static");
                if (node.isAsync) modifiers.push("async");
                modifiers.push(`${name}()`);

                return {
                    icon: node.isPrivate ? "lock" : node.isProtected ? "shield" : "function",
                    label: `${modifiers.join(" ")}${returnType}`,
                    class: "method",
                };
            }

            case "ClassProperty": {
                const type = node.typeAnnotation ? `: ${node.typeAnnotation}` : "";
                const modifiers = [];
                if (node.isStatic) modifiers.push("static");
                if (node.isReadonly) modifiers.push("readonly");
                if (node.isAbstract) modifiers.push("abstract");
                return {
                    icon: node.isPrivate || node.isProtected ? "lock" : "data_object",
                    label: `${modifiers.length ? `${modifiers.join(" ")} ` : ""}${node.id?.name || ""}${type}`,
                    class: "variable",
                };
            }

            case "FunctionDeclaration": {
                const returnType = node.returnType ? `: ${node.returnType}` : "";
                return {
                    icon: "function",
                    label: `${node.isAsync ? "async " : ""}${node.id?.name || "anonymous"}()${returnType}`,
                    class: "function",
                };
            }

            case "VariableDeclarator": {
                const name = node.id?.name || "";
                if (!name) return null;
                if (node.isArrow || node.isFunction) {
                    const returnType = node.returnType ? `: ${node.returnType}` : "";
                    return {
                        icon: "function",
                        label: `${node.isAsync ? "async " : ""}${name}()${returnType}`,
                        class: "function",
                    };
                }
                if (node.isAwait) return { icon: "await", label: `await ${name}`, class: "await" };
                const type = node.typeAnnotation ? `: ${node.typeAnnotation}` : "";
                return { icon: "data_object", label: `${name}${type}`, class: "variable" };
            }

            default:
                return super.nodeToChainItem(node);
        }
    }
}
